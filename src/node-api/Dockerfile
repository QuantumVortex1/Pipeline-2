# Using newer Node.js LTS version (reduced CVEs)
FROM node:20-alpine

# VULNERABILITY 1: Running as root user (no USER instruction)
WORKDIR /app

# Copy package files
COPY package*.json ./

# VULNERABILITY 2: Using npm install instead of npm ci (non-deterministic builds)
RUN npm install

# Copy application code
COPY . .

# VULNERABILITY 3: Exposing unnecessary debug port
EXPOSE 3000
EXPOSE 9229

# VULNERABILITY 4: No HEALTHCHECK instruction
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# VULNERABILITY 5: Running application as root
CMD ["node", "server.js"]

# Missing security best practices:
# - No USER instruction (running as root)
# - No multi-stage build
# - Exposing debug port 9229
