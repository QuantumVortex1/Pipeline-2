# Vulnerable Node.js API - DevSecOps Demo

⚠️ **WARNING**: This application contains **intentional security vulnerabilities** for educational and testing purposes only!

## Purpose

This API is designed to demonstrate how security scanning tools detect vulnerabilities in:
- **Dependencies** (npm packages with known CVEs)
- **Code** (insecure coding practices)
- **Container** (Docker misconfigurations)

## Intentional Vulnerabilities

### 📦 Dependency Vulnerabilities (SCA)
- `express@4.16.0` - CVE-2022-24999 (XSS)
- `lodash@4.17.4` - CVE-2019-10744 (Prototype Pollution)
- `jsonwebtoken@8.5.0` - CVE-2022-23529 (Signature verification bypass)
- `moment@2.19.3` - CVE-2022-31129 (ReDoS)
- `axios@0.18.0` - CVE-2021-3749 (SSRF)

### 🔓 Code Vulnerabilities
1. **Hardcoded Secrets** - JWT secret and API keys in code
2. **Code Injection** - `eval()` endpoint allows arbitrary code execution
3. **SQL Injection** - String concatenation in queries
4. **Prototype Pollution** - Vulnerable lodash merge
5. **SSRF** - Unvalidated URL proxy endpoint
6. **Weak Authentication** - Hardcoded credentials
7. **Information Disclosure** - Exposing sensitive data in responses
8. **Missing Security Headers** - No helmet.js
9. **No Rate Limiting** - Vulnerable to DoS
10. **ReDoS** - Vulnerable regex patterns

### 🐳 Container Vulnerabilities
1. **Outdated Base Image** - Node.js 14 (EOL)
2. **Running as Root** - No USER instruction
3. **Missing HEALTHCHECK**
4. **npm install vs npm ci** - Non-deterministic builds
5. **Exposed Debug Ports**

## API Endpoints

### GET /
Returns API documentation

### GET /health
Health check endpoint

### POST /login
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### GET /eval?code=2+2
⚠️ **CRITICAL**: Executes arbitrary JavaScript code!

### GET /user/:id
Returns user by ID (SQL injection simulation)

### POST /merge
```json
{
  "source": {"__proto__": {"polluted": true}}
}
```

### GET /proxy?url=http://example.com
⚠️ **CRITICAL**: SSRF vulnerability - can access internal services

### GET /date?input=2023-01-01
Uses vulnerable moment.js (ReDoS)

## Running Locally

```bash
# Install dependencies
npm install

# Start server
npm start

# Access API
curl http://localhost:3000
```

## Running with Docker

```bash
# Build image
docker build -t vulnerable-node-api .

# Run container
docker run -p 3000:3000 vulnerable-node-api
```

## Security Scanning

This project is designed to be scanned by:
- ✅ **OWASP Dependency-Check** - Finds npm CVEs
- ✅ **Trivy** - Scans container image and dependencies
- ✅ **Checkov** - Checks Dockerfile for misconfigurations
- ⚠️ **Bandit** - Skips (Python only)

## Expected Findings

### OWASP Dependency-Check
- 10+ HIGH/CRITICAL CVEs in npm packages

### Trivy
- 15+ CVEs in Node.js base image
- 10+ CVEs in npm dependencies

### Checkov
- CKV_DOCKER_2: Missing HEALTHCHECK
- CKV_DOCKER_3: Using latest tag
- CKV_DOCKER_8: Running as root
- CKV_DOCKER_9: No USER instruction

## DO NOT USE IN PRODUCTION!

This code is **intentionally insecure** and should **NEVER** be deployed to production environments.

## License

MIT - For educational purposes only
