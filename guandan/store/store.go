/* ===========================================================
 * MySQL 持久化组件（cherry component）
 *
 * 职责：
 *   - 连接 MySQL（gorm），启动时 AutoMigrate 建表
 *   - 异步写队列落库：一局结束写 gd_round，并累计 gd_player 战绩
 *   - DB 未启用 / 连不上时自动降级为内存模式（不影响打牌）
 *
 * 配置（profile 的 db 段）：见 etc/profile/dev.json
 * 也可用环境变量 GD_MYSQL_DSN 直接覆盖：
 *   root:pass@tcp(127.0.0.1:3306)/guandan?charset=utf8mb4&parseTime=True&loc=Local
 * =========================================================== */
package store

import (
	"os"
	"sync"
	"time"

	cfacade "github.com/cherry-game/cherry/facade"
	clog "github.com/cherry-game/cherry/logger"
	cprofile "github.com/cherry-game/cherry/profile"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const Name = "guandan_store"

// GDRound 一局对战记录
type GDRound struct {
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	RoomID     string    `gorm:"size:16;index" json:"roomId"`
	RoundNo    int       `json:"roundNo"`
	WinnerTeam int       `json:"winnerTeam"`
	UpLevel    int       `json:"upLevel"`
	DoubleDown bool      `json:"doubleDown"`
	Resisted   bool      `json:"resisted"`
	Levels     string    `gorm:"size:32" json:"levels"`
	Ranks      string    `gorm:"size:32" json:"ranks"`
	Players    string    `gorm:"size:128" json:"players"`
	Humans     int       `json:"humans"`
	StartedAt  time.Time `json:"startedAt"`
	EndedAt    time.Time `json:"endedAt"`
	CreatedAt  time.Time `gorm:"index" json:"createdAt"`
}

func (GDRound) TableName() string { return "gd_round" }

// GDPlayer 玩家档案 / 战绩
type GDPlayer struct {
	ID       int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UID      string    `gorm:"size:64;uniqueIndex" json:"uid"`
	Name     string    `gorm:"size:32" json:"name"`
	Rounds   int       `json:"rounds"`
	Wins     int       `json:"wins"`
	Losses   int       `json:"losses"`
	Score    int       `json:"score"`
	LastAt   time.Time `json:"lastAt"`
	CreateAt time.Time `json:"createAt"`
	UpdateAt time.Time `json:"updateAt"`
}

func (GDPlayer) TableName() string { return "gd_player" }

// RoundRecord 待落库的一局结果
type RoundRecord struct {
	RoomID     string
	RoundNo    int
	WinnerTeam int
	UpLevel    int
	DoubleDown bool
	Resisted   bool
	Levels     []int
	Ranks      []int
	Players    []string // 座位名
	UIDs       []string // 座位 uid（空 = 电脑或未提供）
	Humans     int
	StartedAt  time.Time
	EndedAt    time.Time
}

// Component 存储组件
type Component struct {
	cfacade.Component

	mu      sync.RWMutex
	db      *gorm.DB
	enabled bool

	queue  chan RoundRecord
	stopCh chan struct{}
	wg     sync.WaitGroup

	// 简单的运行统计
	written int64
	failed  int64
}

func New() *Component {
	return &Component{
		queue:  make(chan RoundRecord, 512),
		stopCh: make(chan struct{}),
	}
}

func (c *Component) Name() string { return Name }

// Init 连接数据库并建表
func (c *Component) Init() {
	dsn := os.Getenv("GD_MYSQL_DSN")
	if dsn == "" {
		dsn = c.dsnFromProfile()
	}
	if dsn == "" {
		clog.Info("[store] MySQL 未启用（profile.db 未配置或 enable=false），战绩仅存内存")
		return
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		clog.Warnf("[store] 连接 MySQL 失败，降级为内存模式: %v", err)
		return
	}
	sqlDB, err := db.DB()
	if err != nil {
		clog.Warnf("[store] 取 DB 句柄失败: %v", err)
		return
	}
	sqlDB.SetMaxIdleConns(4)
	sqlDB.SetMaxOpenConns(16)
	sqlDB.SetConnMaxLifetime(time.Minute)

	if err := db.AutoMigrate(&GDRound{}, &GDPlayer{}); err != nil {
		clog.Warnf("[store] 建表失败: %v", err)
		return
	}

	c.mu.Lock()
	c.db = db
	c.enabled = true
	c.mu.Unlock()
	clog.Infof("[store] MySQL 已连接，战绩表就绪 (gd_round / gd_player)")
}

func (c *Component) dsnFromProfile() string {
	cfg := cprofile.GetConfig("db")
	if cfg.LastError() != nil {
		return ""
	}
	// 取第一个 enable=true 的库
	for _, group := range cfg.Keys() {
		list := cfg.GetConfig(group)
		for i := 0; i < list.Size(); i++ {
			item := list.GetConfig(i)
			if !item.GetBool("enable", false) {
				continue
			}
			if dsn := item.GetString("dsn", ""); dsn != "" {
				return dsn
			}
			host := item.GetString("host", "127.0.0.1:3306")
			user := item.GetString("user_name", "root")
			pass := item.GetString("password", "")
			name := item.GetString("db_name", "guandan")
			return user + ":" + pass + "@tcp(" + host + ")/" + name + "?charset=utf8mb4&parseTime=True&loc=Local"
		}
	}
	return ""
}

// OnAfterInit 起异步写协程
func (c *Component) OnAfterInit() {
	if !c.Enabled() {
		return
	}
	c.wg.Add(1)
	go c.loop()
}

func (c *Component) loop() {
	defer c.wg.Done()
	for {
		select {
		case rec, ok := <-c.queue:
			if !ok {
				return
			}
			c.write(&rec)
		case <-c.stopCh:
			// 排空剩余队列
			for {
				select {
				case rec := <-c.queue:
					c.write(&rec)
				default:
					return
				}
			}
		}
	}
}

func (c *Component) write(rec *RoundRecord) {
	c.mu.RLock()
	db := c.db
	c.mu.RUnlock()
	if db == nil {
		return
	}

	row := GDRound{
		RoomID: rec.RoomID, RoundNo: rec.RoundNo, WinnerTeam: rec.WinnerTeam,
		UpLevel: rec.UpLevel, DoubleDown: rec.DoubleDown, Resisted: rec.Resisted,
		Levels: itoaSlice(rec.Levels), Ranks: itoaSlice(rec.Ranks),
		Players: joinNames(rec.Players), Humans: rec.Humans,
		StartedAt: rec.StartedAt, EndedAt: rec.EndedAt, CreatedAt: time.Now(),
	}
	if err := db.Create(&row).Error; err != nil {
		c.failed++
		clog.Warnf("[store] 写 gd_round 失败: %v", err)
		return
	}

	// 更新真人战绩
	for i, uid := range rec.UIDs {
		if uid == "" || i >= len(rec.Ranks) {
			continue
		}
		win := 0
		team := 1
		if i%2 == 1 {
			team = 2
		}
		if team == rec.WinnerTeam {
			win = 1
		}
		name := ""
		if i < len(rec.Players) {
			name = rec.Players[i]
		}
		c.upsertPlayer(db, uid, name, win, rec.UpLevel)
	}
	c.written++
}

func (c *Component) upsertPlayer(db *gorm.DB, uid, name string, win, up int) {
	var p GDPlayer
	err := db.Where("uid = ?", uid).First(&p).Error
	now := time.Now()
	if err == gorm.ErrRecordNotFound {
		p = GDPlayer{UID: uid, Name: name, Rounds: 1, Wins: win, Losses: 1 - win,
			Score: win * up, LastAt: now, CreateAt: now, UpdateAt: now}
		if e := db.Create(&p).Error; e != nil {
			clog.Warnf("[store] 建玩家档案失败: %v", e)
		}
		return
	}
	if err != nil {
		clog.Warnf("[store] 查玩家档案失败: %v", err)
		return
	}
	updates := map[string]any{
		"rounds":    gorm.Expr("rounds + 1"),
		"wins":      gorm.Expr("wins + ?", win),
		"losses":    gorm.Expr("losses + ?", 1-win),
		"score":     gorm.Expr("score + ?", win*up),
		"last_at":   now,
		"update_at": now,
	}
	if name != "" {
		updates["name"] = name
	}
	if e := db.Model(&GDPlayer{}).Where("uid = ?", uid).Updates(updates).Error; e != nil {
		clog.Warnf("[store] 更新玩家战绩失败: %v", e)
	}
}

// SaveRound 投递一局结果（非阻塞；队列满则丢弃并告警）
func (c *Component) SaveRound(rec RoundRecord) {
	if !c.Enabled() {
		return
	}
	select {
	case c.queue <- rec:
	default:
		c.failed++
		clog.Warnf("[store] 写队列已满，丢弃一条对局记录 room=%s", rec.RoomID)
	}
}

// Enabled 是否启用数据库
func (c *Component) Enabled() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.enabled && c.db != nil
}

