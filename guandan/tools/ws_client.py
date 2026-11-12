#!/usr/bin/env python3
"""掼蛋 Go 服务端联调客户端（cherry simple 协议）

帧格式：mid(uint32 BE) + dataLen(uint32 BE) + JSON body
用法：
    python3 ws_client.py --url ws://127.0.0.1:9102/ --name 阿军 --create
"""
import argparse
import asyncio
import json
import ssl
import struct

import websockets

MID = {
    "join": 1, "start": 2, "addBot": 3, "removeBot": 4,
    "play": 5, "pass": 6, "leave": 7, "ping": 8, "ready": 9,
}
NAME = {
    100: "joined", 101: "sync", 102: "settle", 103: "error",
    104: "pong", 105: "hello", 106: "left",
}


def pack(mid: int, body: dict) -> bytes:
    data = json.dumps(body, separators=(",", ":")).encode()
    return struct.pack(">II", mid, len(data)) + data


class Client:
    def __init__(self, url, name, room="", create=False, uid=""):
        self.url = url
        self.name = name
        self.room = room
        self.create = create
        self.uid = uid
        self.ws = None
        self.seat = -1
        self.room_id = ""
        self.last_sync = None
        self.settle = None
        self.errors = []
        self.joined = None
        self.frames = 0

    async def connect(self):
        ctx = None
        if self.url.startswith("wss://"):
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        self.ws = await websockets.connect(self.url, max_size=2 ** 20, ssl=ctx)
        asyncio.create_task(self._reader())
        await self.send("join", {"room": self.room, "name": self.name, "create": self.create, "uid": self.uid})

    async def send(self, t, body=None):
        await self.ws.send(pack(MID[t], body or {}))

    async def _reader(self):
        try:
            async for raw in self.ws:
                if isinstance(raw, str):
                    raw = raw.encode()
                if len(raw) < 8:
                    continue
                mid, ln = struct.unpack(">II", raw[:8])
                body = json.loads(raw[8:8 + ln]) if ln else {}
                self.frames += 1
                kind = NAME.get(mid, str(mid))
                if kind == "joined":
                    self.joined = body
                    self.seat = body.get("seat", -1)
                    self.room_id = body.get("room", "")
                elif kind == "sync":
                    self.last_sync = body
                elif kind == "settle":
                    self.settle = body
                elif kind == "error":
                    self.errors.append(body.get("msg", ""))
                    print(f"[{self.name}] ERROR: {body.get('msg')}")
        except Exception as e:  # noqa: BLE001
            print(f"[{self.name}] reader closed: {e}")

    async def close(self):
        if self.ws:
            await self.ws.close()


async def wait_until(pred, timeout=30, step=0.05):
    loop = asyncio.get_event_loop()
    end = loop.time() + timeout
    while loop.time() < end:
        v = pred()
        if v:
            return v
        await asyncio.sleep(step)
    raise TimeoutError("wait_until timeout")


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="ws://127.0.0.1:9102/")
    ap.add_argument("--name", default="玩家")
    ap.add_argument("--room", default="")
    ap.add_argument("--create", action="store_true")
    ap.add_argument("--uid", default="")
    args = ap.parse_args()

    c = Client(args.url, args.name, args.room, args.create, args.uid)
    await c.connect()
    j = await wait_until(lambda: c.joined, timeout=10)
    print("joined:", j)
    s = await wait_until(lambda: c.last_sync, timeout=10)
    print("sync seats:", [(x["seat"], x["name"], x["empty"]) for x in s["seats"]])
    await c.close()


if __name__ == "__main__":
    asyncio.run(main())
