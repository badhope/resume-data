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
            '博士': '博士', '博士生': '博士', 'PhD': '博士', 'Ph.D.': '博士',
            '硕士': '硕士', '研究生': '硕士', 'MBA': '硕士', 'EMBA': '硕士',
            '本科': '学士', '学士': '学士', '大学本科': '学士', 'Bachelor': '学士',
            '大专': '大专', '专科': '大专', '大学专科': '大专',
            '高中': '高中', '高中毕业': '高中',
            '中专': '中专', '中职': '中专',
            '职高': '职高', '职业高中': '职高',
        }

        self.gender_mapping = {
            '男': '男', '男性': '男', '先生': '男', 'M': '男', 'Male': '男',
            '女': '女', '女性': '女', '女士': '女', 'F': '女', 'Female': '女',
        }

        self.work_type_mapping = {
            '全职': '全职', 'Full-time': '全职', 'Full Time': '全职', '正式': '全职',
            '兼职': '兼职', 'Part-time': '兼职', 'Part Time': '兼职',
            '实习': '实习', 'Intern': '实习', '实习生': '实习', '试用期': '实习',
        }

    def clean(self, data: dict, mask_sensitive: bool = True) -> dict:
        """清洗数据主入口"""
        if not data or not isinstance(data, dict):
            return self._empty_cleaned_result()

        try:
            cleaned = data.copy()

            if 'data' not in cleaned:
                cleaned['data'] = {}

            cleaned['data']['basic_info'] = self._clean_basic_info(
                data.get('data', {}).get('basic_info', {}),
                mask_sensitive
            )

            cleaned['data']['education'] = self._clean_education(
                data.get('data', {}).get('education', [])
            )

            cleaned['data']['work_experience'] = self._clean_work_experience(
                data.get('data', {}).get('work_experience', [])
            )

            cleaned['data']['skills'] = self._clean_skills(
                data.get('data', {}).get('skills', {})
            )

            cleaned['data']['certificates'] = self._clean_certificates(
                data.get('data', {}).get('certificates', [])
            )

            cleaned['data']['projects'] = self._clean_projects(
                data.get('data', {}).get('projects', [])
            )

            cleaned['data']['self_evaluation'] = self._clean_self_evaluation(
                data.get('data', {}).get('self_evaluation')
            )

            if 'confidence' in cleaned:
                cleaned['confidence'] = self._adjust_confidence(cleaned['data'], cleaned['confidence'])
            else:
                cleaned['confidence'] = self._adjust_confidence(cleaned['data'], 0.5)

            if 'warnings' not in cleaned:
                cleaned['warnings'] = []

            cleaned['warnings'] = self._generate_warnings(cleaned['data'])

            return cleaned

        except Exception as e:
            return self._empty_cleaned_result()

    def _empty_cleaned_result(self) -> dict:
        """返回空清洗结果"""
        return {
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
            'warnings': [{'field': 'general', 'message': '数据清洗失败'}]
        }

    def _clean_basic_info(self, info: dict, mask_sensitive: bool) -> dict:
        """清洗基本信息"""
        if not info or not isinstance(info, dict):
            return {}

        cleaned = {}

        if info.get('name'):
            name = info['name'].strip()
            name = re.sub(r'\s+', '', name)
            if len(name) <= 20:
                cleaned['name'] = name

        if info.get('gender'):
            gender = str(info['gender']).strip()
            cleaned['gender'] = self.gender_mapping.get(gender, gender)

        if info.get('birth_date'):
            cleaned['birth_date'] = self._clean_date(str(info['birth_date']))

        if info.get('phone'):
            phone = self._clean_phone(str(info['phone']))
            if phone:
                if mask_sensitive:
                    cleaned['phone'] = self._mask_phone(phone)
                else:
                    cleaned['phone'] = phone

        if info.get('email'):
            email = str(info['email']).strip().lower()
            if self._validate_email(email):
                if mask_sensitive:
                    cleaned['email'] = self._mask_email(email)
                else:
                    cleaned['email'] = email

        if info.get('location'):
            location = str(info['location']).strip()
            if len(location) <= 30:
                cleaned['location'] = location

        if info.get('political_status'):
            cleaned['political_status'] = str(info['political_status']).strip()

        return cleaned

    def _clean_phone(self, phone: str) -> Optional[str]:
        """清洗手机号"""
        digits = re.sub(r'\D', '', phone)
        if len(digits) == 11 and digits.startswith('1'):
            return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
        return phone if len(phone) >= 10 else None

    def _mask_phone(self, phone: str) -> str:
        """脱敏手机号"""
        digits = re.sub(r'\D', '', phone)
        if len(digits) >= 11:
            return f"{digits[:3]}****{digits[-4:]}"
        return phone[:3] + '****' + phone[-4:] if len(phone) >= 8 else phone

    def _validate_email(self, email: str) -> bool:
        """验证邮箱格式"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    def _mask_email(self, email: str) -> str:
        """脱敏邮箱"""
        parts = email.split('@')
        if len(parts) != 2:
            return email

        username, domain = parts

        if len(username) <= 2:
            masked_username = username[0] + '*'
        elif len(username) <= 4:
            masked_username = username[0] + '*' * (len(username) - 1)
        else:
            masked_username = username[0] + '*' * (len(username) - 2) + username[-1]

        return f"{masked_username}@{domain}"

    def _clean_date(self, date_str: str) -> str:
        """清洗日期格式"""
        if not date_str:
            return ''

        date_str = str(date_str).strip()

        date_str = re.sub(r'[年月日]', '-', date_str)
        date_str = re.sub(r'\.年|\.月|\.日', '-', date_str)
        date_str = re.sub(r'-+', '-', date_str)
        date_str = date_str.strip('-')

        if date_str in ['至今', '现在', 'present', 'current', '现在仍在职']:
            return '至今'

        match = re.search(r'(\d{4})[-/\.]?(\d{1,2})?[-/\.]?(\d{1,2})?', date_str)
        if match:
            year = match.group(1)
            month = match.group(2) or '01'
            day = match.group(3) or '01'
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"

        return date_str

    def _clean_education(self, education: List[dict]) -> List[dict]:
        """清洗教育经历"""
        if not education or not isinstance(education, list):
            return []

        cleaned_list = []

        for edu in education:
            if not edu or not isinstance(edu, dict):
                continue

            cleaned = {}

            if edu.get('school'):
                cleaned['school'] = self._normalize_school_name(str(edu['school']))

            if edu.get('degree'):
                degree = str(edu['degree']).strip()
                cleaned['degree'] = self.degree_mapping.get(degree, degree)

            if edu.get('major'):
                major = str(edu['major']).strip()
                if len(major) <= 100:
                    cleaned['major'] = major

            if edu.get('start_date'):
                cleaned['start_date'] = self._clean_date(str(edu['start_date']))

            if edu.get('end_date'):
                end_date = str(edu['end_date'])
                if any(keyword in end_date for keyword in ['至今', '现在', '在读', 'present']):
                    cleaned['end_date'] = '至今'
                else:
                    cleaned['end_date'] = self._clean_date(end_date)

            if edu.get('education_type'):
                cleaned['education_type'] = str(edu['education_type']).strip()

            if 'is_full_time' in edu:
                cleaned['is_full_time'] = bool(edu['is_full_time'])

            if cleaned:
                cleaned_list.append(cleaned)

        cleaned_list.sort(key=lambda x: x.get('start_date', ''), reverse=True)
        return cleaned_list[:5]

    def _normalize_school_name(self, school: str) -> str:
        """标准化学校名称"""
        if not school:
            return ''

        school = school.strip()

        suffixes = ['大学', '学院', '学校', 'Institute', 'University', 'College']
        has_suffix = any(school.endswith(suffix) for suffix in suffixes)

        if not has_suffix and len(school) <= 15:
            for suffix in suffixes:
                potential = school + suffix
                if len(potential) <= 20:
                    return potential

        return school[:30] if len(school) > 30 else school

    def _clean_work_experience(self, work_list: List[dict]) -> List[dict]:
        """清洗工作经历"""
        if not work_list or not isinstance(work_list, list):
            return []

        cleaned_list = []

        for work in work_list:
            if not work or not isinstance(work, dict):
                continue

            cleaned = {}

            if work.get('company'):
                cleaned['company'] = self._normalize_company_name(str(work['company']))

            if work.get('department'):
                dept = str(work['department']).strip()
                if len(dept) <= 50:
                    cleaned['department'] = dept

            if work.get('position'):
                position = str(work['position']).strip()
                if len(position) <= 100:
                    cleaned['position'] = position

            if work.get('work_type'):
                work_type = str(work['work_type']).strip()
                cleaned['work_type'] = self.work_type_mapping.get(work_type, work_type)

            if work.get('start_date'):
                cleaned['start_date'] = self._clean_date(str(work['start_date']))

            if work.get('end_date'):
                end_date = str(work['end_date'])
                if any(keyword in end_date for keyword in ['至今', '现在', 'present']):
                    cleaned['end_date'] = '至今'
                else:
                    cleaned['end_date'] = self._clean_date(end_date)

            if work.get('description'):
                desc = str(work['description']).strip()
                if len(desc) > 500:
                    desc = desc[:500]
                if len(desc) > 10:
                    cleaned['description'] = desc

            if cleaned:
                cleaned_list.append(cleaned)

        cleaned_list.sort(key=lambda x: x.get('start_date', ''), reverse=True)

        seen = set()
        unique_list = []
        for item in cleaned_list:
            key = item.get('company', '') + item.get('position', '')
            if key and key not in seen:
                seen.add(key)
                unique_list.append(item)

        return unique_list[:8]

    def _normalize_company_name(self, company: str) -> str:
        """标准化公司名称"""
        if not company:
            return ''

        company = company.strip()

        company = re.sub(r'\s*[\(（][^)）]*[\)）]\s*', '', company)

        suffixes = [
            '有限公司', '股份有限公司', '集团有限公司', '科技有限公司',
            '技术有限公司', '网络科技有限公司', '软件技术有限公司',
            'Co., Ltd.', 'Ltd.', 'Inc.', 'Corp.', 'LLC'
        ]

        for suffix in suffixes:
            if company.endswith(' ' + suffix) or company.endswith(suffix):
                company = company[:-len(suffix)].strip()
                break

        return company[:30] if len(company) > 30 else company

    def _clean_skills(self, skills: dict) -> dict:
        """清洗技能信息"""
        if not skills or not isinstance(skills, dict):
            return {
                'programming_languages': [],
                'frameworks': [],
                'tools': [],
                'languages': []
            }

        cleaned = {
            'programming_languages': [],
            'frameworks': [],
            'tools': [],
            'languages': []
        }

        if skills.get('programming_languages'):
            for skill in skills['programming_languages']:
                if isinstance(skill, dict):
                    name = skill.get('name', '').strip()
                    if name:
                        cleaned['programming_languages'].append({
                            'name': name,
                            'level': skill.get('level', '熟练')
                        })
                elif isinstance(skill, str) and skill.strip():
                    cleaned['programming_languages'].append({
                        'name': skill.strip(),
                        'level': '熟练'
                    })

        if skills.get('frameworks'):
            seen = set()
            for f in skills['frameworks']:
                if isinstance(f, str) and f.strip():
                    if f not in seen:
                        cleaned['frameworks'].append(f.strip())
                        seen.add(f)

        if skills.get('tools'):
            seen = set()
            for t in skills['tools']:
                if isinstance(t, str) and t.strip():
                    if t not in seen:
                        cleaned['tools'].append(t.strip())
                        seen.add(t)

        if skills.get('languages'):
            for lang in skills['languages']:
                if isinstance(lang, dict):
                    name = lang.get('name', '').strip()
                    if name:
                        cleaned['languages'].append({
                            'name': name,
                            'level': lang.get('level', '')
                        })
                elif isinstance(lang, str) and lang.strip():
                    cleaned['languages'].append({
                        'name': lang.strip(),
                        'level': ''
                    })

        return cleaned

    def _clean_certificates(self, certificates: List[dict]) -> List[dict]:
        """清洗证书信息"""
        if not certificates or not isinstance(certificates, list):
            return []

        cleaned_list = []

        for cert in certificates:
            if not cert or not isinstance(cert, dict):
                continue

            cleaned = {}

            if cert.get('name'):
                name = str(cert['name']).strip()
                if 2 <= len(name) <= 100:
                    cleaned['name'] = name

            if cert.get('issue_date'):
                cleaned['issue_date'] = self._clean_date(str(cert['issue_date']))

            if cleaned:
                cleaned_list.append(cleaned)

        return cleaned_list[:10]

    def _clean_projects(self, projects: List[dict]) -> List[dict]:
        """清洗项目信息"""
        if not projects or not isinstance(projects, list):
            return []

        cleaned_list = []

        for project in projects:
            if not project or not isinstance(project, dict):
                continue

            cleaned = {}

            if project.get('name'):
                name = str(project['name']).strip()
                if len(name) <= 100:
                    cleaned['name'] = name

            if project.get('role'):
                role = str(project['role']).strip()
                if len(role) <= 50:
                    cleaned['role'] = role

            if project.get('tech_stack'):
                if isinstance(project['tech_stack'], list):
                    cleaned['tech_stack'] = [str(t) for t in project['tech_stack'] if t][:10]
                else:
                    cleaned['tech_stack'] = []

            if project.get('start_date'):
                cleaned['start_date'] = self._clean_date(str(project['start_date']))

            if project.get('end_date'):
                cleaned['end_date'] = self._clean_date(str(project['end_date']))

            if project.get('description'):
                desc = str(project['description']).strip()
                if len(desc) > 500:
                    desc = desc[:500]
                if len(desc) > 5:
                    cleaned['description'] = desc

            if cleaned:
                cleaned_list.append(cleaned)

        return cleaned_list[:5]

    def _clean_self_evaluation(self, evaluation: Optional[str]) -> Optional[str]:
        """清洗自我评价"""
        if not evaluation:
            return None

        eval_str = str(evaluation).strip()

        eval_str = re.sub(r'\s+', ' ', eval_str)

        eval_str = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', eval_str)

        if len(eval_str) > 1000:
            eval_str = eval_str[:1000] + '...'

        return eval_str if eval_str else None

    def _adjust_confidence(self, data: dict, original_confidence: float) -> float:
        """调整可信度"""
        confidence = float(original_confidence) if original_confidence else 0.0

        basic_info = data.get('basic_info', {})
        has_name = bool(basic_info.get('name'))
        has_phone = bool(basic_info.get('phone'))
        has_email = bool(basic_info.get('email'))

        info_count = sum([has_name, has_phone, has_email])

        if info_count == 0:
            confidence = min(confidence, 0.2)
        elif info_count == 1:
            confidence = min(confidence, 0.4)
        elif info_count == 2:
            confidence = min(confidence, 0.7)

        if not data.get('education') and not data.get('work_experience'):
            confidence = min(confidence, 0.3)

        return round(max(min(confidence, 1.0), 0.0), 2)

    def _generate_warnings(self, data: dict) -> List[dict]:
        """生成警告信息"""
        warnings = []

        basic_info = data.get('basic_info', {})

        if not basic_info.get('name'):
            warnings.append({'field': 'name', 'message': '未能识别到姓名'})

        if not basic_info.get('phone'):
            warnings.append({'field': 'phone', 'message': '未能识别到手机号码'})

        if not basic_info.get('email'):
            warnings.append({'field': 'email', 'message': '未能识别到电子邮箱'})

        if not data.get('education'):
            warnings.append({'field': 'education', 'message': '未能识别到教育背景'})

        if not data.get('work_experience'):
            warnings.append({'field': 'work_experience', 'message': '未能识别到工作经历'})

        skills = data.get('skills', {})
        total_skills = (
            len(skills.get('programming_languages', [])) +
            len(skills.get('frameworks', [])) +
            len(skills.get('tools', []))
        )
        if total_skills == 0:
            warnings.append({'field': 'skills', 'message': '未能识别到专业技能'})

        return warnings