// TopPlayers 排行榜（按积分）
func (c *Component) TopPlayers(n int) []GDPlayer {
	c.mu.RLock()
	db := c.db
	c.mu.RUnlock()
	if db == nil {
		return nil
	}
	var list []GDPlayer
	if err := db.Order("score desc, wins desc").Limit(n).Find(&list).Error; err != nil {
		clog.Warnf("[store] 查排行榜失败: %v", err)
		return nil
	}
	return list
}

// Stats 运行统计
func (c *Component) Stats() map[string]any {
	c.mu.RLock()
	enabled := c.enabled
	c.mu.RUnlock()
	return map[string]any{"enabled": enabled, "written": c.written, "failed": c.failed, "queued": len(c.queue)}
}

// RecentRounds 最近对局
func (c *Component) RecentRounds(n int) []GDRound {
	c.mu.RLock()
	db := c.db
	c.mu.RUnlock()
	if db == nil {
		return nil
	}
	var list []GDRound
	if err := db.Order("id desc").Limit(n).Find(&list).Error; err != nil {
		return nil
	}
	return list
}

func (c *Component) OnBeforeStop() {
	select {
	case <-c.stopCh:
	default:
		close(c.stopCh)
	}
	c.wg.Wait()
}

func (c *Component) OnStop() {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.db != nil {
		if sqlDB, err := c.db.DB(); err == nil {
			_ = sqlDB.Close()
		}
		c.db = nil
		c.enabled = false
	}
}

/* ---------------- 小工具 ---------------- */

func itoaSlice(v []int) string {
	out := ""
	for i, n := range v {
		if i > 0 {
			out += ","
		}
		out += itoa(n)
	}
	return out
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	buf := [12]byte{}
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}

func joinNames(names []string) string {
	out := ""
	for i, s := range names {
		if i > 0 {
			out += ","
		}
		out += s
	}
	return out
}
