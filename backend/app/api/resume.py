from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pathlib import Path
import json
from datetime import datetime
import logging

from app.core.config import settings
from app.schemas.resume import ResumeResponse, ResumeListResponse
from app.services.text_extractor import TextExtractor
from app.services.nlp_parser import NLPProcessor
from app.services.data_cleaner import DataCleaner

router = APIRouter()
logger = logging.getLogger(__name__)

RESUME_STORAGE = {}

text_extractor = TextExtractor()
nlp_processor = NLPProcessor()
data_cleaner = DataCleaner()


@router.post("/resume/parse/{file_id}")
async def parse_resume(file_id: str, file_path: Optional[str] = Query(None)):
    """解析简历文件"""
    logger.info(f"Starting to parse resume: {file_id}")

    if not file_id or not file_id.strip():
        raise HTTPException(status_code=400, detail="无效的文件ID")

    if not file_path:
        file_path = str(Path(settings.UPLOAD_DIR) / f"{file_id}.pdf")
        for ext in ['.pdf', '.docx', '.doc', '.txt', '.html']:
            potential_path = str(Path(settings.UPLOAD_DIR) / f"{file_id}{ext}")
            if Path(potential_path).exists():
                file_path = potential_path
                break

    if not Path(file_path).exists():
        logger.warning(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="文件不存在")

    try:
        raw_text = text_extractor.extract(file_path)

        if not raw_text or len(raw_text.strip()) < 10:
            logger.warning(f"Failed to extract text from file: {file_id}")
            raise HTTPException(status_code=400, detail="无法提取文件内容，请确保文件包含可识别的文本")

        parsed_data = nlp_processor.parse(raw_text)

        if not parsed_data or 'data' not in parsed_data:
            raise HTTPException(status_code=500, detail="简历解析失败，未能提取有效数据")

        cleaned_data = data_cleaner.clean(parsed_data, mask_sensitive=False)

        if not cleaned_data or 'data' not in cleaned_data:
            logger.warning(f"Data cleaning returned empty result for: {file_id}")
            cleaned_data = {
                'data': {
                    'basic_info': {},
                    'education': [],
                    'work_experience': [],
                    'skills': {'programming_languages': [], 'frameworks': [], 'tools': [], 'languages': []},
                    'certificates': [],
                    'projects': [],
                    'self_evaluation': None,
                },
                'confidence': 0.0,
                'warnings': [{'field': 'general', 'message': '数据清洗结果为空'}]
            }

        filename = Path(file_path).name
        resume_response = ResumeResponse(
            resume_id=file_id,
            filename=filename,
            parse_time=datetime.now(),
            confidence=cleaned_data['confidence'],
            data=cleaned_data['data'],
            raw_text=cleaned_data.get('raw_text'),
            warnings=cleaned_data.get('warnings', []),
            status="completed"
        )

        RESUME_STORAGE[file_id] = resume_response.model_dump()

        logger.info(f"Resume parsed successfully: {file_id}, confidence: {cleaned_data['confidence']}")

        return resume_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to parse resume {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"简历解析失败: {str(e)}")


@router.get("/resume/{resume_id}")
async def get_resume(resume_id: str):
    """获取简历详情"""
    if resume_id not in RESUME_STORAGE:
        raise HTTPException(status_code=404, detail="简历不存在")
    
    return RESUME_STORAGE[resume_id]


@router.get("/resume")
async def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """获取简历列表"""
    resumes = list(RESUME_STORAGE.values())
    
    resumes.sort(key=lambda x: x.get('parse_time', ''), reverse=True)
    
    total = len(resumes)
    items = resumes[skip:skip + limit]
    
    return ResumeListResponse(total=total, items=items)


@router.delete("/resume/{resume_id}")
async def delete_resume(resume_id: str):
    """删除简历"""
    if resume_id not in RESUME_STORAGE:
        raise HTTPException(status_code=404, detail="简历不存在")
    
    del RESUME_STORAGE[resume_id]
    
    file_extensions = ['.pdf', '.docx', '.doc', '.txt', '.html']
    for ext in file_extensions:
        file_path = Path(settings.UPLOAD_DIR) / f"{resume_id}{ext}"
        if file_path.exists():
            file_path.unlink()
    
    return {"message": "简历已删除"}


@router.put("/resume/{resume_id}")
async def update_resume(resume_id: str, data: dict):
    """更新简历数据"""
    if resume_id not in RESUME_STORAGE:
        raise HTTPException(status_code=404, detail="简历不存在")
    
    RESUME_STORAGE[resume_id]['data'] = data.get('data', RESUME_STORAGE[resume_id]['data'])
    
    return RESUME_STORAGE[resume_id]
