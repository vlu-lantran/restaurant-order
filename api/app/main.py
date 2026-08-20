import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.websockets.manager import manager
from app.domain.orders.router import router as orders_router
from app.domain.tables.router import router as tables_router

app = FastAPI(title="Restaurant Ordering API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders_router)
app.include_router(tables_router)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(manager.listen_to_redis())

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.websocket("/api/ws/kitchen")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
