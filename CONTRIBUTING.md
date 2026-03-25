# Contributing to Resume Cleaner

First off, thank you for considering contributing to Resume Cleaner! It's people like you that make Resume Cleaner such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to contact@example.com.

---

## How Can I Contribute?

### Report Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Python version, Node version, etc.)

### Suggest Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain the expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the coding standards
- Document new code based on the Documentation Style Guide
- End all files with a newline

---

## Development Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- Git

### Setup Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/resume-data.git
cd resume-data

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install backend dependencies
cd backend
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Create a branch for your changes
git checkout -b feature/your-feature-name
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## Coding Standards

### Python

- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints for function parameters and return values
- Write docstrings for all public functions and classes
- Maximum line length: 100 characters
- Use meaningful variable names

```python
def clean_resume(resume_id: int, config: CleaningConfig) -> CleanedResume:
    """
    Clean a resume based on the provided configuration.
    
    Args:
        resume_id: The ID of the resume to clean
        config: The cleaning configuration to apply
        
    Returns:
        CleanedResume: The cleaned resume object
        
    Raises:
        ResumeNotFoundError: If the resume doesn't exist
    """
    pass
```

### JavaScript/React

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks
- Use meaningful variable names
- Maximum line length: 100 characters
- Use ESLint and Prettier for code formatting

```javascript
const ResumeCard = ({ resume, onClean, onDelete }) => {
  const [loading, setLoading] = useState(false)
  
  const handleClean = async () => {
    setLoading(true)
    try {
      await onClean(resume.id)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card>
      {/* Component content */}
    </Card>
  )
}
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```
feat(auth): add WeChat OAuth login support

- Implement WeChat OAuth 2.0 flow
- Add WeChat login button to login page
- Store WeChat user info in database

Closes #123
```

```
fix(resume): resolve file upload issue for large files

The upload was failing for files larger than 10MB due to
incorrect chunk size configuration.

Fixes #456
```

---

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Write/update tests** for your changes

4. **Update documentation** if needed

5. **Commit your changes** following commit guidelines

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Test results

8. **Address review comments** if any

9. **Wait for approval** from maintainers

10. **Celebrate!** 🎉 Your PR will be merged

---

## Questions?

Feel free to open an issue or reach out to us at contact@example.com.

Thank you for your contributions! ❤️
