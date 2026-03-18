import re
from typing import Optional, List, Dict, Any
from datetime import datetime


class DataCleaner:
    """数据清洗引擎 - 标准化、脱敏、去重"""
    
    def __init__(self):
        self._init_mappings()
    
    def _init_mappings(self):
        """初始化映射表"""
        self.degree_mapping = {
            '博士': '博士', '博士生': '博士', 'PhD': '博士', 'Ph.D': '博士',
            '硕士': '硕士', '研究生': '硕士', 'MBA': '硕士', 'EMBA': '硕士',
            '本科': '学士', '学士': '学士', '本科': '学士', '大学本科': '学士', 'Bachelor': '学士', 'Bacheler': '学士',
            '大专': '大专', '专科': '大专', '大学专科': '大专',
            '高中': '高中', '高中': '高中', '高中毕业': '高中',
            '中专': '中专', '中职': '中专',
            '职高': '职高', '职业高中': '职高',
        }
        
        self.gender_mapping = {
            '男': '男', '男性': '男', '先生': '男', 'M': '男', 'Male': '男',
            '女': '女', '女性': '女', '女士': '女', 'F': '女', 'Female': '女',
        }
        
        self.work_type_mapping = {
            '全职': '全职', 'Full-time': '全职', 'Full Time': '全职', '正式': '全职',
            '兼职': '兼职', 'Part-time': '兼职', 'Part Time': '兼职', 'Parttime': '兼职',
            '实习': '实习', 'Intern': '实习', '实习生': '实习', '试用期': '实习',
        }
    
    def clean(self, data: dict, mask_sensitive: bool = True) -> dict:
        """清洗数据"""
        cleaned = data.copy()
        
        cleaned['data']['basic_info'] = self._clean_basic_info(
            data['data'].get('basic_info', {}),
            mask_sensitive
        )
        
        cleaned['data']['education'] = self._clean_education(
            data['data'].get('education', [])
        )
        
        cleaned['data']['work_experience'] = self._clean_work_experience(
            data['data'].get('work_experience', [])
        )
        
        cleaned['data']['skills'] = self._clean_skills(
            data['data'].get('skills', {})
        )
        
        cleaned['data']['certificates'] = self._clean_certificates(
            data['data'].get('certificates', [])
        )
        
        cleaned['confidence'] = self._adjust_confidence(cleaned['data'])
        
        cleaned['warnings'] = self._generate_warnings(cleaned['data'])
        
        return cleaned
    
    def _clean_basic_info(self, info: dict, mask_sensitive: bool) -> dict:
        """清洗基本信息"""
        cleaned = {}
        
        if info.get('name'):
            cleaned['name'] = info['name'].strip()
        
        if info.get('gender'):
            gender = info['gender'].strip()
            cleaned['gender'] = self.gender_mapping.get(gender, gender)
        
        if info.get('birth_date'):
            cleaned['birth_date'] = self._clean_date(info['birth_date'])
        
        if info.get('phone'):
            phone = self._clean_phone(info['phone'])
            if phone:
                cleaned['phone'] = phone if not mask_sensitive else self._mask_phone(phone)
        
        if info.get('email'):
            email = info['email'].strip().lower()
            if self._validate_email(email):
                cleaned['email'] = email if not mask_sensitive else self._mask_email(email)
        
        if info.get('location'):
            cleaned['location'] = info['location'].strip()
        
        if info.get('political_status'):
            cleaned['political_status'] = info['political_status'].strip()
        
        return cleaned
    
    def _clean_phone(self, phone: str) -> Optional[str]:
        """清洗手机号"""
        digits = re.sub(r'\D', '', phone)
        if len(digits) == 11 and digits.startswith('1'):
            return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
        return None
    
    def _mask_phone(self, phone: str) -> str:
        """脱敏手机号"""
        if len(phone) >= 11:
            return phone[:3] + '****' + phone[-4:]
        return phone
    
    def _validate_email(self, email: str) -> bool:
        """验证邮箱格式"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def _mask_email(self, email: str) -> str:
        """脱敏邮箱"""
        parts = email.split('@')
        if len(parts) != 2:
            return email
        
        username = parts[0]
        domain = parts[1]
        
        if len(username) <= 2:
            masked_username = username[0] + '*'
        else:
            masked_username = username[0] + '*' * (len(username) - 2) + username[-1]
        
        return f"{masked_username}@{domain}"
    
    def _clean_date(self, date_str: str) -> str:
        """清洗日期格式"""
        date_str = date_str.strip()
        
        date_str = re.sub(r'[年月日]', '-', date_str)
        date_str = re.sub(r'-+', '-', date_str)
        
        if re.match(r'^\d{4}-\d{2}$', date_str):
            return date_str
        if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
            return date_str
        
        match = re.search(r'(\d{4})[-/\.]?(\d{1,2})?[-/\.]?(\d{1,2})?', date_str)
        if match:
            year = match.group(1)
            month = match.group(2) or '01'
            day = match.group(3) or '01'
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        
        return date_str
    
    def _clean_education(self, education: List[dict]) -> List[dict]:
        """清洗教育经历"""
        cleaned_list = []
        
        for edu in education:
            cleaned = {}
            
            if edu.get('school'):
                cleaned['school'] = self._normalize_school_name(edu['school'])
            
            if edu.get('degree'):
                degree = edu['degree'].strip()
                cleaned['degree'] = self.degree_mapping.get(degree, degree)
            
            if edu.get('major'):
                cleaned['major'] = edu['major'].strip()
            
            if edu.get('start_date'):
                cleaned['start_date'] = self._clean_date(edu['start_date'])
            
            if edu.get('end_date'):
                cleaned['end_date'] = self._clean_date(edu['end_date'])
                if '至今' in edu['end_date'] or '在读' in edu['end_date']:
                    cleaned['end_date'] = '至今'
            
            if edu.get('education_type'):
                cleaned['education_type'] = edu['education_type']
            
            if edu.get('is_full_time') is not None:
                cleaned['is_full_time'] = edu['is_full_time']
            
            if cleaned:
                cleaned_list.append(cleaned)
        
        cleaned_list.sort(key=lambda x: x.get('start_date', ''), reverse=True)
        
        return cleaned_list
    
    def _normalize_school_name(self, school: str) -> str:
        """标准化学校名称"""
        school = school.strip()
        
        suffixes = ['大学', '学院', '学校', 'University', 'College']
        
        for suffix in suffixes:
            if not school.endswith(suffix):
                potential = school + suffix
                if len(potential) <= 20:
                    return potential
        
        return school
    
    def _clean_work_experience(self, work_list: List[dict]) -> List[dict]:
        """清洗工作经历"""
        cleaned_list = []
        
        for work in work_list:
            cleaned = {}
            
            if work.get('company'):
                cleaned['company'] = self._normalize_company_name(work['company'])
            
            if work.get('department'):
                cleaned['department'] = work['department'].strip()
            
            if work.get('position'):
                cleaned['position'] = work['position'].strip()
            
            if work.get('work_type'):
                work_type = work['work_type'].strip()
                cleaned['work_type'] = self.work_type_mapping.get(work_type, work_type)
            
            if work.get('start_date'):
                cleaned['start_date'] = self._clean_date(work['start_date'])
            
            if work.get('end_date'):
                cleaned['end_date'] = self._clean_date(work['end_date'])
                if '至今' in str(work.get('end_date', '')):
                    cleaned['end_date'] = '至今'
            
            if work.get('description'):
                desc = work['description'].strip()
                if len(desc) > 500:
                    desc = desc[:500]
                cleaned['description'] = desc
            
            if cleaned:
                cleaned_list.append(cleaned)
        
        cleaned_list.sort(key=lambda x: x.get('start_date', ''), reverse=True)
        
        return cleaned_list
    
    def _normalize_company_name(self, company: str) -> str:
        """标准化公司名称"""
        company = company.strip()
        
        company = re.sub(r'\s*[\(（][^)）]*[\)）]\s*', '', company)
        
        suffixes = ['有限公司', '股份有限公司', '集团有限公司', 
                   'Co., Ltd.', 'Ltd.', 'Inc.', 'Corp.', 'LLC']
        
        for suffix in suffixes:
            if company.endswith(' ' + suffix):
                company = company[:-len(suffix)-1]
                break
        
        if len(company) > 30:
            company = company[:30]
        
        return company
    
    def _clean_skills(self, skills: dict) -> dict:
        """清洗技能信息"""
        cleaned = {
            'programming_languages': [],
            'frameworks': [],
            'tools': [],
            'languages': []
        }
        
        if skills.get('programming_languages'):
            for skill in skills['programming_languages']:
                if isinstance(skill, dict):
                    cleaned['programming_languages'].append({
                        'name': skill.get('name', '').strip(),
                        'level': skill.get('level', '熟练')
                    })
                else:
                    cleaned['programming_languages'].append({
                        'name': str(skill).strip(),
                        'level': '熟练'
                    })
        
        if skills.get('frameworks'):
            cleaned['frameworks'] = list(set([str(f).strip() for f in skills['frameworks']]))
        
        if skills.get('tools'):
            cleaned['tools'] = list(set([str(t).strip() for t in skills['tools']]))
        
        if skills.get('languages'):
            for lang in skills['languages']:
                if isinstance(lang, dict):
                    cleaned['languages'].append({
                        'name': lang.get('name', '').strip(),
                        'level': lang.get('level', '')
                    })
                else:
                    cleaned['languages'].append({
                        'name': str(lang).strip(),
                        'level': ''
                    })
        
        return cleaned
    
    def _clean_certificates(self, certificates: List[dict]) -> List[dict]:
        """清洗证书信息"""
        cleaned_list = []
        
        for cert in certificates:
            cleaned = {}
            
            if cert.get('name'):
                cleaned['name'] = cert['name'].strip()
            
            if cert.get('issue_date'):
                cleaned['issue_date'] = self._clean_date(cert['issue_date'])
            
            if cleaned:
                cleaned_list.append(cleaned)
        
        return cleaned_list
    
    def _adjust_confidence(self, data: dict) -> float:
        """调整可信度"""
        confidence = data.get('confidence', 0.5)
        
        has_name = bool(data.get('basic_info', {}).get('name'))
        has_phone = bool(data.get('basic_info', {}).get('phone'))
        has_email = bool(data.get('basic_info', {}).get('email'))
        
        if not (has_name or has_phone or has_email):
            confidence = min(confidence, 0.3)
        
        return round(confidence, 2)
    
    def _generate_warnings(self, data: dict) -> List[dict]:
        """生成警告信息"""
        warnings = []
        
        if not data.get('basic_info', {}).get('name'):
            warnings.append({'field': 'name', 'message': '未能识别到姓名'})
        
        if not data.get('basic_info', {}).get('phone'):
            warnings.append({'field': 'phone', 'message': '未能识别到手机号'})
        
        if not data.get('education'):
            warnings.append({'field': 'education', 'message': '未能识别到教育背景'})
        
        if not data.get('work_experience'):
            warnings.append({'field': 'work_experience', 'message': '未能识别到工作经历'})
        
        return warnings
