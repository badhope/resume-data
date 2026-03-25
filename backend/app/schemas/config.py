from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SensitiveMode(str, Enum):
    KEEP = "keep"
    MASK = "mask"
    REMOVE = "remove"


class DateFormat(str, Enum):
    STANDARD = "standard"
    CHINESE = "chinese"
    SLASH = "slash"


class CleanOptions(BaseModel):
    extract_name: bool = True
    extract_gender: bool = True
    extract_birth_date: bool = True
    extract_phone: bool = True
    extract_email: bool = True
    extract_location: bool = True
    extract_education: bool = True
    extract_work: bool = True
    extract_skills: bool = True
    extract_certificates: bool = True
    extract_projects: bool = True
    extract_self_evaluation: bool = True
    
    sensitive_mode: SensitiveMode = SensitiveMode.MASK
    date_format: DateFormat = DateFormat.STANDARD
    normalize_degree: bool = True
    normalize_company: bool = True
    
    class Config:
        use_enum_values = True


class CleanOptionsResponse(BaseModel):
    options: CleanOptions
    updated_at: datetime


class StatisticsOverview(BaseModel):
    total_resumes: int
    success_count: int
    failed_count: int
    avg_confidence: float
    today_uploads: int
    week_uploads: int


class FieldStatistics(BaseModel):
    field_name: str
    total_count: int
    success_count: int
    success_rate: float
    avg_confidence: float


class TrendData(BaseModel):
    date: str
    count: int
    avg_confidence: float


class StatisticsResponse(BaseModel):
    overview: StatisticsOverview
    field_stats: List[FieldStatistics]
    trend_data: List[TrendData]


class ExportTemplate(BaseModel):
    template_id: str
    name: str
    description: Optional[str] = None
    fields: List[str]
    format: str
    created_at: datetime
    is_default: bool = False


class ExportTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    fields: List[str]
    format: str


class HistoryRecord(BaseModel):
    record_id: str
    action: str
    resume_id: Optional[str] = None
    details: Dict[str, Any] = {}
    created_at: datetime


class HistoryListResponse(BaseModel):
    total: int
    items: List[HistoryRecord]
