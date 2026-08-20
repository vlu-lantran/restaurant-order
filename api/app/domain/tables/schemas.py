from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class BillItem(BaseModel):
    id: int
    name: str
    quantity: int
    price: Decimal
    notes: Optional[str] = None
    status: str

class TableBill(BaseModel):
    table_id: int
    session_id: str
    total_amount: Decimal
    items: List[BillItem]
