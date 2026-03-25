from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.database import User, OperationLog

router = APIRouter()

def log_operation(
    db: Session,
    user_id: Optional[int],
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "success",
    error_message: Optional[str] = None
):
    log = OperationLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=json.dumps(details) if details else None,
        ip_address=ip_address,
        user_agent=user_agent,
        status=status,
        error_message=error_message
    )
    db.add(log)
    db.commit()
    return log

@router.get("/logs")
async def get_operation_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(OperationLog)
    
    if action:
        query = query.filter(OperationLog.action.contains(action))
    if resource_type:
        query = query.filter(OperationLog.resource_type == resource_type)
    if status:
        query = query.filter(OperationLog.status == status)
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(OperationLog.created_at >= start)
        except:
            pass
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(OperationLog.created_at <= end)
        except:
            pass
    
    total = query.count()
    logs = query.order_by(desc(OperationLog.created_at)).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [log.to_dict() for log in logs]
    }

@router.get("/logs/my")
async def get_my_operation_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(OperationLog).filter(OperationLog.user_id == current_user.id)
    
    total = query.count()
    logs = query.order_by(desc(OperationLog.created_at)).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [log.to_dict() for log in logs]
    }

@router.get("/logs/statistics")
async def get_log_statistics(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date = datetime.now() - timedelta(days=days)
    
    logs = db.query(OperationLog).filter(
        OperationLog.created_at >= start_date
    ).all()
    
    action_counts = {}
    daily_counts = {}
    status_counts = {"success": 0, "failed": 0}
    resource_counts = {}
    
    for log in logs:
        if log.action not in action_counts:
            action_counts[log.action] = 0
        action_counts[log.action] += 1
        
        date_key = log.created_at.strftime("%Y-%m-%d")
        if date_key not in daily_counts:
            daily_counts[date_key] = 0
        daily_counts[date_key] += 1
        
        if log.status == "success":
            status_counts["success"] += 1
        else:
            status_counts["failed"] += 1
        
        if log.resource_type:
            if log.resource_type not in resource_counts:
                resource_counts[log.resource_type] = 0
            resource_counts[log.resource_type] += 1
    
    return {
        "period_days": days,
        "total_operations": len(logs),
        "action_distribution": action_counts,
        "daily_trend": daily_counts,
        "status_distribution": status_counts,
        "resource_distribution": resource_counts
    }

@router.get("/logs/export")
async def export_logs(
    format: str = Query("json", regex="^(json|csv)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(OperationLog)
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(OperationLog.created_at >= start)
        except:
            pass
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(OperationLog.created_at <= end)
        except:
            pass
    
    logs = query.order_by(desc(OperationLog.created_at)).all()
    
    if format == "json":
        return {
            "logs": [log.to_dict() for log in logs],
            "count": len(logs)
        }
    else:
        import io
        import csv
        from fastapi.responses import StreamingResponse
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "用户ID", "操作", "资源类型", "资源ID", "状态", "时间", "IP地址"])
        
        for log in logs:
            writer.writerow([
                log.id,
                log.user_id,
                log.action,
                log.resource_type,
                log.resource_id,
                log.status,
                log.created_at.isoformat() if log.created_at else "",
                log.ip_address or ""
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=operation_logs_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
