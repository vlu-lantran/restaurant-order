from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid

from app.db.session import get_db
from app.domain.tables.models import Table
from app.domain.orders.models import Order, OrderItem, Receipt
from app.domain.menu.models import MenuItem
from app.domain.tables.schemas import TableBill, BillItem
from app.websockets.manager import manager

router = APIRouter(prefix="/api/tables", tags=["Tables"])

@router.get("", response_model=list[dict])
async def get_all_tables(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Table))
    tables = result.scalars().all()
    return [{"id": t.id, "table_number": t.table_number, "current_session_id": t.current_session_id} for t in tables]

@router.get("/{table_id}/bill", response_model=TableBill)
async def get_table_bill(table_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Table).where(Table.id == table_id))
    table = result.scalars().first()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
        
    session_id = table.current_session_id
    if not session_id:
        return TableBill(table_id=table_id, session_id="", total_amount=0, items=[])
        
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.menu_item))
        .where(Order.table_id == table_id, Order.session_id == session_id)
    )
    orders = result.scalars().all()
    
    total_amount = sum(order.total_amount for order in orders)
    
    bill_items = []
    for order in orders:
        for item in order.items:
            bill_items.append(BillItem(
                id=item.id,
                name=item.menu_item.name if item.menu_item else f"Item {item.menu_item_id}",
                quantity=item.quantity,
                price=item.price_at_time,
                notes=item.notes,
                status=order.status
            ))
            
    return TableBill(
        table_id=table_id,
        session_id=session_id,
        total_amount=total_amount,
        items=bill_items
    )

@router.post("/{table_id}/checkout")
async def checkout_table(table_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Table).where(Table.id == table_id))
    table = result.scalars().first()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
        
    session_id = table.current_session_id
    if not session_id:
        return {"status": "success", "message": "Table already empty"}
        
    # Get all orders for this session to calculate total
    result = await db.execute(
        select(Order).where(Order.table_id == table_id, Order.session_id == session_id)
    )
    orders = result.scalars().all()
    
    if any(order.status != "Served" for order in orders):
        raise HTTPException(status_code=400, detail="Cannot checkout: Not all items are served.")
        
    total_amount = sum(order.total_amount for order in orders)
    
    # Create Receipt
    if total_amount > 0:
        receipt_number = f"RCPT-{uuid.uuid4().hex[:6].upper()}"
        receipt = Receipt(
            receipt_number=receipt_number,
            table_id=table_id,
            session_id=session_id,
            total_amount=total_amount
        )
        db.add(receipt)
    
    new_session_id = f"sess_{uuid.uuid4().hex[:8]}"
    table.current_session_id = new_session_id
    await db.commit()
    
    await manager.publish_update({
        "type": "TABLE_CHECKOUT",
        "payload": {"table_id": table_id, "new_session_id": new_session_id}
    })
    
    return {"status": "success", "new_session_id": new_session_id}

@router.post("/{table_id}/call-server")
async def call_server(table_id: int, db: AsyncSession = Depends(get_db)):
    await manager.publish_update({
        "type": "CALL_SERVER",
        "payload": {"table_id": table_id}
    })
    return {"status": "success"}
