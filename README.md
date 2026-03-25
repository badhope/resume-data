<div align="center">

# 📋 Resume Cleaner

**智能简历数据清洗平台 | Intelligent Resume Data Cleaning Platform**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-brightgreen.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![GitHub Stars](https://img.shields.io/github/stars/badhope/resume-data.svg?style=social)](https://github.com/badhope/resume-data)
[![GitHub Forks](https://img.shields.io/github/forks/badhope/resume-data.svg?style=social)](https://github.com/badhope/resume-data/network/members)

[在线演示](#-在线演示) • [快速开始](#-快速开始) • [功能特性](#-功能特性) • [文档](#-文档) • [贡献指南](#-贡献指南)

**[English](README_EN.md) | 简体中文**

<img src="https://img.shields.io/badge/平台-Windows%20|%20macOS%20|%20Linux-lightgrey" alt="Platform">
<img src="https://img.shields.io/badge/状态-生产可用-success" alt="Status">

</div>

---

## 📖 项目简介

Resume Cleaner 是一个功能完善的**企业级简历数据清洗SaaS平台**，专为HR、猎头、招聘团队设计。支持多格式简历解析、智能数据提取、高度可定制化的清洗规则，以及批量处理能力。

### ✨ 核心亮点

- 🚀 **开箱即用** - 内置默认账号，无需复杂配置即可体验
- 🔐 **安全可靠** - JWT认证 + 数据加密，保护用户隐私
- 🎯 **精准清洗** - 支持985/211院校、GPA排名等多维度筛选
- 📱 **跨平台** - 响应式设计，支持PC端和移动端
- 🔗 **微信集成** - 支持微信登录、分享、消息通知
- 📦 **批量处理** - 支持批量上传、清洗、导出

---

## 🎬 在线演示

| 环境 | 地址 | 说明 |
|------|------|------|
| 生产环境 | Coming Soon | 部署中... |
| 本地开发 | http://localhost:3007 | 参见快速开始 |

### 🔑 演示账号

| 账号 | 密码 | 说明 |
|------|------|------|
| `user` | `888888` | 默认管理员账号，首次启动自动创建 |

---

## 📸 界面预览

<details>
<summary>点击展开查看更多截图</summary>

| 登录页面 | 简历上传 |
|:---:|:---:|
| ![登录页面](docs/screenshots/login.png) | ![简历上传](docs/screenshots/upload.png) |

| 清洗配置 | 清洗报告 |
|:---:|:---:|
| ![清洗配置](docs/screenshots/config.png) | ![清洗报告](docs/screenshots/report.png) |

</details>

---

## ✅ 功能特性

### 📄 简历管理

- [x] 多格式支持：PDF、Word(.docx/.doc)、TXT、HTML
- [x] 批量上传与处理
- [x] 简历预览与编辑
- [x] 本地存储 + 云端同步

### 🧹 数据清洗

- [x] **学历筛选**
  - 985/211院校识别
  - 双一流院校支持
  - 海外院校QS排名
  - 学历层次筛选（本科/硕士/博士）
- [x] **GPA筛选**
  - 百分比排名（前5%/10%/20%/30%）
  - GPA分数筛选
  - 专业排名支持
- [x] **工作经历筛选**
  - 公司规模（世界500强/上市公司/独角兽）
  - 工作年限
  - 行业领域
- [x] **项目经验筛选**
  - 项目类型
  - 项目规模
  - 担任角色
- [x] **专业技能筛选**
  - 技能等级
  - 证书认证
- [x] **其他筛选**
  - 年龄范围
  - 地域限制
  - 关键词过滤

### 👤 用户系统

- [x] 邮箱/手机号注册登录
- [x] 微信OAuth登录
- [x] JWT Token认证
- [x] 用户信息管理
- [x] 密码找回

### 📊 数据分析

- [x] 清洗统计报告
- [x] 可视化图表
- [x] 数据导出（JSON/Excel/CSV）
- [x] 操作日志查询

### 🚚 邮寄服务

- [x] 多快递公司支持（顺丰/京东/中通等）
- [x] 运费估算
- [x] 物流跟踪
- [x] 邮寄记录管理

### 📱 微信集成

- [x] 微信扫码登录
- [x] 简历分享到微信
- [x] 处理完成消息通知

---

## 🛠️ 技术栈

### 后端

| 技术 | 说明 |
|------|------|
| ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green) | 现代、高性能的Python Web框架 |
| ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-orange) | 强大的Python ORM |
| ![Pydantic](https://img.shields.io/badge/Pydantic-2.0+-blue) | 数据验证与序列化 |
| ![JWT](https://img.shields.io/badge/JWT-认证-red) | 安全的用户认证方案 |
| ![jieba](https://img.shields.io/badge/jieba-NLP-yellow) | 中文分词与NLP处理 |

### 前端

| 技术 | 说明 |
|------|------|
| ![React](https://img.shields.io/badge/React-18+-blue) | 流行的前端UI框架 |
| ![Ant Design](https://img.shields.io/badge/Ant%20Design-5+-red) | 企业级UI组件库 |
| ![Vite](https://img.shields.io/badge/Vite-5+-purple) | 下一代前端构建工具 |
| ![Axios](https://img.shields.io/badge/Axios-HTTP-green) | HTTP请求库 |

### 数据库

| 数据库 | 说明 |
|------|------|
| ![SQLite](https://img.shields.io/badge/SQLite-开发环境-lightgrey) | 轻量级嵌入式数据库 |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-生产环境-blue) | 企业级关系型数据库 |

---

## 🚀 快速开始

### 环境要求

- Python 3.9+
- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/badhope/resume-data.git
cd resume-data

# 2. 安装后端依赖
cd backend
pip install -r requirements.txt

# 3. 安装前端依赖
cd ../frontend
npm install

# 4. 启动后端服务 (端口 8000)
cd ../backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. 启动前端服务 (端口 3007) - 新终端窗口
cd frontend
npm run dev
```

### 访问应用

打开浏览器访问: http://localhost:3007

使用默认账号登录:
- 账号: `user`
- 密码: `888888`

### Docker 部署

```bash
# 使用 Docker Compose 一键启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 📁 项目结构

```
resume-data/
├── 📂 backend/                 # 后端代码
│   ├── 📂 app/
│   │   ├── 📂 api/            # API路由
│   │   │   ├── auth.py        # 用户认证
│   │   │   ├── resume.py      # 简历管理
│   │   │   ├── config.py      # 清洗配置
│   │   │   ├── wechat.py      # 微信集成
│   │   │   ├── logs.py        # 日志系统
│   │   │   └── shipping.py    # 邮寄服务
│   │   ├── 📂 core/           # 核心模块
│   │   ├── 📂 models/         # 数据模型
│   │   └── main.py            # 应用入口
│   └── requirements.txt       # Python依赖
├── 📂 frontend/               # 前端代码
│   ├── 📂 src/
│   │   ├── 📂 pages/          # 页面组件
│   │   ├── 📂 components/     # 公共组件
│   │   ├── 📂 services/       # API服务
│   │   └── App.jsx            # 应用入口
│   └── package.json           # Node依赖
├── 📂 test_resumes/           # 测试简历
├── 📂 docs/                   # 文档
├── 📄 README.md               # 中文文档
├── 📄 README_EN.md            # 英文文档
├── 📄 LICENSE                 # 开源协议
├── 📄 CONTRIBUTING.md         # 贡献指南
├── 📄 CHANGELOG.md            # 更新日志
└── 📄 docker-compose.yml      # Docker配置
```

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [用户手册](docs/USER_GUIDE.md) | 详细的使用教程 |
| [API文档](http://localhost:8000/docs) | FastAPI自动生成的API文档 |
| [开发指南](docs/DEVELOPMENT.md) | 开发环境搭建与代码规范 |
| [部署指南](docs/DEPLOYMENT.md) | 生产环境部署说明 |

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

详细指南请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)

### 贡献者

感谢所有贡献者的付出！

<a href="https://github.com/badhope/resume-data/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=badhope/resume-data" />
</a>

---

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

---

## 🐛 问题反馈

如果您在使用过程中遇到问题，欢迎通过以下方式反馈：

- [提交 Issue](https://github.com/badhope/resume-data/issues)
- [加入讨论](https://github.com/badhope/resume-data/discussions)

---

## 📜 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

---

## 🌟 Star History

如果这个项目对您有帮助，请给我们一个 ⭐️ Star！

[![Star History Chart](https://api.star-history.com/svg?repos=badhope/resume-data&type=Date)](https://star-history.com/#badhope/resume-data&Date)

---

## 📧 联系我们

- 📮 Email: contact@example.com
- 💬 微信: ResumeCleaner
- 🌐 官网: https://resumecleaner.example.com

---

<div align="center">

**Made with ❤️ by Resume Cleaner Team**

[⬆ 返回顶部](#-resume-cleaner)

</div>
