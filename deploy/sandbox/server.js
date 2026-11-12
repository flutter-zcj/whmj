'use strict'

// 沙箱发布网关：单端口同时提供 H5 静态页、账号接口与两套对局 WebSocket。
// /whmj/ 静态资源、/whmj-api/ 转 9110、/whmj-ws/ 管道到 9111（麻将）、/gd-ws/ 管道到 9120（掼蛋）。

const http = require('http')
const net = require('net')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const ROOT = __dirname
const WEB_DIR = path.join(ROOT, 'whmj')
const PORT = Number(process.env.PORT || 3000)
const API_HOST = '127.0.0.1'
const API_PORT = 9110
const WS_PORT = 9111
const GD_WS_PORT = 9120
const GD_API_PORT = 9121

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
}

/** 启动 Go 游戏服务端（HTTP 9110、WebSocket 9111） */
function startGameServer()
{
  const bin = path.join(ROOT, 'whmj-server')

  if (!fs.existsSync(bin))
  {
    console.error('[boot] 缺少服务端二进制', bin)
    return
  }

  const child = spawn(bin, ['-profile', 'config/whmj.json', '-node', 'whmj-1', '-type', 'whmj', '-http', `${API_HOST}:${API_PORT}`], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  child.stdout.on('data', (buf) => process.stdout.write(`[game] ${buf}`))
  child.stderr.on('data', (buf) => process.stderr.write(`[game] ${buf}`))
  child.on('exit', (code, signal) => console.error('[game] 退出', code, signal))
}

/** 启动掼蛋服务端（WebSocket 9120、运维 9121） */
function startGuandanServer()
{
  const bin = path.join(ROOT, 'gd-server')

  if (!fs.existsSync(bin))
  {
    console.error('[boot] 缺少掼蛋服务端二进制', bin)
    return
  }

  const child = spawn(bin, ['-profile', 'config/guandan.json', '-node', 'guandan-1'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  child.stdout.on('data', (buf) => process.stdout.write(`[guandan] ${buf}`))
  child.stderr.on('data', (buf) => process.stderr.write(`[guandan] ${buf}`))
  child.on('exit', (code, signal) => console.error('[guandan] 退出', code, signal))
}

/** 把 /whmj-api/xxx 转发到 127.0.0.1:9110/xxx */
function proxyApi(req, res)
{
  const upstreamPath = req.url.replace(/^\/whmj-api/, '') || '/'
  const headers = Object.assign({}, req.headers, { host: `${API_HOST}:${API_PORT}` })

  const up = http.request({ host: API_HOST, port: API_PORT, method: req.method, path: upstreamPath, headers }, (upRes) =>
  {
    res.writeHead(upRes.statusCode || 502, upRes.headers)
    upRes.pipe(res)
  })

  up.on('error', (err) =>
  {
    if (!res.headersSent)
    {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
    }

    res.end(JSON.stringify({ code: 502, message: `服务端未就绪：${err.message}` }))
  })

  req.pipe(up)
}

/** 输出静态文件，找不到时回退 index.html 交给前端路由 */
function serveStatic(req, res)
{
  const raw = decodeURIComponent((req.url || '/').split('?')[0])
  const rel = raw.replace(/^\/whmj\/?/, '')
  let file = path.join(WEB_DIR, rel)

  if (rel === '' || rel.endsWith('/'))
  {
    file = path.join(WEB_DIR, 'index.html')
  }

  if (!file.startsWith(WEB_DIR))
  {
    res.writeHead(403)
    res.end('forbidden')
    return
  }

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory())
  {
    file = path.join(WEB_DIR, 'index.html')
  }

  fs.readFile(file, (err, data) =>
  {
    if (err)
    {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('not found')
      return
    }

    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': path.basename(file).startsWith('index-') ? 'public, max-age=31536000' : 'no-cache'
    })
    res.end(data)
  })
}

/** WebSocket 握手原样转发到对应游戏服务端，不做帧解析 */
function proxyWs(req, socket, head, port, prefix)
{
  const upstream = net.connect(port, API_HOST, () =>
  {
    const pathname = req.url.replace(new RegExp('^' + prefix), '') || '/'
    const lines = [`GET ${pathname} HTTP/1.1`]

    for (let i = 0; i < req.rawHeaders.length; i += 2)
    {
      lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`)
    }

    upstream.write(`${lines.join('\r\n')}\r\n\r\n`)

    if (head && head.length)
    {
      upstream.write(head)
    }

    upstream.pipe(socket)
    socket.pipe(upstream)
  })

  upstream.on('error', () => socket.destroy())
  socket.on('error', () => upstream.destroy())
}

startGameServer()
startGuandanServer()

const server = http.createServer((req, res) =>
{
  const pathname = (req.url || '/').split('?')[0]

  if (pathname === '/' || pathname === '')
  {
    res.writeHead(302, { Location: '/whmj/' })
    res.end()
    return
  }

  if (pathname.startsWith('/whmj-api'))
  {
    proxyApi(req, res)
    return
  }

  if (pathname.startsWith('/whmj/') || pathname === '/whmj')
  {
    serveStatic(req, res)
    return
  }

  if (pathname === '/health')
  {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ code: 0, data: 'ok' }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('not found')
})

server.on('upgrade', (req, socket, head) =>
{
  const url = req.url || ''

  if (url.startsWith('/whmj-ws'))
  {
    proxyWs(req, socket, head, WS_PORT, '/whmj-ws')
    return
  }

  if (url.startsWith('/gd-ws'))
  {
    proxyWs(req, socket, head, GD_WS_PORT, '/gd-ws')
    return
  }

  socket.destroy()
})

server.listen(PORT, '0.0.0.0', () => console.log(`[boot] gateway on :${PORT}`))
