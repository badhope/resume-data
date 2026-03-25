<div align="center">

# 📋 Resume Cleaner

**Intelligent Resume Data Cleaning Platform | 智能简历数据清洗平台**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-brightgreen.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![GitHub Stars](https://img.shields.io/github/stars/badhope/resume-data.svg?style=social)](https://github.com/badhope/resume-data)
[![GitHub Forks](https://img.shields.io/github/forks/badhope/resume-data.svg?style=social)](https://github.com/badhope/resume-data/network/members)

[Live Demo](#-live-demo) • [Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Contributing](#-contributing)

**English | [简体中文](README.md)**

<img src="https://img.shields.io/badge/Platform-Windows%20|%20macOS%20|%20Linux-lightgrey" alt="Platform">
<img src="https://img.shields.io/badge/Status-Production%20Ready-success" alt="Status">

</div>

---

## 📖 Introduction

Resume Cleaner is a comprehensive **enterprise-grade resume data cleaning SaaS platform** designed for HR professionals, recruiters, and hiring teams. It supports multi-format resume parsing, intelligent data extraction, highly customizable cleaning rules, and batch processing capabilities.

### ✨ Key Highlights

- 🚀 **Ready to Use** - Built-in default account, no complex configuration required
- 🔐 **Secure & Reliable** - JWT authentication + data encryption to protect user privacy
- 🎯 **Precise Cleaning** - Support for 985/211 universities, GPA ranking, and multi-dimensional filtering
- 📱 **Cross-Platform** - Responsive design supporting both desktop and mobile devices
- 🔗 **WeChat Integration** - Support for WeChat login, sharing, and notifications
- 📦 **Batch Processing** - Support for batch upload, cleaning, and export

---

## 🎬 Live Demo

| Environment | URL | Notes |
|------|------|------|
| Production | Coming Soon | Deploying... |
| Local Dev | http://localhost:3007 | See Quick Start |

### 🔑 Demo Account

| Username | Password | Description |
|------|------|------|
| `user` | `888888` | Default admin account, auto-created on first startup |

---

## 📸 Screenshots

<details>
<summary>Click to expand</summary>

| Login Page | Resume Upload |
|:---:|:---:|
| ![Login](docs/screenshots/login.png) | ![Upload](docs/screenshots/upload.png) |

| Cleaning Config | Cleaning Report |
|:---:|:---:|
| ![Config](docs/screenshots/config.png) | ![Report](docs/screenshots/report.png) |

</details>

---

## ✅ Features

### 📄 Resume Management

- [x] Multi-format support: PDF, Word(.docx/.doc), TXT, HTML
- [x] Batch upload and processing
- [x] Resume preview and editing
- [x] Local storage + cloud sync

### 🧹 Data Cleaning

- [x] **Education Filtering**
  - 985/211 university recognition
  - Double First-Class universities
  - Overseas universities QS ranking
  - Degree level filtering (Bachelor/Master/PhD)
- [x] **GPA Filtering**
  - Percentage ranking (Top 5%/10%/20%/30%)
  - GPA score filtering
  - Major ranking support
- [x] **Work Experience Filtering**
  - Company scale (Fortune 500/Public/Unicorn)
  - Years of experience
  - Industry sector
- [x] **Project Experience Filtering**
  - Project type
  - Project scale
  - Role in project
- [x] **Professional Skills Filtering**
  - Skill level
  - Certifications
- [x] **Other Filters**
  - Age range
  - Geographic restrictions
  - Keyword filtering

### 👤 User System

- [x] Email/Phone registration and login
- [x] WeChat OAuth login
- [x] JWT Token authentication
- [x] User profile management
- [x] Password recovery

### 📊 Data Analytics

- [x] Cleaning statistics report
- [x] Visualized charts
- [x] Data export (JSON/Excel/CSV)
- [x] Operation log query

### 🚚 Shipping Service

- [x] Multiple courier support (SF Express/JD/Zhongtong, etc.)
- [x] Shipping cost estimation
- [x] Logistics tracking
- [x] Shipping record management

### 📱 WeChat Integration

- [x] WeChat QR code login
- [x] Share resume to WeChat
- [x] Processing completion notifications

---

## 🛠️ Tech Stack

### Backend

| Technology | Description |
|------|------|
| ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green) | Modern, high-performance Python web framework |
| ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-orange) | Powerful Python ORM |
| ![Pydantic](https://img.shields.io/badge/Pydantic-2.0+-blue) | Data validation and serialization |
| ![JWT](https://img.shields.io/badge/JWT-Auth-red) | Secure user authentication |
| ![jieba](https://img.shields.io/badge/jieba-NLP-yellow) | Chinese word segmentation and NLP |

### Frontend

| Technology | Description |
|------|------|
| ![React](https://img.shields.io/badge/React-18+-blue) | Popular frontend UI framework |
| ![Ant Design](https://img.shields.io/badge/Ant%20Design-5+-red) | Enterprise-grade UI component library |
| ![Vite](https://img.shields.io/badge/Vite-5+-purple) | Next-generation frontend build tool |
| ![Axios](https://img.shields.io/badge/Axios-HTTP-green) | HTTP client library |

### Database

| Database | Description |
|------|------|
| ![SQLite](https://img.shields.io/badge/SQLite-Dev-lightgrey) | Lightweight embedded database |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prod-blue) | Enterprise-grade relational database |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/badhope/resume-data.git
cd resume-data

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Start backend server (port 8000)
cd ../backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. Start frontend server (port 3007) - New terminal window
cd frontend
npm run dev
```

### Access the Application

Open your browser and visit: http://localhost:3007

Login with default account:
- Username: `user`
- Password: `888888`

### Docker Deployment

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 📁 Project Structure

```
resume-data/
├── 📂 backend/                 # Backend code
│   ├── 📂 app/
│   │   ├── 📂 api/            # API routes
│   │   │   ├── auth.py        # User authentication
│   │   │   ├── resume.py      # Resume management
│   │   │   ├── config.py      # Cleaning configuration
│   │   │   ├── wechat.py      # WeChat integration
│   │   │   ├── logs.py        # Logging system
│   │   │   └── shipping.py    # Shipping service
│   │   ├── 📂 core/           # Core modules
│   │   ├── 📂 models/         # Data models
│   │   └── main.py            # Application entry
│   └── requirements.txt       # Python dependencies
├── 📂 frontend/               # Frontend code
│   ├── 📂 src/
│   │   ├── 📂 pages/          # Page components
│   │   ├── 📂 components/     # Shared components
│   │   ├── 📂 services/       # API services
│   │   └── App.jsx            # Application entry
│   └── package.json           # Node dependencies
├── 📂 test_resumes/           # Test resumes
├── 📂 docs/                   # Documentation
├── 📄 README.md               # Chinese documentation
├── 📄 README_EN.md            # English documentation
├── 📄 LICENSE                 # License
├── 📄 CONTRIBUTING.md         # Contributing guide
├── 📄 CHANGELOG.md            # Changelog
└── 📄 docker-compose.yml      # Docker configuration
```

---

## 📚 Documentation

| Document | Description |
|------|------|
| [User Guide](docs/USER_GUIDE.md) | Detailed usage tutorial |
| [API Docs](http://localhost:8000/docs) | FastAPI auto-generated API documentation |
| [Development Guide](docs/DEVELOPMENT.md) | Development setup and code standards |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment instructions |

---

## 🤝 Contributing

We welcome all forms of contributions!

### How to Contribute

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed guidelines, please refer to [CONTRIBUTING.md](CONTRIBUTING.md)

### Contributors

Thanks to all contributors!

<a href="https://github.com/badhope/resume-data/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=badhope/resume-data" />
</a>

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 🐛 Bug Reports

If you encounter any issues, please report them through:

- [Submit an Issue](https://github.com/badhope/resume-data/issues)
- [Join Discussion](https://github.com/badhope/resume-data/discussions)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🌟 Star History

If this project helps you, please give us a ⭐️ Star!

[![Star History Chart](https://api.star-history.com/svg?repos=badhope/resume-data&type=Date)](https://star-history.com/#badhope/resume-data&Date)

---

## 📧 Contact Us

- 📮 Email: contact@example.com
- 💬 WeChat: ResumeCleaner
- 🌐 Website: https://resumecleaner.example.com

---

<div align="center">

**Made with ❤️ by Resume Cleaner Team**

[⬆ Back to Top](#-resume-cleaner)

</div>
