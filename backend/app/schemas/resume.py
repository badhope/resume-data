from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BasicInfo(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    political_status: Optional[str] = None


class Education(BaseModel):
    school: Optional[str] = None
    degree: Optional[str] = None
    major: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    education_type: Optional[str] = None
    is_full_time: Optional[bool] = None


class WorkExperience(BaseModel):
    company: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    work_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class Skill(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None


class Skills(BaseModel):
    programming_languages: List[Skill] = []
    frameworks: List[str] = []
    tools: List[str] = []
    languages: List[Skill] = []


class Certificate(BaseModel):
    name: Optional[str] = None
    issue_date: Optional[str] = None


class Project(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    tech_stack: List[str] = []
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class ResumeData(BaseModel):
    basic_info: BasicInfo = BasicInfo()
    education: List[Education] = []
    work_experience: List[WorkExperience] = []
    skills: Skills = Skills()
    certificates: List[Certificate] = []
    projects: List[Project] = []
    self_evaluation: Optional[str] = None


class ResumeResponse(BaseModel):
    resume_id: str
    filename: str
    parse_time: datetime
    confidence: float
    data: ResumeData
    raw_text: Optional[str] = None
    warnings: List[dict] = []
    status: str = "completed"


class ResumeListResponse(BaseModel):
    total: int
    items: List[ResumeResponse]
