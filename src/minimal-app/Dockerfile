# ============================================================
# Build stage: install dependencies in a full Python image
# ============================================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Upgrade pip to latest version to address CVE-2025-8869
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements and install to a target directory
COPY requirements.txt ./
RUN pip install --no-cache-dir --target /app/deps -r requirements.txt

# Copy application code
COPY app.py ./

# ============================================================
# Final stage: minimal distroless runtime image
# ============================================================
FROM gcr.io/distroless/python3-debian12:nonroot

# Copy installed dependencies and application from builder
COPY --from=builder /app/deps /app/deps
COPY --from=builder /app/app.py /app/app.py

# Set PYTHONPATH so Python can find installed packages
ENV PYTHONPATH=/app/deps
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8080

WORKDIR /app

EXPOSE 8080

# Distroless runs as nonroot by default (UID 65532)
# No HEALTHCHECK in distroless (no shell), monitor externally or use k8s probes

CMD ["app.py"]
