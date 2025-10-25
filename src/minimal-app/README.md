# Minimal Python service

This folder contains a minimal, hardened Python Flask service using a **distroless** final image to minimize CVE surface area.

## Files
- `app.py` — tiny Flask app with `/` and `/health` endpoints
- `requirements.txt` — pinned dependency (Flask==2.2.5)
- `Dockerfile` — multistage build with distroless runtime (gcr.io/distroless/python3-debian12:nonroot)
- `.trivyignore` — suppresses unfixable LOW-severity CVEs from base OS packages
- `.dockerignore` — excludes unnecessary files from build context

## Architecture
- **Build stage**: Uses `python:3.11-slim` to install dependencies and upgrade pip (addresses CVE-2025-8869).
- **Final stage**: Uses Google's distroless Python image (no shell, no package manager, minimal OS packages) running as non-root user (UID 65532).

## Build and run

### Local build (PowerShell)
```powershell
cd src\minimal-app
docker build -t minimal-app:local .
docker run --rm -p 8080:8080 minimal-app:local
```

### Environment variables
- `FLASK_RUN_HOST` (default: `0.0.0.0` in container, `127.0.0.1` when running app.py directly)
- `FLASK_RUN_PORT` (default: `8080`)

To override host/port when running locally:
```powershell
$env:FLASK_RUN_HOST='127.0.0.1'
$env:FLASK_RUN_PORT='5000'
python src\minimal-app\app.py
```

## Scan the built image with Trivy
```powershell
# Build first if not yet built
docker build -t minimal-app:local .

# Scan image (uses .trivyignore to suppress LOW CVEs)
trivy image minimal-app:local

# Scan without ignoring LOW (to see full list)
trivy image --severity LOW,MEDIUM,HIGH,CRITICAL minimal-app:local
```

## Notes
- The distroless image has **no shell** and cannot run HEALTHCHECK commands internally. Use Kubernetes liveness/readiness probes or external monitoring.
- The project intentionally uses a single pinned dependency and a minimal runtime image to reduce vulnerabilities.
- All LOW-severity CVEs from unfixable Debian packages are suppressed via `.trivyignore`. Review and adjust based on your risk tolerance.
- The builder stage upgrades pip to mitigate CVE-2025-8869; the final image contains only runtime dependencies.

## Production considerations
- For production, consider using a production WSGI server like `gunicorn` instead of Flask's built-in server.
- Monitor and rebuild regularly to pick up security patches in base images.
- Use Kubernetes probes for health checking instead of Docker HEALTHCHECK.
