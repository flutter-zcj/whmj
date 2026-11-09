#!/bin/sh
# 容器启动：先拉起 Go 服务端（内部 9110 HTTP / 9111 WS），再起 nginx 对外服务
set -e

export PORT="${PORT:-8080}"
export MJ_HTTP_ADDR="${MJ_HTTP_ADDR:-127.0.0.1:9110}"

cd /app
/app/bin/whmj -profile /app/config/whmj.json -node "${MJ_NODE_ID:-whmj-1}" \
    -type "${MJ_NODE_TYPE:-whmj}" -http "${MJ_HTTP_ADDR}" &
MJ_PID=$!

term() {
    kill -TERM "$MJ_PID" 2>/dev/null || true
    exit 0
}
trap term INT TERM

# 等服务端就绪再启动 nginx（最多 30 秒，超时也继续，避免容器卡死）
i=1
while [ "$i" -le 30 ]; do
    if wget -qO- "http://${MJ_HTTP_ADDR}/health" >/dev/null 2>&1; then
        break
    fi
    if ! kill -0 "$MJ_PID" 2>/dev/null; then
        echo "[entrypoint] 服务端进程已退出，仅启动 nginx" >&2
        break
    fi
    sleep 1
    i=$((i + 1))
done

echo "[entrypoint] 对外端口 ${PORT}，服务端 HTTP ${MJ_HTTP_ADDR}"
exec /docker-entrypoint.sh nginx -g 'daemon off;'
