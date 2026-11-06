package server

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	cfacade "github.com/cherry-game/cherry/facade"

	"github.com/zbcx/whmj/internal/store"
)

// APIResponse 统一响应体，与前端 http 封装的判定一致。
type APIResponse struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Data any    `json:"data,omitempty"`
}

// HTTP 账号与资料接口组件。
type HTTP struct {
	cfacade.Component

	addr  string
	store *store.Store
	srv   *http.Server
}

// NewHTTP 创建 HTTP 组件。
func NewHTTP(addr string, st *store.Store) *HTTP {
	return &HTTP{addr: addr, store: st}
}

// Name 组件名，全局唯一。
func (*HTTP) Name() string {
	return "mahjong_http"
}

// Init 启动 HTTP 服务。
func (h *HTTP) Init() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", h.wrap(h.health))
	mux.HandleFunc("/plays", h.wrap(h.listPlays))
	mux.HandleFunc("/login", h.wrap(h.login))
	mux.HandleFunc("/register", h.wrap(h.register))
	mux.HandleFunc("/profile", h.wrap(h.profile))
	mux.HandleFunc("/records", h.wrap(h.records))

	h.srv = &http.Server{
		Addr:              h.addr,
		Handler:           withCORS(mux),
		ReadHeaderTimeout: 8 * time.Second,
	}

	go func() {
		fmt.Printf("[http] listening on %s\n", h.addr)

		if err := h.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("[http] 退出: %v\n", err)
		}
	}()
}

// OnStop 优雅关闭。
func (h *HTTP) OnStop() {
	if h.srv == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_ = h.srv.Shutdown(ctx)
}

// wrap 统一处理失败与编码。
func (h *HTTP) wrap(fn func(r *http.Request) APIResponse) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")

		resp := APIResponse{Code: 200, Msg: "ok"}

		if r.Method == http.MethodOptions {
			_ = json.NewEncoder(w).Encode(resp)

			return
		}

		if r.Method != http.MethodPost && r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)

			return
		}

		out := fn(r)
		if out.Code == 0 {
			out.Code = 200
		}

		_ = json.NewEncoder(w).Encode(out)
	}
}

// withCORS 允许跨域，便于本地调试与同源部署共用一套代码。
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)

			return
		}

		next.ServeHTTP(w, r)
	})
}

func (h *HTTP) health(_ *http.Request) APIResponse {
	return APIResponse{Data: map[string]any{
		"memory": h.store.Memory(),
		"time":   time.Now().Format(time.DateTime),
	}}
}

func (h *HTTP) listPlays(_ *http.Request) APIResponse {
	return APIResponse{Data: map[string]any{"plays": plays}}
}

// credentials 登录注册共用入参。
type credentials struct {
	UserName string `json:"userName"`
	Password string `json:"password"`
	Nick     string `json:"nick"`
}

func (h *HTTP) login(r *http.Request) APIResponse {
	var c credentials

	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		return APIResponse{Code: 400, Msg: "参数格式错误"}
	}

	u, token, err := h.store.Login(c.UserName, c.Password)
	if err != nil {
		return APIResponse{Code: 401, Msg: err.Error()}
	}

	return APIResponse{Data: map[string]any{"token": token, "profile": u}}
}

func (h *HTTP) register(r *http.Request) APIResponse {
	var c credentials

	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		return APIResponse{Code: 400, Msg: "参数格式错误"}
	}

	u, err := h.store.Register(c.UserName, c.Password, c.Nick)
	if err != nil {
		return APIResponse{Code: 400, Msg: err.Error()}
	}

	_, token, err := h.store.Login(c.UserName, c.Password)
	if err != nil {
		return APIResponse{Code: 500, Msg: "注册成功，请重新登录"}
	}

	return APIResponse{Data: map[string]any{"token": token, "profile": u}}
}

// auth 从请求头解析令牌。
func (h *HTTP) auth(r *http.Request) (int64, bool) {
	token := r.URL.Query().Get("token")

	if head := r.Header.Get("Authorization"); strings.HasPrefix(head, "Bearer ") {
		token = strings.TrimPrefix(head, "Bearer ")
	}

	return h.store.UIDByToken(token)
}

func (h *HTTP) profile(r *http.Request) APIResponse {
	uid, ok := h.auth(r)
	if !ok {
		return APIResponse{Code: 401, Msg: "登录已失效"}
	}

	u, err := h.store.Profile(uid)
	if err != nil {
		return APIResponse{Code: 404, Msg: "账号不存在"}
	}

	return APIResponse{Data: u}
}

func (h *HTTP) records(r *http.Request) APIResponse {
	uid, ok := h.auth(r)
	if !ok {
		return APIResponse{Code: 401, Msg: "登录已失效"}
	}

	return APIResponse{Data: map[string]any{"records": h.store.Records(uid, 20)}}
}
