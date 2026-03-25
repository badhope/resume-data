# 简历数据清洗系统 - 技术文档

## 一、项目结构

```
resume-data/
├── backend/                    # 后端服务
│   ├── app/
│   │   ├── api/               # API 路由
│   │   │   ├── upload.py      # 上传接口
│   │   │   ├── resume.py      # 简历管理接口
│   │   │   ├── export.py      # 导出接口
│   │   │   └── config.py      # 配置管理接口
│   │   ├── core/              # 核心配置
│   │   │   └── config.py      # 应用配置
│   │   ├── schemas/           # 数据模型
│   │   │   ├── resume.py      # 简历模型
│   │   │   └── config.py      # 配置模型
│   │   ├── services/          # 业务逻辑
│   │   │   ├── file_parser.py # 文件解析
│   │   │   ├── nlp_parser.py  # NLP 解析
│   │   │   └── data_cleaner.py# 数据清洗
│   │   └── main.py            # 应用入口
│   ├── requirements.txt       # Python 依赖
│   └── Dockerfile             # Docker 配置
│
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/        # 公共组件
│   │   │   ├── Sidebar.jsx    # 侧边栏
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/             # 页面组件
│   │   │   ├── UploadPage.jsx
│   │   │   ├── ResumeListPage.jsx
│   │   │   ├── ResumeDetailPage.jsx
│   │   │   ├── StatisticsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/          # API 服务
│   │   │   └── api.js
│   │   ├── styles/            # 样式文件
│   │   │   └── index.css
│   │   ├── App.jsx            # 根组件
│   │   └── main.jsx           # 入口文件
│   ├── package.json           # Node 依赖
│   └── vite.config.js         # Vite 配置
│
├── docs/                       # 文档目录
│   ├── USER_GUIDE.md          # 用户指南
│   └── TECHNICAL.md           # 技术文档
│
└── docker-compose.yml         # Docker Compose 配置
```

---

## 二、技术栈

### 后端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.9+ | 编程语言 |
| FastAPI | 0.104+ | Web 框架 |
| Pydantic | 2.0+ | 数据验证 |
| python-docx | 0.8+ | Word 文档解析 |
| PyPDF2 | 3.0+ | PDF 解析 |
| openpyxl | 3.1+ | Excel 生成 |
| aiofiles | 23.0+ | 异步文件操作 |

### 前端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2+ | UI 框架 |
| Vite | 5.0+ | 构建工具 |
| Ant Design | 5.0+ | UI 组件库 |
| React Router | 6.0+ | 路由管理 |
| Axios | 1.6+ | HTTP 客户端 |
| dayjs | 1.11+ | 日期处理 |

---

## 三、核心模块详解

### 3.1 文件解析模块 (file_parser.py)

负责解析上传的文件，提取文本内容。

```python
class FileParser:
    def parse(self, file_path: str) -> str:
        """解析文件，返回文本内容"""
        ext = Path(file_path).suffix.lower()
        
        if ext == '.pdf':
            return self._parse_pdf(file_path)
        elif ext == '.docx':
            return self._parse_docx(file_path)
        elif ext == '.txt':
            return self._parse_txt(file_path)
        elif ext == '.html':
            return self._parse_html(file_path)
        else:
            raise ValueError(f"不支持的文件格式: {ext}")
```

**支持的格式**：
- PDF：使用 PyPDF2 解析
- DOCX：使用 python-docx 解析
- TXT：直接读取文本
- HTML：使用 BeautifulSoup 解析

### 3.2 NLP 解析模块 (nlp_parser.py)

基于规则和模式匹配的简历信息提取。

```python
class NLPParser:
    def parse(self, text: str) -> dict:
        """解析简历文本，提取结构化信息"""
        return {
            'basic_info': self._extract_basic_info(text),
            'education': self._extract_education(text),
            'work_experience': self._extract_work_experience(text),
            'skills': self._extract_skills(text),
            'certificates': self._extract_certificates(text),
            'projects': self._extract_projects(text),
            'self_evaluation': self._extract_self_evaluation(text),
        }
```

**提取策略**：
- 正则表达式匹配
- 关键词识别
- 时间模式匹配
- 实体识别

### 3.3 数据清洗模块 (data_cleaner.py)

对提取的数据进行标准化和清洗。

