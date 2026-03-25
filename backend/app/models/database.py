from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    nickname = Column(String(100), nullable=True)
    avatar = Column(String(500), nullable=True)
    
    wechat_openid = Column(String(100), unique=True, index=True, nullable=True)
    wechat_unionid = Column(String(100), unique=True, index=True, nullable=True)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "phone": self.phone,
            "nickname": self.nickname,
            "avatar": self.avatar,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None
        }

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, default=0)
    file_type = Column(String(20), nullable=True)
    
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(Text, nullable=True)
    
    confidence = Column(Integer, default=0)
    status = Column(String(20), default="pending")
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    parsed_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "confidence": self.confidence,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "parsed_at": self.parsed_at.isoformat() if self.parsed_at else None
        }

class CleaningConfig(Base):
    __tablename__ = "cleaning_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    
    education_filter = Column(Text, default="{}")
    gpa_filter = Column(Text, default="{}")
    experience_filter = Column(Text, default="{}")
    project_filter = Column(Text, default="{}")
    skill_filter = Column(Text, default="{}")
    other_filter = Column(Text, default="{}")
    
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "education_filter": self.education_filter,
            "gpa_filter": self.gpa_filter,
            "experience_filter": self.experience_filter,
            "project_filter": self.project_filter,
            "skill_filter": self.skill_filter,
            "other_filter": self.other_filter,
            "is_default": self.is_default,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class OperationLog(Base):
    __tablename__ = "operation_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    
    action = Column(String(50), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(Integer, nullable=True)
    
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    status = Column(String(20), default="success")
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "details": self.details,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ShippingOrder(Base):
    __tablename__ = "shipping_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    resume_id = Column(Integer, index=True, nullable=False)
    
    recipient_name = Column(String(100), nullable=False)
    recipient_phone = Column(String(20), nullable=False)
    recipient_address = Column(String(500), nullable=False)
    
    carrier = Column(String(50), nullable=False)
    tracking_number = Column(String(100), nullable=True)
    
    status = Column(String(20), default="pending")
    cost = Column(Integer, default=0)
    
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "resume_id": self.resume_id,
            "recipient_name": self.recipient_name,
            "recipient_phone": self.recipient_phone,
            "recipient_address": self.recipient_address,
            "carrier": self.carrier,
            "tracking_number": self.tracking_number,
            "status": self.status,
            "cost": self.cost,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
