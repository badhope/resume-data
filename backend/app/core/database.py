from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resume_cleaner.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    from app.models.database import Base, User
    from passlib.context import CryptContext
    
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.nickname == "user").first()
        if not existing_user:
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            default_user = User(
                nickname="user",
                password_hash=pwd_context.hash("888888"),
                is_active=True,
                is_verified=True
            )
            db.add(default_user)
            db.commit()
            print("Default user 'user' created with password '888888'")
    except Exception as e:
        print(f"Error creating default user: {e}")
    finally:
        db.close()