```python
class DataCleaner:
    def clean(self, data: dict, options: CleanOptions) -> dict:
        """清洗数据"""
        cleaned = {}
        
        if options.extract_name:
            cleaned['basic_info'] = self._clean_basic_info(
                data.get('basic_info', {}),
                options.sensitive_mode == 'mask'
            )
        
        # ... 其他字段清洗
        
        return cleaned
```

**清洗功能**：
- 日期格式标准化
- 学历名称标准化
- 公司名称标准化
- 敏感信息脱敏
- 数据验证和过滤

---

## 四、API 设计

### 4.1 RESTful 规范

遵循 RESTful API 设计规范：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/resume | 获取简历列表 |
| GET | /api/resume/{id} | 获取简历详情 |
| POST | /api/resume | 创建简历 |
| PUT | /api/resume/{id} | 更新简历 |
| DELETE | /api/resume/{id} | 删除简历 |

### 4.2 响应格式

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**错误响应**：
```json
{
  "detail": "错误描述",
  "status_code": 400
}
```

### 4.3 分页参数

```
GET /api/resume?skip=0&limit=10

响应：
{
  "total": 100,
  "items": [ ... ]
}
```

---

## 五、数据模型

### 5.1 简历模型

```python
class ResumeResponse(BaseModel):
    resume_id: str
    filename: str
    data: dict
    confidence: float
    parse_time: datetime
    status: str
```

### 5.2 清洗选项模型

```python
class CleanOptions(BaseModel):
    extract_name: bool = True
    extract_gender: bool = True
    extract_phone: bool = True
    sensitive_mode: SensitiveMode = SensitiveMode.MASK
    date_format: DateFormat = DateFormat.STANDARD
    normalize_degree: bool = True
```

### 5.3 统计模型

```python
class StatisticsOverview(BaseModel):
    total_resumes: int
    success_count: int
    failed_count: int
    avg_confidence: float
    today_uploads: int
    week_uploads: int
```

---

## 六、前端架构

### 6.1 组件设计

**页面组件**：
- UploadPage：上传页面
- ResumeListPage：简历列表页面
- ResumeDetailPage：简历详情页面
- StatisticsPage：统计页面
- SettingsPage：设置页面

**公共组件**：
- Sidebar：侧边导航栏
- LoadingSpinner：加载动画

### 6.2 状态管理

使用 React Hooks 进行状态管理：

```javascript
const [resumes, setResumes] = useState([])
const [loading, setLoading] = useState(false)
const [total, setTotal] = useState(0)
```

### 6.3 API 调用

封装统一的 API 调用方法：

```javascript
export const getResumeList = async (skip = 0, limit = 10) => {
  const response = await apiClient.get('/resume', { 
    params: { skip, limit } 
  })
  return response.data
}
```

---

## 七、性能优化

### 7.1 后端优化

1. **异步处理**：使用 async/await 处理 I/O 密集操作
2. **缓存机制**：对频繁访问的数据进行缓存
3. **批量处理**：支持批量上传和导出

### 7.2 前端优化

1. **懒加载**：使用 React.lazy 懒加载页面组件
2. **虚拟滚动**：大数据列表使用虚拟滚动
3. **防抖节流**：搜索输入使用防抖处理

---

## 八、安全措施

### 8.1 数据安全

- 敏感信息脱敏处理
- 文件上传大小限制
- 文件类型验证

### 8.2 接口安全

- CORS 跨域配置
- 请求参数验证
- 错误信息脱敏

---

## 九、扩展开发

### 9.1 添加新的解析字段

1. 在 `nlp_parser.py` 中添加提取方法
2. 在 `data_cleaner.py` 中添加清洗逻辑
3. 在 `schemas/resume.py` 中更新数据模型
4. 在前端页面中添加展示组件

### 9.2 添加新的导出格式

1. 在 `export.py` 中添加导出接口
2. 实现数据转换逻辑
3. 在前端添加导出选项

### 9.3 添加新的统计指标

1. 在 `config.py` 中扩展统计接口
2. 实现统计计算逻辑
3. 在前端统计页面添加展示

---

## 十、测试指南

### 10.1 后端测试

```bash
# 运行测试
pytest tests/

# 测试覆盖率
pytest --cov=app tests/
```

### 10.2 前端测试

```bash
# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage
```

---

## 十一、监控与日志

### 11.1 日志配置

```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### 11.2 健康检查

```
GET /health

响应：
{
  "status": "healthy"
}
```

---

**文档版本：v2.0.0**
**最后更新：2024-01-01**
