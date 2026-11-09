# 武汉赖子麻将 H5：前端（uni-app H5 静态站点）+ 服务端（Go / cherry）打包为单一容器
# nginx 对外监听 Render 注入的 $PORT，内部把 /whmj-api、/whmj-ws 代理到本机 Go 进程

############ 1. 前端构建 ############
FROM node:18-alpine AS web-builder
WORKDIR /build/web
ENV HUSKY=0 \
    NODE_OPTIONS=--max-old-space-size=4096
COPY web/package.json web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY web/ ./
RUN npm run build:h5

############ 2. 服务端构建 ############
FROM golang:1.24-alpine AS server-builder
WORKDIR /build/server
ENV CGO_ENABLED=0 \
    GOOS=linux
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ ./
RUN go build -trimpath -ldflags="-s -w" -o /build/out/whmj .

############ 3. 运行镜像 ############
FROM nginx:1.27-alpine

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && rm -f /etc/nginx/conf.d/default.conf

WORKDIR /app
COPY --from=server-builder /build/out/whmj /app/bin/whmj
COPY server/config /app/config
COPY --from=web-builder /build/web/dist/build/h5 /usr/share/nginx/html/whmj
COPY docker/nginx.conf.template /etc/nginx/templates/whmj.conf.template
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh /app/bin/whmj \
    && test -f /usr/share/nginx/html/whmj/index.html

ENV PORT=8080 \
    MJ_HTTP_ADDR=127.0.0.1:9110

EXPOSE 8080

CMD ["/app/entrypoint.sh"]
