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
            'gender_f': re.compile(r'[女][^女]*?(?:护士|幼师|文员|客服|行政)'),
        }
    
    def _init_keywords(self):
        """初始化关键词库"""
        self.edu_keywords = {
            'school': ['大学', '学院', '学校', 'University', 'College'],
            'degree': ['博士', '硕士', '本科', '学士', '大专', '高中', '中专', '职高'],
            'major': ['专业', 'Major', '系别'],
            'education_type': ['统招', '成人', '网络教育', '函授', '自学考试', '全日制', '非全日制'],
        }
        
        self.work_keywords = {
            'company': ['公司', '企业', '集团', '有限', '股份', 'Co.', 'Ltd.', 'Inc.'],
            'position': ['工程师', '经理', '主管', '总监', '专员', '助理', '设计师', 'Developer', 'Manager', 'Engineer'],
            'department': ['部门', 'Department', '事业部', '中心'],
            'work_type': ['全职', '兼职', '实习', 'Full-time', 'Part-time', 'Intern'],
        }
        
        self.skill_keywords = {
            'programming': ['Python', 'Java', 'JavaScript', 'Go', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'TypeScript', 'Shell', 'R', 'MATLAB', 'Scala', 'Perl'],
            'framework': ['Spring', 'Django', 'Flask', 'React', 'Vue', 'Angular', 'Node.js', 'FastAPI', 'Express', 'Laravel', '.NET', 'Hibernate', 'MyBatis'],
            'tool': ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'Linux', 'Windows', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ', 'Nginx', 'AWS', 'Azure'],
            'language': ['英语', '日语', '韩语', '法语', '德语', 'Spanish', 'English', 'Japanese', 'CET', 'TOEFL', 'IELTS', 'N1', 'N2'],
        }
        
        self.section_keywords = {
            'education': ['教育背景', '教育经历', 'Education', '学术背景', '学习经历'],
            'work': ['工作经历', '工作经验', 'Work Experience', '职业经历', '工作履历'],
            'project': ['项目经验', '项目经历', 'Projects', '项目介绍'],
            'skill': ['专业技能', '技能专长', 'Skills', '技术能力', '技能证书'],
            'certificate': ['证书', '资格证书', 'Certifications', '资质认证'],
            'award': ['获奖', '荣誉', '奖项', 'Awards', '奖励'],
            'self_evaluation': ['自我评价', '个人简介', 'About Me', '自我描述'],
            'contact': ['联系方式', 'Contact', '联系信息'],
        }
    
    def parse(self, text: str) -> dict:
        """解析简历文本"""
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
        
        age_match = self.patterns['age'].search(text)
        if age_match:
            info['age'] = age_match.group(1)
        
        lines = text.split('\n')
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(kw in line for kw in ['姓名', 'Name', 'name']) and i + 1 < len(lines):
                name = lines[i + 1].strip()
                if name and len(name) <= 10:
                    info['name'] = name
                    break
        
        if not info.get('name'):
            first_line = lines[0].strip() if lines else ''
            if first_line and len(first_line) <= 10:
                info['name'] = first_line
        
        location_keywords = ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '南京', '西安', '苏州']
        for line in lines[:10]:
            for loc in location_keywords:
                if loc in line:
                    info['location'] = loc
                    break
        
        return info
    
    def _extract_education(self, text: str) -> List[dict]:
        """提取教育背景"""
        education = []
        
        edu_section = self._extract_section(text, 'education')
        if not edu_section:
            return education
        
        degree_mapping = {
            '博士': '博士', '博士后': '博士',
            '硕士': '硕士', '研究生': '硕士', 'MBA': '硕士',
            '本科': '学士', '学士': '学士', '大学本科': '学士',
            '大专': '大专', '专科': '大专',
            '高中': '高中', '中专': '中专', '职高': '职高'
        }
        
        lines = edu_section.split('\n')
        current_edu = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            date_pattern = re.compile(r'(?:20|19)\d{0,2}[\s\/\-\.]+(?:20|19)?\d{0,2}')
            date_match = date_pattern.search(line)
            
            for keyword in self.edu_keywords['degree']:
                if keyword in line:
                    for deg, std_deg in degree_mapping.items():
                        if deg in line:
                            current_edu['degree'] = std_deg
                            break
                    if date_match:
                        dates = date_match.group().split('-')
                        if len(dates) >= 2:
                            current_edu['start_date'] = dates[0].strip()
                            current_edu['end_date'] = dates[-1].strip()
                    break
            
            for keyword in self.edu_keywords['school']:
                if keyword in line:
                    school = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5]', '', line)
                    if school and len(school) > 2:
                        current_edu['school'] = school
                    break
            
            if '专业' in line:
                major = line.replace('专业', '').replace('：', '').replace(':', '').strip()
                if major:
                    current_edu['major'] = major
            
            if current_edu.get('school') and len(current_edu) > 1:
                education.append(current_edu.copy())
                current_edu = {}
        
        return education[:5]
    
    def _extract_work_experience(self, text: str) -> List[dict]:
        """提取工作经历"""
        experiences = []
        
        work_section = self._extract_section(text, 'work')
        if not work_section:
            return experiences
        
        lines = work_section.split('\n')
        current_work = {}
        
        date_pattern = re.compile(r'(?:20|19)\d{2}[年/\-\.]?(?:0[1-9]|1[0-2])?[\s\/\-\.]?(?:至今|现在|(?:20|19)\d{2}[年/\-\.]?(?:0[1-9]|1[0-2])?)?')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            date_match = date_pattern.search(line)
            if date_match:
                date_str = date_match.group()
                if '至今' in date_str or '现在' in date_str:
                    current_work['start_date'] = re.sub(r'[至今现在]', '', date_str).strip()
                    current_work['end_date'] = '至今'
                else:
                    dates = re.findall(r'(?:20|19)\d{2}(?:[年/\-\.]?(?:0[1-9]|1[0-2])?)?', date_str)
                    if len(dates) >= 2:
                        current_work['start_date'] = dates[0]
                        current_work['end_date'] = dates[-1]
            
            for keyword in self.work_keywords['company']:
                if keyword in line and '公司' in line:
                    company = line
                    for kw in ['有限公司', '股份有限公司', '集团有限公司', 'Co., Ltd.', 'Ltd.']:
                        if kw in company:
                            break
                    company = company.split('(')[0].split('[')[0].strip()
                    if company:
                        current_work['company'] = company
                    break
            
            for keyword in self.work_keywords['position']:
                if keyword in line:
                    current_work['position'] = line
                    break
            
            if (current_work.get('company') or current_work.get('position')) and len(current_work) > 1:
                if '描述' not in line and len(line) > 10:
                    current_work['description'] = line
        
        for exp in experiences:
            if exp.get('company') and exp not in experiences:
                experiences.append(exp)
        
        return experiences[:8]
    
    def _extract_section(self, text: str, section_type: str) -> Optional[str]:
        """提取简历的指定章节"""
        keywords = self.section_keywords.get(section_type, [])
        
        for keyword in keywords:
            pattern = re.compile(rf'{keyword}[\s:：]*(.*?)(?={"+"|\n\n|$)', re.DOTALL)
            match = pattern.search(text)
            if match:
                return match.group(1)
        
        lines = text.split('\n')
        section_start = -1
        
        for i, line in enumerate(lines):
            for keyword in keywords:
                if keyword in line:
                    section_start = i
                    break
            if section_start >= 0:
                break
        
        if section_start >= 0:
            next_section = len(lines)
            for keyword_list in self.section_keywords.values():
                for keyword in keyword_list:
                    for j in range(section_start + 1, len(lines)):
                        if keyword in lines[j] and j > section_start:
                            next_section = min(next_section, j)
                            break
            
            return '\n'.join(lines[section_start + 1:next_section])
        
        return None
    
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
            return skills
        
        found_skills = set()
        
        for skill in self.skill_keywords['programming']:
            if skill in skill_section:
                level = self._extract_skill_level(skill_section, skill)
                skills['programming_languages'].append({'name': skill, 'level': level})
                found_skills.add(skill)
        
        for framework in self.skill_keywords['framework']:
            if framework in skill_section:
                skills['frameworks'].append(framework)
                found_skills.add(framework)
        
        for tool in self.skill_keywords['tool']:
            if tool in skill_section:
                skills['tools'].append(tool)
                found_skills.add(tool)
        
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
        
        context = text[max(0, skill_pos-10):min(len(text), skill_pos+20)]
        
        level_keywords = {
            '精通': ['精通', '专家', '资深'],
            '熟练': ['熟练', '精通', '熟悉'],
            '了解': ['了解', '入门', '基础']
        }
        
        for level, keywords in level_keywords.items():
            for kw in keywords:
                if kw in context:
                    return level
        
        return '熟练'
    
    def _extract_certificates(self, text: str) -> List[dict]:
        """提取证书信息"""
        certificates = []
        
        cert_section = self._extract_section(text, 'certificate')
        if not cert_section:
            return certificates
        
        date_pattern = re.compile(r'(?:20|19)\d{2}[年/\-\.]?(?:0[1-9]|1[0-2])?')
        
        lines = cert_section.split('\n')
        for line in lines:
            line = line.strip()
            if len(line) < 2:
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
        
        lines = project_section.split('\n')
        current_project = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if '项目' in line and len(line) < 20:
                if current_project:
                    projects.append(current_project.copy())
                current_project = {'name': line}
            elif current_project.get('name'):
                if '技术' in line or '栈' in line or '使用' in line:
                    techs = re.findall(r'[A-Za-z]+|[\u4e00-\u9fa5]+', line)
                    current_project['tech_stack'] = [t for t in techs if t]
                elif '描述' in line or '职责' in line:
                    current_project['description'] = line
        
        if current_project and current_project not in projects:
            projects.append(current_project)
        
        return projects[:5]
    
    def _extract_self_evaluation(self, text: str) -> Optional[str]:
        """提取自我评价"""
        eval_section = self._extract_section(text, 'self_evaluation')
        if eval_section:
            eval_text = eval_section.strip()
            if len(eval_text) > 200:
                eval_text = eval_text[:200]
            return eval_text
        return None
    
    def _calculate_confidence(self, data: dict) -> float:
        """计算解析可信度"""
        score = 0.0
        max_score = 0.0
        
        if data.get('basic_info', {}).get('name'):
            score += 0.2
        max_score += 0.2
        
        if data.get('basic_info', {}).get('phone'):
            score += 0.1
        max_score += 0.1
        
        if data.get('basic_info', {}).get('email'):
            score += 0.1
        max_score += 0.1
        
        if data.get('education'):
            score += min(0.2, len(data['education']) * 0.1)
            max_score += 0.2
        
        if data.get('work_experience'):
            score += min(0.2, len(data['work_experience']) * 0.1)
            max_score += 0.2
        
        if data.get('skills', {}).get('programming_languages'):
            score += min(0.1, len(data['skills']['programming_languages']) * 0.05)
        
        if max_score > 0:
            return round(score / max_score * 0.9 + 0.1, 2)
        
        return 0.1
