FROM python:3.12-alpine

RUN set -eux; \
    addgroup -S app 2>/dev/null || true; \
    adduser -S -G app -h /home/app -s /sbin/nologin app 2>/dev/null || true; \
    mkdir -p /home/app

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py ./

RUN chown -R app:app /app

ENV HOME=/home/app
USER app

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["python","-c","import urllib.request,sys;\n\ntry:\n    r=urllib.request.urlopen('http://127.0.0.1:8080/health')\n    sys.exit(0 if r.getcode()==200 else 1)\nexcept Exception:\n    sys.exit(1)"]

EXPOSE 8080

CMD ["python", "app.py"]