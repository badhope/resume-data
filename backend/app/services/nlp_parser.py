import re
import jieba
from typing import List, Dict, Optional
from datetime import datetime


class NLPProcessor:
    """NLP智能解析引擎 - 从简历文本中提取结构化信息"""

    def __init__(self):
        self._init_patterns()
        self._init_keywords()

    def _init_patterns(self):
        """初始化正则表达式模式"""
        self.patterns = {
            'phone': re.compile(r'1[3-9]\d[\s\-]?\d{4}[\s\-]?\d{4}'),
            'email': re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'),
            'id_card': re.compile(r'\d{17}[\dXx]'),
            'age': re.compile(r'(?:年龄|AGE)[:：]?\s*(\d{1,3})'),
            'birth_year': re.compile(r'(?:出生年份|生于|出生于)[:：]?\s*(19|20)\d{2}'),
            'gender_m': re.compile(r'(?:性别|gender)[:：]?\s*[男女]'),
        }

    def _init_keywords(self):
        """初始化关键词库"""
        self.edu_keywords = {
            'school': ['大学', '学院', '学校', 'University', 'College', ' institute'],
            'degree': ['博士', '硕士', '本科', '学士', '大专', '高中', '中专', '职高', 'MBA'],
            'major': ['专业', 'Major', '系别', '方向'],
            'education_type': ['统招', '成人', '网络教育', '函授', '自学考试', '全日制', '非全日制'],
        }

        self.work_keywords = {
            'company': ['公司', '企业', '集团', '有限', '股份', 'Co.', 'Ltd.', 'Inc.', 'Corp'],
            'position': ['工程师', '经理', '主管', '总监', '专员', '助理', '设计师', '架构师',
                        'Developer', 'Manager', 'Engineer', 'Director', 'Lead', 'Senior', 'Junior'],
            'department': ['部门', 'Department', '事业部', '中心', 'Team'],
            'work_type': ['全职', '兼职', '实习', 'Full-time', 'Part-time', 'Intern'],
        }

        self.skill_keywords = {
            'programming': [
                'Python', 'Java', 'JavaScript', 'Go', 'C++', 'C#', 'PHP', 'Ruby',
                'Swift', 'Kotlin', 'SQL', 'TypeScript', 'Shell', 'R', 'MATLAB',
                'Scala', 'Perl', 'Rust', 'Objective-C', 'Vue', 'React', 'Angular'
            ],
            'framework': [
                'Spring', 'Django', 'Flask', 'Node.js', 'FastAPI', 'Express',
                'Laravel', '.NET', 'Hibernate', 'MyBatis', 'jQuery', 'Bootstrap'
            ],
            'tool': [
                'Git', 'Docker', 'Kubernetes', 'Jenkins', 'Linux', 'Windows',
                'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ',
                'Nginx', 'AWS', 'Azure', 'GCP', 'Tomcat', 'Nginx', 'Maven', 'Gradle'
            ],
            'language': [
                '英语', '日语', '韩语', '法语', '德语', '西班牙语', '俄语',
                'CET', 'TOEFL', 'IELTS', 'N1', 'N2', 'N3'
            ],
        }

        self.section_keywords = {
            'education': ['教育背景', '教育经历', 'Education', '学术背景', '学习经历', '学历背景'],
            'work': ['工作经历', '工作经验', 'Work Experience', '职业经历', '工作履历', '工作经历'],
            'project': ['项目经验', '项目经历', 'Projects', '项目介绍', '项目详情'],
            'skill': ['专业技能', '技能专长', 'Skills', '技术能力', '技能证书', '个人技能'],
            'certificate': ['证书', '资格证书', 'Certifications', '资质认证', '获得证书'],
            'award': ['获奖', '荣誉', '奖项', 'Awards', '奖励', '所获荣誉'],
            'self_evaluation': ['自我评价', '个人简介', 'About Me', '自我描述', '个人评价', '个人概述'],
            'contact': ['联系方式', 'Contact', '联系信息', 'Contact Info'],
        }

    def parse(self, text: str) -> dict:
        """解析简历文本主入口"""
        if not text or not text.strip():
            return self._empty_result()

        result = {
            'basic_info': self._extract_basic_info(text),
            'education': self._extract_education(text),
            'work_experience': self._extract_work_experience(text),
            'skills': self._extract_skills(text),
            'certificates': self._extract_certificates(text),
            'projects': self._extract_projects(text),
            'self_evaluation': self._extract_self_evaluation(text),
        }

        confidence = self._calculate_confidence(result)

        return {
            'data': result,
            'confidence': confidence,
            'raw_text': text
        }

    def _empty_result(self) -> dict:
        """返回空结果"""
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
            'raw_text': ''
        }

    def _extract_basic_info(self, text: str) -> dict:
        """提取基本信息"""
        info = {}

        phone_match = self.patterns['phone'].search(text)
        if phone_match:
            phone = phone_match.group()
            info['phone'] = re.sub(r'\s', '-', phone)

        email_match = self.patterns['email'].search(text)
        if email_match:
            info['email'] = email_match.group().lower()

        lines = [line.strip() for line in text.split('\n') if line.strip()]

        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(kw in line for kw in ['姓名', '名字', 'Name', 'name']) and i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and len(next_line) <= 15 and not self._looks_like_section_title(next_line):
                    info['name'] = next_line
                    break

        if not info.get('name') and lines:
            first_line = lines[0].strip()
            if first_line and len(first_line) <= 10 and not self._looks_like_section_title(first_line):
                if not re.search(r'[\d\-\*\@]', first_line):
                    info['name'] = first_line

        location_keywords = [
            '北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '南京',
            '西安', '苏州', '重庆', '天津', '青岛', '厦门', '长沙', '郑州'
        ]
        for line in lines[:15]:
            for loc in location_keywords:
                if loc in line:
                    info['location'] = loc
                    break

        for line in lines[:10]:
            if '男' in line or '男性' in line:
                info['gender'] = '男'
                break
            elif '女' in line or '女性' in line:
                info['gender'] = '女'
                break

        birth_patterns = [
            re.compile(r'(?:出生|date of birth)[:：]?\s*(\d{4})[-年](\d{1,2})[-月]?(\d{1,2})?'),
            re.compile(r'(\d{4})\.(\d{1,2})\.(\d{1,2})'),
            re.compile(r'(\d{4})年(\d{1,2})月(\d{1,2})日'),
        ]
        for pattern in birth_patterns:
            match = pattern.search(text)
            if match:
                info['birth_date'] = f"{match.group(1)}-{match.group(2).zfill(2)}"
                if match.group(3):
                    info['birth_date'] += f"-{match.group(3).zfill(2)}"
                break

        return info

    def _looks_like_section_title(self, text: str) -> bool:
        """判断文本是否像章节标题"""
        section_indicators = [
            '教育背景', '工作经历', '项目经验', '专业技能', '自我评价',
            '教育经历', '工作经验', '技能证书', '证书资质', '联系方式',
            '个人简介', '求职意向', '期望工作', '教育', '工作', '项目',
            '技能', '证书', '奖项', '荣誉', '培训', '经历'
        ]
        text = text.strip()
        for indicator in section_indicators:
            if text == indicator or text.startswith(indicator + ' ') or text.startswith(indicator + '：'):
                return True
        return False

    def _extract_education(self, text: str) -> List[dict]:
        """提取教育背景"""
        education = []

        edu_section = self._extract_section(text, 'education')
        if not edu_section:
            return education

        degree_mapping = {
            '博士': '博士', '博士后': '博士', 'PhD': '博士', 'Ph.D.': '博士',
            '硕士': '硕士', '研究生': '硕士', 'MBA': '硕士', 'EMBA': '硕士', 'M.A.': '硕士', 'M.S.': '硕士',
            '本科': '学士', '学士': '学士', '大学本科': '学士', 'Bachelor': '学士', 'B.S.': '学士', 'B.A.': '学士',
            '大专': '大专', '专科': '大专', 'Associate': '大专',
            '高中': '高中', '高中学历': '高中',
            '中专': '中专', '中职': '中专',
            '职高': '职高', '职业高中': '职高',
        }

        lines = [line.strip() for line in edu_section.split('\n') if line.strip()]

        for line in lines:
            edu = {}

            degree_found = None
            for keyword in self.edu_keywords['degree']:
                if keyword in line:
                    for deg, std_deg in degree_mapping.items():
                        if deg in line:
                            edu['degree'] = std_deg
                            degree_found = deg
                            break
                    if degree_found:
                        break

            date_pattern = re.compile(r'(20|19)\d{2}[年/\-.]?(0[1-9]|1[0-2])?[年/\-.]?')
            date_match = date_pattern.search(line)
            if date_match:
                date_str = date_match.group()
                years = re.findall(r'(20|19)\d{2}', date_str)
                if len(years) >= 1:
                    edu['start_date'] = years[0]
                if len(years) >= 2:
                    edu['end_date'] = years[1]
                elif '在读' in line or '至今' in line or '现在' in line:
                    edu['end_date'] = '至今'

            school_pattern = re.compile(
                r'([\u4e00-\u9fa5]{2,20}(?:大学|学院|学校|Institute|University|College))'
            )
            school_match = school_pattern.search(line)
            if school_match:
                edu['school'] = school_match.group(1)

            if '专业' in line:
                major_match = re.search(r'[^>\u4e00-\u9fa5]*(?:专业|Major|研究方向)[:：]?\s*([\u4e00-\u9fa5a-zA-Z\s]+?)(?:,|$)', line)
                if major_match:
                    edu['major'] = major_match.group(1).strip()

            if edu.get('school') and len(edu) >= 2:
                education.append(edu)

        education.sort(key=lambda x: x.get('start_date', ''), reverse=True)
        return education[:5]

    def _extract_work_experience(self, text: str) -> List[dict]:
        """提取工作经历"""
        experiences = []

        work_section = self._extract_section(text, 'work')
        if not work_section:
            return experiences

        lines = [line.strip() for line in work_section.split('\n') if line.strip()]

        current_work = {}
        date_pattern = re.compile(
            r'(?:20|19)\d{2}[年/\-.]?(?:0[1-9]|1[0-2])?(?:月)?'
            r'[\s\-至:]?'
            r'(?:(?:20|19)\d{2}[年/\-.]?(?:0[1-9]|1[0-2])?(?:月)?|至今|现在|present|current)?'
        )

        for line in lines:
            date_match = date_pattern.search(line)
            if date_match:
                date_str = date_match.group()
                years = re.findall(r'(20|19)\d{2}', date_str)
                if len(years) >= 2:
                    current_work['start_date'] = years[0]
                    if '至今' not in date_str and '现在' not in date_str:
                        current_work['end_date'] = years[-1]
                    else:
                        current_work['end_date'] = '至今'
                elif len(years) == 1:
                    current_work['start_date'] = years[0]
                    if '至今' in date_str or '现在' in date_str:
                        current_work['end_date'] = '至今'

            company_patterns = [
                re.compile(r'([\u4e00-\u9fa5]{2,15}(?:科技|网络|信息|软件|技术|集团|有限|股份|公司))'),
                re.compile(r'([A-Za-z]{2,20}\s*(?:Tech|Network|Software|Technology|Inc|Corp|Ltd|Co.))'),
            ]
            for pattern in company_patterns:
                match = pattern.search(line)
                if match and not current_work.get('company'):
                    current_work['company'] = match.group(1)
                    break

            for keyword in self.work_keywords['position']:
                if keyword in line:
                    current_work['position'] = line
                    break

            if (current_work.get('company') or current_work.get('position')) and len(current_work) >= 2:
                if len(line) > 10 and '公司' not in line and '职位' not in line:
                    if 'description' not in current_work:
                        current_work['description'] = line

                if '至今' in line or '现在' in line or (current_work.get('start_date') and len(current_work) >= 3):
                    experiences.append(current_work.copy())
                    current_work = {}

        seen = set()
        unique_experiences = []
        for exp in experiences:
            key = exp.get('company', '') + exp.get('position', '')
            if key and key not in seen:
                seen.add(key)
                unique_experiences.append(exp)

        unique_experiences.sort(key=lambda x: x.get('start_date', ''), reverse=True)
        return unique_experiences[:8]

    def _extract_section(self, text: str, section_type: str) -> Optional[str]:
        """提取简历的指定章节"""
        keywords = self.section_keywords.get(section_type, [])

        lines = text.split('\n')
        section_start = -1
        section_end = len(lines)

        for i, line in enumerate(lines):
            for keyword in keywords:
                if keyword.lower() in line.lower():
                    section_start = i
                    break
            if section_start >= 0:
                break

        if section_start < 0:
            return None

        for i in range(section_start + 1, len(lines)):
            line_lower = lines[i].lower()
            for kw_list in self.section_keywords.values():
                for keyword in kw_list:
                    if keyword.lower() in line_lower and i > section_start:
                        section_end = min(section_end, i)
                        break

        section_content = '\n'.join(lines[section_start + 1:section_end])
        return section_content if section_content.strip() else None

    def _extract_skills(self, text: str) -> dict:
        """提取技能信息"""
        skills = {
            'programming_languages': [],
            'frameworks': [],
            'tools': [],
            'languages': []
        }

        skill_section = self._extract_section(text, 'skill')
        if not skill_section:
            skill_section = text

        skill_section_lower = skill_section.lower()

        found_programming = set()
        for skill in self.skill_keywords['programming']:
            skill_lower = skill.lower()
            if skill_lower in skill_section_lower:
                if skill not in found_programming:
                    level = self._extract_skill_level(skill_section, skill)
                    skills['programming_languages'].append({'name': skill, 'level': level})
                    found_programming.add(skill)

        found_frameworks = set()
        for framework in self.skill_keywords['framework']:
            framework_lower = framework.lower()
            if framework_lower in skill_section_lower:
                if framework not in found_frameworks:
                    skills['frameworks'].append(framework)
                    found_frameworks.add(framework)

        found_tools = set()
        for tool in self.skill_keywords['tool']:
            tool_lower = tool.lower()
            if tool_lower in skill_section_lower:
                if tool not in found_tools:
                    skills['tools'].append(tool)
                    found_tools.add(tool)

        for lang in self.skill_keywords['language']:
            if lang in skill_section:
                level = self._extract_skill_level(skill_section, lang)
                skills['languages'].append({'name': lang, 'level': level})

        return skills

    def _extract_skill_level(self, text: str, skill: str) -> str:
        """提取技能熟练度"""
        skill_pos = text.find(skill)
        if skill_pos == -1:
            return '熟练'

        context_start = max(0, skill_pos - 15)
        context_end = min(len(text), skill_pos + len(skill) + 15)
        context = text[context_start:context_end]

        level_keywords = {
            '精通': ['精通', '专家', '资深', 'master', 'expert'],
            '熟练': ['熟练', ' proficient', 'skilled'],
            '熟悉': ['熟悉', 'familiar', 'knowledgeable'],
            '了解': ['了解', 'basic', 'learning', '入门'],
        }

        for level, keywords in level_keywords.items():
            for kw in keywords:
                if kw in context.lower():
                    return level

        return '熟练'

    def _extract_certificates(self, text: str) -> List[dict]:
        """提取证书信息"""
        certificates = []

        cert_section = self._extract_section(text, 'certificate')
        if not cert_section:
            return certificates

        date_pattern = re.compile(r'(?:20|19)\d{2}[年/\-.]?(?:0[1-9]|1[0-2])?')

        lines = [line.strip() for line in cert_section.split('\n') if line.strip()]

        for line in lines:
            if len(line) < 2 or len(line) > 100:
                continue

            cert = {'name': line}

            date_match = date_pattern.search(line)
            if date_match:
                cert['issue_date'] = date_match.group()

            certificates.append(cert)

        return certificates[:10]

    def _extract_projects(self, text: str) -> List[dict]:
        """提取项目经验"""
        projects = []

        project_section = self._extract_section(text, 'project')
        if not project_section:
            return projects

        lines = [line.strip() for line in project_section.split('\n') if line.strip()]

        current_project = {}

        for line in lines:
            if ('项目' in line or 'Project' in line) and len(line) < 30:
                if current_project and current_project.get('name'):
                    projects.append(current_project.copy())
                current_project = {'name': line}
            elif current_project.get('name'):
                if any(kw in line for kw in ['技术', '技术栈', 'Tech Stack', '使用', '基于']):
                    techs = []
                    for tech in self.skill_keywords['programming'] + self.skill_keywords['framework'] + self.skill_keywords['tool']:
                        if tech in line:
                            techs.append(tech)
                    if techs:
                        current_project['tech_stack'] = techs

                elif any(kw in line for kw in ['职责', '责任', 'Role', 'Description', '描述']):
                    if 'description' not in current_project:
                        current_project['description'] = line

        if current_project and current_project.get('name'):
            projects.append(current_project)

        return projects[:5]

    def _extract_self_evaluation(self, text: str) -> Optional[str]:
        """提取自我评价"""
        eval_section = self._extract_section(text, 'self_evaluation')
        if eval_section:
            eval_text = eval_section.strip()
            eval_text = re.sub(r'\s+', ' ', eval_text)
            if len(eval_text) > 500:
                eval_text = eval_text[:500] + '...'
            return eval_text if eval_text else None
        return None

    def _calculate_confidence(self, data: dict) -> float:
        """计算解析可信度"""
        score = 0.0

        basic_info = data.get('basic_info', {})
        if basic_info.get('name'):
            score += 0.15
        if basic_info.get('phone'):
            score += 0.10
        if basic_info.get('email'):
            score += 0.10

        if data.get('education'):
            score += min(0.25, len(data['education']) * 0.08)

        if data.get('work_experience'):
            score += min(0.25, len(data['work_experience']) * 0.06)

        skills = data.get('skills', {})
        total_skills = (
            len(skills.get('programming_languages', [])) +
            len(skills.get('frameworks', [])) +
            len(skills.get('tools', []))
        )
        if total_skills > 0:
            score += min(0.15, total_skills * 0.03)

        if data.get('projects'):
            score += min(0.10, len(data['projects']) * 0.05)

        return round(min(score, 1.0), 2)
