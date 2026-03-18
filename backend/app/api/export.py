from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import json
import io
import csv
from typing import Optional

from app.api.resume import RESUME_STORAGE

router = APIRouter()


@router.get("/export/json/{resume_id}")
async def export_json(resume_id: str):
    """导出JSON格式"""
    if resume_id not in RESUME_STORAGE:
        raise HTTPException(status_code=404, detail="简历不存在")
    
    resume = RESUME_STORAGE[resume_id]
    
    json_str = json.dumps(resume, ensure_ascii=False, indent=2, default=str)
    
    buffer = io.BytesIO(json_str.encode('utf-8'))
    
    filename = f"{resume.get('filename', 'resume')}_{resume_id}.json"
    
    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/excel/{resume_id}")
async def export_excel(resume_id: str):
    """导出Excel格式"""
    if resume_id not in RESUME_STORAGE:
        raise HTTPException(status_code=404, detail="简历不存在")
    
    try:
        import pandas as pd
    except ImportError:
        raise HTTPException(status_code=500, detail="Excel导出功能需要安装pandas库")
    
    resume = RESUME_STORAGE[resume_id]
    data = resume.get('data', {})
    basic_info = data.get('basic_info', {})
    
    rows = []
    
    basic_row = {
        '类别': '基本信息',
        '字段': '姓名',
        '值': basic_info.get('name', '')
    }
    rows.append(basic_row)
    
    for key, label in [('gender', '性别'), ('birth_date', '出生日期'), 
                       ('phone', '手机'), ('email', '邮箱'), 
                       ('location', '地址')]:
        rows.append({
            '类别': '基本信息',
            '字段': label,
            '值': basic_info.get(key, '')
        })
    
    for i, edu in enumerate(data.get('education', []), 1):
        rows.append({
            '类别': f'教育经历{i}',
            '字段': '学校',
            '值': edu.get('school', '')
        })
        rows.append({
            '类别': f'教育经历{i}',
            '字段': '学历',
            '值': edu.get('degree', '')
        })
        rows.append({
            '类别': f'教育经历{i}',
            '字段': '专业',
            '值': edu.get('major', '')
        })
        rows.append({
            '类别': f'教育经历{i}',
            '字段': '时间',
            '值': f"{edu.get('start_date', '')} - {edu.get('end_date', '')}"
        })
    
    for i, work in enumerate(data.get('work_experience', []), 1):
        rows.append({
            '类别': f'工作经历{i}',
            '字段': '公司',
            '值': work.get('company', '')
        })
        rows.append({
            '类别': f'工作经历{i}',
            '字段': '职位',
            '值': work.get('position', '')
        })
        rows.append({
            '类别': f'工作经历{i}',
            '字段': '时间',
            '值': f"{work.get('start_date', '')} - {work.get('end_date', '')}"
        })
    
    df = pd.DataFrame(rows)
    
    buffer = io.BytesIO()
    df.to_excel(buffer, index=False, engine='openpyxl')
    buffer.seek(0)
    
    filename = f"{resume.get('filename', 'resume')}_{resume_id}.xlsx"
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/csv/{resume_id}")
async def export_csv(resume_id: str):
    """导出CSV格式"""
    if resume_id not in RESUME_STORAGE:
        raise HTTPException(status_code=404, detail="简历不存在")
    
    resume = RESUME_STORAGE[resume_id]
    data = resume.get('data', {})
    basic_info = data.get('basic_info', {})
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['字段', '值'])
    
    writer.writerow(['姓名', basic_info.get('name', '')])
    writer.writerow(['性别', basic_info.get('gender', '')])
    writer.writerow(['手机', basic_info.get('phone', '')])
    writer.writerow(['邮箱', basic_info.get('email', '')])
    writer.writerow(['地址', basic_info.get('location', '')])
    
    writer.writerow([])
    writer.writerow(['教育经历'])
    for edu in data.get('education', []):
        writer.writerow([
            f"{edu.get('school', '')} {edu.get('degree', '')} {edu.get('major', '')}",
            f"{edu.get('start_date', '')} - {edu.get('end_date', '')}"
        ])
    
    writer.writerow([])
    writer.writerow(['工作经历'])
    for work in data.get('work_experience', []):
        writer.writerow([
            f"{work.get('company', '')} {work.get('position', '')}",
            f"{work.get('start_date', '')} - {work.get('end_date', '')}"
        ])
    
    writer.writerow([])
    writer.writerow(['技能'])
    skills = data.get('skills', {})
    for skill in skills.get('programming_languages', []):
        if isinstance(skill, dict):
            writer.writerow([f"{skill.get('name', '')}", skill.get('level', '')])
        else:
            writer.writerow([str(skill), ''])
    
    buffer = io.BytesIO(output.getvalue().encode('utf-8-sig'))
    
    filename = f"{resume.get('filename', 'resume')}_{resume_id}.csv"
    
    return StreamingResponse(
        buffer,
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/batch/json")
async def export_batch_json(resume_ids: str = Query(..., description="逗号分隔的简历ID")):
    """批量导出JSON"""
    ids = [id.strip() for id in resume_ids.split(',') if id.strip()]
    
    results = []
    for resume_id in ids:
        if resume_id in RESUME_STORAGE:
            results.append(RESUME_STORAGE[resume_id])
    
    if not results:
        raise HTTPException(status_code=404, detail="没有找到指定的简历")
    
    json_str = json.dumps(results, ensure_ascii=False, indent=2, default=str)
    
    buffer = io.BytesIO(json_str.encode('utf-8'))
    
    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=resumes_batch.json"}
    )
