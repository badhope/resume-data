from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
import logging

from app.schemas.config import (
    CleanOptions, CleanOptionsResponse, StatisticsResponse, StatisticsOverview,
    FieldStatistics, TrendData, ExportTemplate, ExportTemplateCreate,
    HistoryRecord, HistoryListResponse
)
from app.api.resume import RESUME_STORAGE

router = APIRouter()
logger = logging.getLogger(__name__)

CURRENT_OPTIONS = CleanOptions()

EXPORT_TEMPLATES: dict = {
    "default_json": {
        "template_id": "default_json",
        "name": "标准JSON模板",
        "description": "导出所有字段为JSON格式",
        "fields": ["all"],
        "format": "json",
        "created_at": datetime.now(),
        "is_default": True
    },
    "default_excel": {
        "template_id": "default_excel",
        "name": "标准Excel模板",
        "description": "导出基本信息和教育/工作经历",
        "fields": ["basic_info", "education", "work_experience"],
        "format": "excel",
        "created_at": datetime.now(),
        "is_default": True
    },
    "hr_excel": {
        "template_id": "hr_excel",
        "name": "HR专用模板",
        "description": "包含联系方式和关键经历",
        "fields": ["basic_info", "education", "work_experience", "skills"],
        "format": "excel",
        "created_at": datetime.now(),
        "is_default": False
    }
}

HISTORY_RECORDS: List[dict] = []


@router.get("/options", response_model=CleanOptionsResponse)
async def get_clean_options():
    """获取当前清洗选项配置"""
    return CleanOptionsResponse(
        options=CURRENT_OPTIONS,
        updated_at=datetime.now()
    )


@router.put("/options", response_model=CleanOptionsResponse)
async def update_clean_options(options: CleanOptions):
    """更新清洗选项配置"""
    global CURRENT_OPTIONS
    CURRENT_OPTIONS = options
    
    HISTORY_RECORDS.insert(0, {
        "record_id": str(uuid.uuid4()),
        "action": "update_options",
        "details": {"message": "更新清洗选项配置"},
        "created_at": datetime.now()
    })
    
    return CleanOptionsResponse(
        options=CURRENT_OPTIONS,
        updated_at=datetime.now()
    )


@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics():
    """获取统计数据"""
    resumes = list(RESUME_STORAGE.values())
    total = len(resumes)
    
    if total == 0:
        return StatisticsResponse(
            overview=StatisticsOverview(
                total_resumes=0,
                success_count=0,
                failed_count=0,
                avg_confidence=0.0,
                today_uploads=0,
                week_uploads=0
            ),
            field_stats=[],
            trend_data=[]
        )
    
    success_count = sum(1 for r in resumes if r.get("status") == "completed")
    failed_count = total - success_count
    avg_confidence = sum(r.get("confidence", 0) for r in resumes) / total if total > 0 else 0
    
    today = datetime.now().date()
    today_uploads = sum(1 for r in resumes 
                       if datetime.fromisoformat(r.get("parse_time", "1970-01-01")).date() == today)
    
    week_ago = datetime.now().timestamp() - 7 * 24 * 3600
    week_uploads = sum(1 for r in resumes 
                      if datetime.fromisoformat(r.get("parse_time", "1970-01-01")).timestamp() > week_ago)
    
    field_stats = []
    field_names = [
        ("name", "姓名"),
        ("gender", "性别"),
        ("phone", "手机"),
        ("email", "邮箱"),
        ("location", "地址"),
        ("education", "教育经历"),
        ("work_experience", "工作经历"),
        ("skills", "专业技能"),
    ]
    
    for field_key, field_name in field_names:
        success = 0
        for r in resumes:
            data = r.get("data", {})
            if field_key in ["education", "work_experience", "skills"]:
                if data.get(field_key) and len(data.get(field_key, [])) > 0:
                    success += 1
            else:
                basic_info = data.get("basic_info", {})
                if basic_info.get(field_key):
                    success += 1
        
        field_stats.append(FieldStatistics(
            field_name=field_name,
            total_count=total,
            success_count=success,
            success_rate=round(success / total * 100, 1) if total > 0 else 0,
            avg_confidence=avg_confidence
        ))
    
    trend_data = []
    date_counts = {}
    for r in resumes:
        parse_time = r.get("parse_time", "")
        if parse_time:
            date_str = parse_time.split("T")[0] if "T" in parse_time else parse_time.split(" ")[0]
            date_counts[date_str] = date_counts.get(date_str, 0) + 1
    
    for date_str in sorted(date_counts.keys(), reverse=True)[:7]:
        trend_data.append(TrendData(
            date=date_str,
            count=date_counts[date_str],
            avg_confidence=avg_confidence
        ))
    
    return StatisticsResponse(
        overview=StatisticsOverview(
            total_resumes=total,
            success_count=success_count,
            failed_count=failed_count,
            avg_confidence=round(avg_confidence, 2),
            today_uploads=today_uploads,
            week_uploads=week_uploads
        ),
        field_stats=field_stats,
        trend_data=trend_data
    )


@router.get("/templates", response_model=List[ExportTemplate])
async def get_export_templates():
    """获取导出模板列表"""
    return [ExportTemplate(**t) for t in EXPORT_TEMPLATES.values()]


@router.post("/templates", response_model=ExportTemplate)
async def create_export_template(template: ExportTemplateCreate):
    """创建导出模板"""
    template_id = str(uuid.uuid4())
    new_template = {
        "template_id": template_id,
        "name": template.name,
        "description": template.description,
        "fields": template.fields,
        "format": template.format,
        "created_at": datetime.now(),
        "is_default": False
    }
    EXPORT_TEMPLATES[template_id] = new_template
    
    return ExportTemplate(**new_template)


@router.delete("/templates/{template_id}")
async def delete_export_template(template_id: str):
    """删除导出模板"""
    if template_id not in EXPORT_TEMPLATES:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    if EXPORT_TEMPLATES[template_id].get("is_default"):
        raise HTTPException(status_code=400, detail="不能删除默认模板")
    
    del EXPORT_TEMPLATES[template_id]
    return {"message": "模板已删除"}


@router.get("/history", response_model=HistoryListResponse)
async def get_history(skip: int = 0, limit: int = 20):
    """获取操作历史"""
    total = len(HISTORY_RECORDS)
    items = [HistoryRecord(**r) for r in HISTORY_RECORDS[skip:skip + limit]]
    
    return HistoryListResponse(total=total, items=items)


@router.post("/history")
async def add_history_record(action: str, resume_id: str = None, details: dict = None):
    """添加操作历史记录"""
    record = {
        "record_id": str(uuid.uuid4()),
        "action": action,
        "resume_id": resume_id,
        "details": details or {},
        "created_at": datetime.now()
    }
    HISTORY_RECORDS.insert(0, record)
    
    if len(HISTORY_RECORDS) > 1000:
        HISTORY_RECORDS[:] = HISTORY_RECORDS[:1000]
    
    return {"message": "记录已添加"}
