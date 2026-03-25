# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🛡️ Security Features

Resume Cleaner implements the following security measures:

### Authentication & Authorization
- JWT Token-based authentication
- Password hashing with sha256_crypt
- Session management
- Role-based access control (RBAC)

### Data Protection
- All passwords are hashed before storage
- Sensitive data is encrypted at rest
- HTTPS enforced in production
- CORS configuration to prevent CSRF attacks

### Input Validation
- All user inputs are validated and sanitized
- File upload restrictions (type, size)
- SQL injection prevention through ORM
- XSS protection through React's built-in escaping

### Infrastructure
- Regular dependency updates
- Automated security scanning
- Container security best practices
- Environment variable management

## 🚨 Reporting a Vulnerability

We take the security of Resume Cleaner seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### Please do NOT:
- Open a public GitHub issue
- Share the vulnerability details publicly
- Attempt to access other users' data
- Perform actions that may affect other users

### Please DO:
1. **Email us** at security@example.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

2. **Wait for response** - We will acknowledge receipt within 48 hours

3. **Coordinated disclosure** - We will work with you to fix the issue and coordinate a disclosure timeline

### What to expect:
- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Fix timeline**: Depends on severity, typically 14-30 days
- **Credit**: We will credit you in our security advisories (if desired)

## 📋 Security Best Practices for Users

### For Administrators:
1. Change default credentials immediately
2. Use strong, unique passwords
3. Enable HTTPS in production
4. Regularly update dependencies
5. Monitor access logs
6. Implement backup strategies

### For Developers:
1. Never commit secrets to version control
2. Use environment variables for sensitive data
3. Keep dependencies up to date
4. Follow the principle of least privilege
5. Review code for security issues before merging

## 🔄 Security Updates

Security updates are released as patch versions (e.g., 1.0.1, 1.0.2). We recommend:
- Subscribe to GitHub Security Advisories
- Watch the repository for releases
- Update promptly when security patches are released

## 📞 Contact

For security concerns, contact:
- **Security Email**: security@example.com
- **PGP Key**: [Available upon request]
- **Response Time**: 48 hours for acknowledgment

---

Thank you for helping keep Resume Cleaner and our users safe! 🙏
