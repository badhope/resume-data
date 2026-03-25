from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
from datetime import datetime
import aiofiles
import logging

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = set(settings.ALLOWED_EXTENSIONS)
MAX_FILE_SIZE = settings.MAX_FILE_SIZE


def allowed_file(filename: str) -> bool:
    if not filename:
        return False
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(
            status_code=400,
            detail="未提供有效的文件"
        )

    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型。支持的类型: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    try:
        content = await file.read()

        if len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="文件内容为空"
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"文件大小超过限制({MAX_FILE_SIZE // (1024*1024)}MB)"
            )

        file_id = str(uuid.uuid4())
        file_ext = Path(file.filename).suffix
        save_filename = f"{file_id}{file_ext}"
        save_path = Path(settings.UPLOAD_DIR) / save_filename

        async with aiofiles.open(save_path, 'wb') as f:
            await f.write(content)

        logger.info(f"File uploaded successfully: {file_id}, size: {len(content)} bytes")

        return {
            "file_id": file_id,
            "filename": file.filename,
            "save_path": str(save_path),
            "size": len(content),
            "upload_time": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"文件上传失败: {str(e)}"
        )


@router.post("/upload/batch")
async def upload_files(files: list[UploadFile] = File(...)):
    results = []
    errors = []
    
    for file in files:
        if not file or not file.filename:
            errors.append({
                "filename": "unknown",
                "error": "未提供有效的文件"
            })
            continue
            
        if not allowed_file(file.filename):
            errors.append({
                "filename": file.filename,
                "error": f"不支持的文件类型。支持的类型: {', '.join(ALLOWED_EXTENSIONS)}"
            })
            continue
        
        try:
            content = await file.read()
            
            if len(content) == 0:
                errors.append({
                    "filename": file.filename,
                    "error": "文件内容为空"
                })
                continue
            
            if len(content) > MAX_FILE_SIZE:
                errors.append({
                    "filename": file.filename,
                    "error": f"文件大小超过限制({MAX_FILE_SIZE // (1024*1024)}MB)"
                })
                continue
            
            file_id = str(uuid.uuid4())
            file_ext = Path(file.filename).suffix
            save_filename = f"{file_id}{file_ext}"
            save_path = Path(settings.UPLOAD_DIR) / save_filename
            
            async with aiofiles.open(save_path, 'wb') as f:
                await f.write(content)
            
            logger.info(f"Batch upload file: {file_id}, size: {len(content)} bytes")
            
            results.append({
                "file_id": file_id,
                "filename": file.filename,
                "size": len(content),
                "upload_time": datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"Batch upload failed for {file.filename}: {str(e)}")
            errors.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {
        "success": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }
