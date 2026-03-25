from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import httpx
import hashlib
import time
import json

from app.core.database import get_db
from app.api.auth import get_current_user, create_access_token
from app.models.database import User

router = APIRouter()

WECHAT_APPID = "your_wechat_appid"
WECHAT_SECRET = "your_wechat_secret"

class WechatShareConfig(BaseModel):
    url: str

class WechatMessage(BaseModel):
    openid: str
    template_id: str
    data: dict

@router.get("/config")
async def get_wechat_jsapi_config(url: str):
    async with httpx.AsyncClient() as client:
        token_response = await client.get(
            "https://api.weixin.qq.com/cgi-bin/token",
            params={
                "grant_type": "client_credential",
                "appid": WECHAT_APPID,
                "secret": WECHAT_SECRET
            }
        )
    
    token_data = token_response.json()
    if "errcode" in token_data:
        raise HTTPException(status_code=400, detail=f"获取access_token失败: {token_data.get('errmsg')}")
    
    access_token = token_data["access_token"]
    
    async with httpx.AsyncClient() as client:
        ticket_response = await client.get(
            "https://api.weixin.qq.com/cgi-bin/ticket/getticket",
            params={
                "access_token": access_token,
                "type": "jsapi"
            }
        )
    
    ticket_data = ticket_response.json()
    if ticket_data.get("errcode", 0) != 0:
        raise HTTPException(status_code=400, detail=f"获取jsapi_ticket失败: {ticket_data.get('errmsg')}")
    
    jsapi_ticket = ticket_data["ticket"]
    
    noncestr = hashlib.md5(str(time.time()).encode()).hexdigest()
    timestamp = int(time.time())
    
    string1 = f"jsapi_ticket={jsapi_ticket}&noncestr={noncestr}&timestamp={timestamp}&url={url}"
    signature = hashlib.sha1(string1.encode()).hexdigest()
    
    return {
        "appId": WECHAT_APPID,
        "timestamp": timestamp,
        "nonceStr": noncestr,
        "signature": signature
    }

@router.post("/message")
async def send_wechat_message(
    message_data: WechatMessage,
    current_user: User = Depends(get_current_user)
):
    async with httpx.AsyncClient() as client:
        token_response = await client.get(
            "https://api.weixin.qq.com/cgi-bin/token",
            params={
                "grant_type": "client_credential",
                "appid": WECHAT_APPID,
                "secret": WECHAT_SECRET
            }
        )
    
    token_data = token_response.json()
    if "errcode" in token_data:
        raise HTTPException(status_code=400, detail=f"获取access_token失败")
    
    access_token = token_data["access_token"]
    
    template_data = {
        "touser": message_data.openid,
        "template_id": message_data.template_id,
        "data": message_data.data
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={access_token}",
            json=template_data
        )
    
    result = response.json()
    if result.get("errcode", 0) != 0:
        raise HTTPException(status_code=400, detail=f"发送消息失败: {result.get('errmsg')}")
    
    return {"message": "发送成功", "msgid": result.get("msgid")}

@router.post("/notify/resume_processed")
async def notify_resume_processed(
    resume_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.wechat_openid:
        return {"message": "用户未绑定微信"}
    
    template_id = "your_template_id_for_resume_processed"
    
    template_data = {
        "first": {"value": "您的简历处理完成"},
        "keyword1": {"value": f"简历ID: {resume_id}"},
        "keyword2": {"value": status},
        "remark": {"value": "点击查看详情"}
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.get(
            "https://api.weixin.qq.com/cgi-bin/token",
            params={
                "grant_type": "client_credential",
                "appid": WECHAT_APPID,
                "secret": WECHAT_SECRET
            }
        )
    
    token_data = token_response.json()
    access_token = token_data["access_token"]
    
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={access_token}",
            json={
                "touser": current_user.wechat_openid,
                "template_id": template_id,
                "data": template_data
            }
        )
    
    return {"message": "通知已发送"}

@router.get("/qrcode")
async def get_wechat_qrcode(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    async with httpx.AsyncClient() as client:
        token_response = await client.get(
            "https://api.weixin.qq.com/cgi-bin/token",
            params={
                "grant_type": "client_credential",
                "appid": WECHAT_APPID,
                "secret": WECHAT_SECRET
            }
        )
    
    token_data = token_response.json()
    access_token = token_data["access_token"]
    
    async with httpx.AsyncClient() as client:
        qrcode_response = await client.post(
            f"https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token={access_token}",
            json={
                "expire_seconds": 604800,
                "action_name": "QR_STR_SCENE",
                "action_info": {
                    "scene": {
                        "scene_str": f"bind_{current_user.id}"
                    }
                }
            }
        )
    
    qrcode_data = qrcode_response.json()
    
    return {
        "ticket": qrcode_data.get("ticket"),
        "expire_seconds": qrcode_data.get("expire_seconds"),
        "url": f"https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket={qrcode_data.get('ticket')}"
    }
