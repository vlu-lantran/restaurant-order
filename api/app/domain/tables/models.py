from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Table(Base):
    __tablename__ = "tables"
    
    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(Integer, unique=True, index=True, nullable=False)
    current_session_id = Column(String, nullable=True)
