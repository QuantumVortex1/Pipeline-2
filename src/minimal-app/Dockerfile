FROM python:3.11-slim

# Create a non-root user and group (idempotent)
RUN set -eux; \
    groupadd -r app 2>/dev/null || true; \
    useradd -r -g app -d /home/app -s /usr/sbin/nologin -c "App user" app 2>/dev/null || true; \
    mkdir -p /home/app

WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt ./

# Install pinned dependencies without caching wheels on the image
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py ./

# Make the application directory owned by non-root user
RUN chown -R app:app /app

ENV HOME=/home/app
USER app

# Healthcheck uses Python to avoid adding curl to the image
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["python","-c","import urllib.request,sys;\n\ntry:\n    r=urllib.request.urlopen('http://127.0.0.1:8080/health')\n    sys.exit(0 if r.getcode()==200 else 1)\nexcept Exception:\n    sys.exit(1)"]

EXPOSE 8080

CMD ["python", "app.py"]
