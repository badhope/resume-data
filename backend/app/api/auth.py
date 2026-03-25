from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import re

from app.core.database import get_db
from app.models.database import User

router = APIRouter()

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

SECRET_KEY = "your-secret-key-change-in-production-please"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

class UserRegister(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str
    nickname: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^1[3-9]\d{9}$', v):
            raise ValueError('手机号格式不正确')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('密码长度至少6位')
        return v

class UserLogin(BaseModel):
    account: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: Optional[str]
    phone: Optional[str]
    nickname: Optional[str]
    avatar: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: Optional[str]
    last_login_at: Optional[str]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class WechatLogin(BaseModel):
    code: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    return user

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if not user_data.email and not user_data.phone:
        raise HTTPException(status_code=400, detail="邮箱或手机号至少填写一项")
    
    if user_data.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="邮箱已被注册")
    
    if user_data.phone:
        existing = db.query(User).filter(User.phone == user_data.phone).first()
        if existing:
            raise HTTPException(status_code=400, detail="手机号已被注册")
    
    user = User(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        nickname=user_data.nickname or user_data.email or user_data.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user.to_dict())
    )

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    account = form_data.username
    password = form_data.password
    
    user = None
    if "@" in account:
        user = db.query(User).filter(User.email == account).first()
    elif re.match(r'^1[3-9]\d{9}$', account):
        user = db.query(User).filter(User.phone == account).first()
    else:
        user = db.query(User).filter(User.email == account).first()
        if not user:
            user = db.query(User).filter(User.nickname == account).first()
    
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    
    user.last_login_at = datetime.now()
    db.commit()
    
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user.to_dict())
    )

@router.post("/login/json", response_model=TokenResponse)
async def login_json(login_data: UserLogin, db: Session = Depends(get_db)):
    account = login_data.account
    password = login_data.password
    
    user = None
    if "@" in account:
        user = db.query(User).filter(User.email == account).first()
    elif re.match(r'^1[3-9]\d{9}$', account):
        user = db.query(User).filter(User.phone == account).first()
    else:
        user = db.query(User).filter(User.email == account).first()
        if not user:
            user = db.query(User).filter(User.nickname == account).first()
    
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    
    user.last_login_at = datetime.now()
    db.commit()
    
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user.to_dict())
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.to_dict())

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    nickname: Optional[str] = None,
    avatar: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if nickname:
        current_user.nickname = nickname
    if avatar:
        current_user.avatar = avatar
    db.commit()
    db.refresh(current_user)
    return UserResponse(**current_user.to_dict())

@router.post("/wechat/login", response_model=TokenResponse)
async def wechat_login(wechat_data: WechatLogin, db: Session = Depends(get_db)):
    import httpx
    
    appid = "your_wechat_appid"
    secret = "your_wechat_secret"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.weixin.qq.com/sns/oauth2/access_token",
            params={
                "appid": appid,
                "secret": secret,
                "code": wechat_data.code,
                "grant_type": "authorization_code"
            }
        )
    
    data = response.json()
    
    if "errcode" in data:
        raise HTTPException(status_code=400, detail=f"微信登录失败: {data.get('errmsg')}")
    
    openid = data.get("openid")
    access_token = data.get("access_token")
    
    user = db.query(User).filter(User.wechat_openid == openid).first()
    
    if not user:
        async with httpx.AsyncClient() as client:
            userinfo_response = await client.get(
                f"https://api.weixin.qq.com/sns/userinfo",
                params={
                    "access_token": access_token,
                    "openid": openid
                }
            )
        userinfo = userinfo_response.json()
        
        user = User(
            wechat_openid=openid,
            wechat_unionid=data.get("unionid"),
            nickname=userinfo.get("nickname", "微信用户"),
            avatar=userinfo.get("headimgurl")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    user.last_login_at = datetime.now()
    db.commit()
    
    jwt_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=jwt_token,
        token_type="bearer",
        user=UserResponse(**user.to_dict())
    )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "退出成功"}
