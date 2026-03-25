# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CI/CD workflow with GitHub Actions
- Automated testing pipeline
- Code coverage reporting

## [1.0.0] - 2024-03-25

### Added

#### User System
- User registration and login with email/phone
- JWT Token authentication
- WeChat OAuth login integration
- User profile management
- Default admin account (user/888888)

#### Resume Management
- Multi-format support (PDF, Word, TXT, HTML)
- Batch upload and processing
- Resume preview and editing
- Local storage with SQLite
- Resume data export (JSON, Excel, CSV)

#### Data Cleaning
- **Education Filtering**
  - 985/211 university recognition
  - Double First-Class universities support
  - Overseas universities QS ranking
  - Degree level filtering (Bachelor/Master/PhD)
- **GPA Filtering**
  - Percentage ranking (Top 5%/10%/20%/30%)
  - GPA score filtering
  - Major ranking support
- **Work Experience Filtering**
  - Company scale (Fortune 500/Public/Unicorn)
  - Years of experience
  - Industry sector
- **Project Experience Filtering**
  - Project type
  - Project scale
  - Role in project
- **Professional Skills Filtering**
  - Skill level
  - Certifications
- **Other Filters**
  - Age range
  - Geographic restrictions
  - Keyword filtering

#### WeChat Integration
- WeChat QR code login
- JSAPI share configuration
- Template message notifications
- Processing status push notifications

#### Logging System
- Operation log recording
- Log query and filtering
- Log statistics and visualization
- Log export (JSON/CSV)

#### Shipping Service
- Multiple courier support (SF Express, JD, ZTO, etc.)
- Shipping order creation
- Logistics tracking query
- Shipping cost estimation

#### Data Analysis
- Cleaning statistics report
- Visualized charts
- Data comparison before/after cleaning

### Technical Details

#### Backend
- FastAPI framework with async support
- SQLAlchemy ORM with SQLite database
- Pydantic for data validation
- JWT authentication with sha256_crypt
- NLP processing with jieba

#### Frontend
- React 18 with functional components
- Ant Design 5 for UI components
- Vite 5 for build tooling
- Axios for HTTP requests
- Responsive design for mobile devices

#### Security
- JWT Token authentication
- Password encryption with sha256_crypt
- CORS configuration
- Input validation and sanitization

### Documentation
- Chinese README (README.md)
- English README (README_EN.md)
- Contributing guide (CONTRIBUTING.md)
- Code of conduct (CODE_OF_CONDUCT.md)
- MIT License

## [0.1.0] - 2024-01-15

### Added
- Initial project structure
- Basic resume upload functionality
- Simple text parsing
- Basic cleaning rules
- Web interface with React

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-03-25 | First stable release with full features |
| 0.1.0 | 2024-01-15 | Initial development version |

---

[Unreleased]: https://github.com/badhope/resume-data/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/badhope/resume-data/releases/tag/v1.0.0
[0.1.0]: https://github.com/badhope/resume-data/releases/tag/v0.1.0
