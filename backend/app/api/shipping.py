from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
import httpx
import re

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.database import User, Resume, ShippingOrder

router = APIRouter()

SF_EXPRESS_KEY = "your_sf_key"
SF_EXPRESS_SECRET = "your_sf_secret"

class ShippingAddress(BaseModel):
    recipient_name: str
    recipient_phone: str
    recipient_address: str
    province: str
    city: str
    district: str
    
    @validator('recipient_phone')
    def validate_phone(cls, v):
        if not re.match(r'^1[3-9]\d{9}$', v):
            raise ValueError('手机号格式不正确')
        return v

class CreateShippingOrder(BaseModel):
    resume_id: int
    address: ShippingAddress
    carrier: str = "sf"
    notes: Optional[str] = None

class ShippingStatusUpdate(BaseModel):
    status: str
    tracking_number: Optional[str] = None

@router.post("/shipping")
async def create_shipping_order(
    order_data: CreateShippingOrder,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == order_data.resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="简历不存在")
    
    existing_order = db.query(ShippingOrder).filter(
        ShippingOrder.resume_id == order_data.resume_id,
        ShippingOrder.status.in_(["pending", "shipped"])
    ).first()
    
    if existing_order:
        raise HTTPException(status_code=400, detail="该简历已有进行中的邮寄订单")
    
    shipping_order = ShippingOrder(
        user_id=current_user.id,
        resume_id=order_data.resume_id,
        recipient_name=order_data.address.recipient_name,
        recipient_phone=order_data.address.recipient_phone,
        recipient_address=f"{order_data.address.province}{order_data.address.city}{order_data.address.district}{order_data.address.recipient_address}",
        carrier=order_data.carrier,
        status="pending",
        notes=order_data.notes
    )
    db.add(shipping_order)
    db.commit()
    db.refresh(shipping_order)
    
    return shipping_order.to_dict()

@router.get("/shipping")
async def get_shipping_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ShippingOrder).filter(ShippingOrder.user_id == current_user.id)
    
    if status:
        query = query.filter(ShippingOrder.status == status)
    
    total = query.count()
    orders = query.order_by(ShippingOrder.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [order.to_dict() for order in orders]
    }

@router.get("/shipping/{order_id}")
async def get_shipping_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(ShippingOrder).filter(
        ShippingOrder.id == order_id,
        ShippingOrder.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    return order.to_dict()

@router.get("/shipping/{order_id}/tracking")
async def get_shipping_tracking(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(ShippingOrder).filter(
        ShippingOrder.id == order_id,
        ShippingOrder.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if not order.tracking_number:
        return {"message": "暂无物流信息", "tracks": []}
    
    if order.carrier == "sf":
        tracking_info = await query_sf_tracking(order.tracking_number)
    else:
        tracking_info = {"message": "暂不支持该快递查询", "tracks": []}
    
    return tracking_info

async def query_sf_tracking(tracking_number: str):
    return {
        "carrier": "顺丰速运",
        "tracking_number": tracking_number,
        "tracks": [
            {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "status": "已签收",
                "location": "北京市朝阳区",
                "description": "您的快件已签收，签收人：本人"
            },
            {
                "time": (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
                "status": "派送中",
                "location": "北京市朝阳区",
                "description": "快件正在派送中，派送员：张三，电话：138****8888"
            },
            {
                "time": (datetime.now() - timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S"),
                "status": "运输中",
                "location": "北京市",
                "description": "快件已到达北京转运中心"
            }
        ]
    }

@router.post("/shipping/{order_id}/cancel")
async def cancel_shipping_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(ShippingOrder).filter(
        ShippingOrder.id == order_id,
        ShippingOrder.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order.status not in ["pending"]:
        raise HTTPException(status_code=400, detail="当前状态无法取消")
    
    order.status = "cancelled"
    db.commit()
    
    return {"message": "订单已取消"}

@router.get("/shipping/carriers")
async def get_available_carriers():
    return {
        "carriers": [
            {"code": "sf", "name": "顺丰速运", "logo": "https://example.com/sf.png", "estimated_days": "1-2天"},
            {"code": "jd", "name": "京东物流", "logo": "https://example.com/jd.png", "estimated_days": "1-3天"},
            {"code": "zt", "name": "中通快递", "logo": "https://example.com/zt.png", "estimated_days": "2-4天"},
            {"code": "yt", "name": "圆通速递", "logo": "https://example.com/yt.png", "estimated_days": "2-4天"},
            {"code": "sto", "name": "申通快递", "logo": "https://example.com/sto.png", "estimated_days": "2-4天"},
            {"code": "yunda", "name": "韵达快递", "logo": "https://example.com/yunda.png", "estimated_days": "2-4天"},
        ]
    }

@router.post("/shipping/estimate")
async def estimate_shipping_cost(
    province: str,
    city: str,
    weight: float = 0.5
):
    base_cost = 12
    additional_cost = max(0, weight - 0.5) * 5
    
    remote_provinces = ["西藏", "新疆", "内蒙古", "青海"]
    if any(p in province for p in remote_provinces):
        base_cost += 10
    
    return {
        "weight": weight,
        "base_cost": base_cost,
        "additional_cost": additional_cost,
        "total_cost": base_cost + additional_cost,
        "estimated_days": "1-3天" if province in ["北京", "上海", "广州", "深圳"] else "2-5天"
    }

from datetime import timedelta
