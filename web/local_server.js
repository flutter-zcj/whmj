/**
 * 本地验收用静态服务 + 反向代理
 * 静态：/mahjong/ → dist/build/h5
 * 接口：/mahjong-api/* → 127.0.0.1:9101/*
 * 长连：/mahjong-ws/*  → 127.0.0.1:9106/*（WebSocket upgrade 转发）
 */
const http = require('http')
const net = require('net')
const fs = require('fs')
const path = require('path')

const PORT = 8081
const ROOT = path.join(__dirname, 'dist/build/h5')
const API = { host: '127.0.0.1', port: 9101 }
const WS = { host: '127.0.0.1', port: 9106 }

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
  '.map': 'application/json'
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/mahjong-api')) {
    const opt = {
      host: API.host,
      port: API.port,
      path: req.url.slice('/mahjong-api'.length) || '/',
      method: req.method,
      headers: { ...req.headers, host: `${API.host}:${API.port}` }
    }
    const pr = http.request(opt, (pres) => {
      res.writeHead(pres.statusCode, pres.headers)
      pres.pipe(res)
    })
    pr.on('error', () => {
      res.writeHead(502)
      res.end('api upstream error')
    })
    req.pipe(pr)
    return
  }

  let file = req.url.split('?')[0]
  if (file === '/' || file === '') file = '/mahjong/'
  if (file.startsWith('/mahjong/')) file = file.slice('/mahjong'.length)
  if (file === '/' || file === '') file = '/index.html'
  if (!path.extname(file)) file = path.join(file, 'index.html')

  const target = path.join(ROOT, decodeURIComponent(file))
  if (!target.startsWith(ROOT)) {
    res.writeHead(403)
    res.end('forbidden')
    return
  }
  fs.readFile(target, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('not found: ' + file)
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' })
    res.end(buf)
  })
})

server.on('upgrade', (req, socket, head) => {
  const up = net.connect(WS.port, WS.host, () => {
    const p = req.url.replace(/^\/mahjong-ws/, '') || '/'
    let raw = `${req.method} ${p} HTTP/1.1\r\n`
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      raw += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`
    }
    raw += '\r\n'
    up.write(raw)
    if (head && head.length) up.write(head)
    up.pipe(socket)
    socket.pipe(up)
  })
  socket.on('error', () => up.destroy())
  up.on('error', () => socket.destroy())
})

server.listen(PORT, () => console.log('local web on', PORT))
