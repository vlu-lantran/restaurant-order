from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int
    notes: Optional[str] = None
    price_at_time: Decimal

class OrderCreate(BaseModel):
    table_id: int
    session_id: str
    total_amount: Decimal
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    table_id: int
    status: str
    total_amount: Decimal
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
