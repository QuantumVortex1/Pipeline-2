# VULNERABILITY 1: Using outdated Node.js version with known CVEs
FROM node:14

# VULNERABILITY 2: Running as root user (no USER instruction)
WORKDIR /app

# Copy package files
COPY package*.json ./

# VULNERABILITY 3: Using npm install instead of npm ci (non-deterministic builds)
RUN npm install

# Copy application code
COPY . .

# VULNERABILITY 4: Exposing unnecessary ports
EXPOSE 3000
EXPOSE 9229

# VULNERABILITY 5: No HEALTHCHECK instruction
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# VULNERABILITY 6: Running application as root
CMD ["node", "server.js"]

# Missing security best practices:
# - No .dockerignore to exclude sensitive files
# - No multi-stage build
# - No image scanning
# - No security scanning in build process
# - Verbose labels missing for accountability
