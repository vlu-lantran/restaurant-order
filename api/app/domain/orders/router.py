from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.domain.orders.models import Order, OrderItem, Receipt
from app.domain.tables.models import Table
from app.domain.orders.schemas import OrderCreate, OrderResponse
from app.websockets.manager import manager
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/api/orders", tags=["Orders"])

class OrderStatusUpdate(BaseModel):
    status: str

@router.post("", response_model=OrderResponse)
async def create_order(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    # Create the Order
    new_order = Order(
        table_id=order_in.table_id,
        session_id=order_in.session_id,
        total_amount=order_in.total_amount,
        status="Pending"
    )
    db.add(new_order)
    await db.flush() # flush to get the new_order.id
    
    # Create the OrderItems
    order_items = []
    for item in order_in.items:
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            notes=item.notes,
            price_at_time=item.price_at_time
        )
        db.add(order_item)
        
        # We simulate a joined payload for the UI
        order_items.append({
            "name": f"Item {item.menu_item_id}", # In a real app, query the MenuItem name
            "quantity": item.quantity,
            "notes": item.notes
        })
        
    await db.commit()
    await db.refresh(new_order)
    
    # Publish to Redis so WebSockets can broadcast to kitchen
    payload = jsonable_encoder(new_order)
    payload["items"] = order_items
    
    await manager.publish_update({
        "type": "ORDER_CREATED",
        "payload": payload
    })
    
    return new_order

@router.get("/active")
async def get_active_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.menu_item))
        .join(Table, Order.table_id == Table.id)
        .where(Order.session_id == Table.current_session_id)
        .order_by(Order.created_at.asc())
    )
    orders = result.scalars().all()
    
    kitchen_orders = []
    for o in orders:
        items = [{"name": item.menu_item.name if item.menu_item else f"Item {item.menu_item_id}", "quantity": item.quantity} for item in o.items]
        kitchen_orders.append({
            "id": o.id,
            "table_id": o.table_id,
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else "",
            "items": items
        })
    return kitchen_orders

@router.patch("/{order_id}/status")
async def update_order_status(order_id: int, payload: OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = payload.status
    await db.commit()
    
    await manager.publish_update({
        "type": "ORDER_UPDATED",
        "payload": {"id": order.id, "status": payload.status}
    })
    
    return {"status": "success"}

@router.get("/history")
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Receipt).order_by(Receipt.created_at.desc())
    )
    receipts = result.scalars().all()
    return receipts

@router.get("/history/{session_id}/items")
async def get_history_items(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.menu_item))
        .where(Order.session_id == session_id)
    )
    orders = result.scalars().all()
    
    bill_items = []
    for order in orders:
        for item in order.items:
            bill_items.append({
                "id": item.id,
                "name": item.menu_item.name if item.menu_item else f"Item {item.menu_item_id}",
                "quantity": item.quantity,
                "price": item.price_at_time,
                "notes": item.notes,
                "status": order.status
            })
    return bill_items
