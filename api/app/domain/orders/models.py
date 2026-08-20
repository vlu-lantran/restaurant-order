from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.domain.tables.models import Table
from app.domain.menu.models import MenuItem

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    session_id = Column(String, nullable=False)
    status = Column(String, default="Pending", index=True) # Pending, Cooking, Ready, Served
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    items = relationship("OrderItem", back_populates="order")
    table = relationship("Table")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    notes = Column(String)
    price_at_time = Column(Numeric(10, 2), nullable=False)
    
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")

class Receipt(Base):
    __tablename__ = "receipts"
    
    id = Column(Integer, primary_key=True, index=True)
    receipt_number = Column(String, unique=True, index=True, nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    session_id = Column(String, index=True, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
