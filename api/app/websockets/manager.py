import asyncio
import json
import os
import redis.asyncio as redis
from fastapi import WebSocket
from typing import List, Dict

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        if REDIS_URL != "memory":
            self.redis = redis.from_url(REDIS_URL, decode_responses=True)
            self.pubsub = self.redis.pubsub()
        else:
            self.redis = None
            self.pubsub = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

    async def listen_to_redis(self):
        if REDIS_URL == "memory":
            return
        await self.pubsub.subscribe("kitchen_updates")
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                data = message["data"]
                await self.broadcast(data)

    async def publish_update(self, data: dict):
        if REDIS_URL == "memory":
            await self.broadcast(json.dumps(data))
        else:
            await self.redis.publish("kitchen_updates", json.dumps(data))

manager = ConnectionManager()
