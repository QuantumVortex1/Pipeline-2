# ============================================================
FROM python:3.11-slim AS builder

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt ./
RUN pip install --no-cache-dir --target /app/deps -r requirements.txt

COPY app.py ./

# ============================================================
FROM gcr.io/distroless/python3-debian12:nonroot

COPY --from=builder /app/deps /app/deps
COPY --from=builder /app/app.py /app/app.py

ENV PYTHONPATH=/app/deps
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8080

WORKDIR /app

EXPOSE 8080


CMD ["app.py"]
