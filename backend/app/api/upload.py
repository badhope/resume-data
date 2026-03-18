from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
from datetime import datetime
import aiofiles

from app.core.config import settings

router = APIRouter()

ALLOWED_EXTENSIONS = set(settings.ALLOWED_EXTENSIONS)


def allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型。支持的类型: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    file_id = str(uuid.uuid4())
    file_ext = Path(file.filename).suffix
    save_filename = f"{file_id}{file_ext}"
    save_path = Path(settings.UPLOAD_DIR) / save_filename
    
    async with aiofiles.open(save_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {
        "file_id": file_id,
        "filename": file.filename,
        "save_path": str(save_path),
        "size": len(content),
        "upload_time": datetime.now().isoformat()
    }


@router.post("/upload/batch")
async def upload_files(files: list[UploadFile] = File(...)):
    results = []
    errors = []
    
    for file in files:
        if not allowed_file(file.filename):
            errors.append({
                "filename": file.filename,
                "error": f"不支持的文件类型"
            })
            continue
        
        try:
            file_id = str(uuid.uuid4())
            file_ext = Path(file.filename).suffix
            save_filename = f"{file_id}{file_ext}"
            save_path = Path(settings.UPLOAD_DIR) / save_filename
            
            async with aiofiles.open(save_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            results.append({
                "file_id": file_id,
                "filename": file.filename,
                "size": len(content)
            })
        except Exception as e:
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
