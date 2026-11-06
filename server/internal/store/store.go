// Package store 提供账号与战绩的持久化。
//
// 设计原则：数据库或 Redis 不可用时自动降级为内存实现，
// 保证游戏主流程（对局）不被存储层故障阻断，同时把降级状态打印到日志。
package store

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

// ErrUserExists 账号已存在。
var ErrUserExists = errors.New("账号已存在")

// ErrUserNotFound 账号不存在或密码错误。
var ErrUserNotFound = errors.New("账号或密码错误")

// User 账号信息。
type User struct {
	ID        int64  `json:"id"`
	UserName  string `json:"userName"`
	Nick      string `json:"nick"`
	Avatar    string `json:"avatar"`
	Score     int    `json:"score"`
	CreatedAt string `json:"createdAt"`
}

// Record 一局战绩。
type Record struct {
	ID       int64  `json:"id"`
	RoomID   string `json:"roomId"`
	Round    int    `json:"round"`
	Seat     int    `json:"seat"`
	Score    int    `json:"score"`
	Fan      int    `json:"fan"`
	Detail   string `json:"detail"`
	CreateAt string `json:"createAt"`
}

// Store 账号存储门面。
type Store struct {
	db       *sql.DB
	rdb      *redis.Client
	tokenTTL time.Duration

	mu     sync.RWMutex
	users  map[string]*userRow
	tokens map[string]int64
	memory bool
}

type userRow struct {
	id       int64
	userName string
	nick     string
	avatar   string
	hash     []byte
	score    int
	created  time.Time
}

// Options 存储初始化参数。
type Options struct {
	DSN       string
	RedisAddr string
	RedisPass string
	RedisDB   int
}

// Open 连接数据库与 Redis，任一失败都退化为内存模式。
func Open(opt Options) *Store {
	s := &Store{
		users:    make(map[string]*userRow),
		tokens:   make(map[string]int64),
		tokenTTL: 7 * 24 * time.Hour,
	}

	if opt.DSN != "" {
		db, err := sql.Open("postgres", opt.DSN)
		if err == nil {
			db.SetMaxOpenConns(8)
			db.SetMaxIdleConns(4)
			db.SetConnMaxLifetime(time.Hour)

			if err = db.Ping(); err != nil {
				fmt.Printf("[store] postgres 不可用，降级内存模式: %v\n", err)
				_ = db.Close()
			} else {
				s.db = db
				s.ensureSchema()
			}
		}
	}

	if opt.RedisAddr != "" {
		rdb := redis.NewClient(&redis.Options{
			Addr:     opt.RedisAddr,
			Password: opt.RedisPass,
			DB:       opt.RedisDB,
		})

		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		if err := rdb.Ping(ctx).Err(); err != nil {
			fmt.Printf("[store] redis 不可用，令牌改存内存: %v\n", err)
		} else {
			s.rdb = rdb
		}
	}

	s.memory = s.db == nil
	if s.memory {
		s.seedDemoUser()
	}

	return s
}

// Memory 是否运行在内存降级模式。
func (p *Store) Memory() bool {
	return p.memory
}

func (p *Store) ensureSchema() {
	stmts := []string{
		`create table if not exists t_mj_user (
			id bigserial primary key,
			user_name varchar(64) unique not null,
			nick varchar(64) not null default '',
			avatar varchar(255) not null default '',
			password_hash varchar(120) not null,
			score int not null default 0,
			created_at timestamptz not null default now(),
			updated_at timestamptz not null default now()
		)`,
		`create table if not exists t_mj_record (
			id bigserial primary key,
			room_id varchar(40) not null,
			round int not null default 0,
			seat int not null default 0,
			uid bigint not null,
			score int not null default 0,
			fan int not null default 0,
			detail text not null default '',
			created_at timestamptz not null default now()
		)`,
		`create index if not exists idx_mj_record_uid on t_mj_record(uid, id desc)`,
	}

	for _, stmt := range stmts {
		if _, err := p.db.Exec(stmt); err != nil {
			fmt.Printf("[store] 建表失败: %v\n", err)
		}
	}
}

func (p *Store) seedDemoUser() {
	if _, err := p.Register("guest", "123456", "体验玩家"); err != nil && !errors.Is(err, ErrUserExists) {
		fmt.Printf("[store] 初始化体验账号失败: %v\n", err)
	}
}

// Register 注册账号。
func (p *Store) Register(userName, password, nick string) (*User, error) {
	userName = strings.TrimSpace(userName)
	if len(userName) < 3 || len(password) < 6 {
		return nil, errors.New("账号至少 3 位、密码至少 6 位")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	if nick == "" {
		nick = userName
	}

	if p.db != nil {
		var id int64
		err = p.db.QueryRow(
			`insert into t_mj_user(user_name, nick, password_hash) values($1,$2,$3)
			 on conflict (user_name) do nothing returning id`,
			userName, nick, string(hash)).Scan(&id)

		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserExists
		}

		if err != nil {
			return nil, err
		}

		return &User{ID: id, UserName: userName, Nick: nick}, nil
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	if _, ok := p.users[userName]; ok {
		return nil, ErrUserExists
	}

	row := &userRow{
		id:       int64(len(p.users) + 1),
		userName: userName,
		nick:     nick,
		hash:     hash,
		created:  time.Now(),
	}
	p.users[userName] = row

	return &User{ID: row.id, UserName: userName, Nick: nick}, nil
}

// Login 校验密码并签发令牌。
func (p *Store) Login(userName, password string) (*User, string, error) {
	userName = strings.TrimSpace(userName)

	var (
		row  userRow
		err  error
		hash []byte
	)

	if p.db != nil {
		err = p.db.QueryRow(
			`select id, user_name, nick, avatar, password_hash, score, created_at
			 from t_mj_user where user_name=$1`, userName).
			Scan(&row.id, &row.userName, &row.nick, &row.avatar, &hash, &row.score, &row.created)

		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", ErrUserNotFound
		}

		if err != nil {
			return nil, "", err
		}
	} else {
		p.mu.RLock()
		stored, ok := p.users[userName]
		p.mu.RUnlock()

		if !ok {
			return nil, "", ErrUserNotFound
		}

		row = *stored
		hash = stored.hash
	}

	if err = bcrypt.CompareHashAndPassword(hash, []byte(password)); err != nil {
		return nil, "", ErrUserNotFound
	}

	token, err := p.issueToken(row.id)
	if err != nil {
		return nil, "", err
	}

	return &User{
		ID:       row.id,
		UserName: row.userName,
		Nick:     row.nick,
		Avatar:   row.avatar,
		Score:    row.score,
	}, token, nil
}

func (p *Store) issueToken(uid int64) (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}

	token := hex.EncodeToString(buf)

	if p.rdb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		if err := p.rdb.Set(ctx, "mj:token:"+token, uid, p.tokenTTL).Err(); err != nil {
			fmt.Printf("[store] 写入令牌失败: %v\n", err)
		}

		return token, nil
	}

	p.mu.Lock()
	p.tokens[token] = uid
	p.mu.Unlock()

	return token, nil
}

// UIDByToken 用令牌换用户 id。
func (p *Store) UIDByToken(token string) (int64, bool) {
	if token == "" {
		return 0, false
	}

	if p.rdb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		uid, err := p.rdb.Get(ctx, "mj:token:"+token).Int64()
		if err != nil {
			return 0, false
		}

		return uid, true
	}

	p.mu.RLock()
	defer p.mu.RUnlock()

	uid, ok := p.tokens[token]

	return uid, ok
}

// Profile 按 uid 取账号信息。
func (p *Store) Profile(uid int64) (*User, error) {
	if p.db != nil {
		u := &User{}
		err := p.db.QueryRow(
			`select id, user_name, nick, avatar, score, created_at
			 from t_mj_user where id=$1`, uid).
			Scan(&u.ID, &u.UserName, &u.Nick, &u.Avatar, &u.Score, &u.CreatedAt)

		if err != nil {
			return nil, err
		}

		return u, nil
	}

	p.mu.RLock()
	defer p.mu.RUnlock()

	for _, row := range p.users {
		if row.id == uid {
			return &User{ID: row.id, UserName: row.userName, Nick: row.nick,
				Avatar: row.avatar, Score: row.score}, nil
		}
	}

	return nil, ErrUserNotFound
}

// SaveRecord 写入一局战绩。
func (p *Store) SaveRecord(roomID string, round int, seat int, uid int64, score, fan int, detail string) {
	if p.db == nil {
		return
	}

	_, err := p.db.Exec(
		`insert into t_mj_record(room_id, round, seat, uid, score, fan, detail)
		 values($1,$2,$3,$4,$5,$6,$7)`,
		roomID, round, seat, uid, score, fan, detail)
	if err != nil {
		fmt.Printf("[store] 写战绩失败: %v\n", err)
	}

	_, _ = p.db.Exec(`update t_mj_user set score = score + $1, updated_at = now() where id=$2`, score, uid)
}

// Records 查询最近战绩。
func (p *Store) Records(uid int64, limit int) []Record {
	if p.db == nil {
		return []Record{}
	}

	if limit <= 0 || limit > 50 {
		limit = 20
	}

	rows, err := p.db.Query(
		`select id, room_id, round, seat, score, fan, detail, to_char(created_at,'MM-DD HH24:MI')
		 from t_mj_record where uid=$1 order by id desc limit $2`, uid, limit)
	if err != nil {
		return []Record{}
	}

	defer rows.Close()

	out := make([]Record, 0, limit)

	for rows.Next() {
		var r Record
		if err := rows.Scan(&r.ID, &r.RoomID, &r.Round, &r.Seat, &r.Score, &r.Fan, &r.Detail, &r.CreateAt); err == nil {
			out = append(out, r)
		}
	}

	return out
}
