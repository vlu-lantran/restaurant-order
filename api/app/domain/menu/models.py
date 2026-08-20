from sqlalchemy import Column, Integer, String, Boolean, Numeric
from app.db.base import Base

class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    category = Column(String, index=True, nullable=False)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
