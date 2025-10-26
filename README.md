# DevSecOps Pipeline Projekt

## Projektübersicht

Dieses Repository implementiert eine vollständige DevSecOps-Pipeline mit mehreren Security-Scans, die automatisch bei jedem Code-Check-In ausgeführt werden. Das Projekt demonstriert Best Practices für sichere Softwareentwicklung und Infrastructure as Code.

## Aufgabenstellung

> DevSecOps Pipeline
> 
> » Nutzt das Selbststudium, um in den Gruppen mit den genannten (und gern auch anderen) Tools eine kleine DevSecOps Pipeline aufzubauen. Mindestens 4 Tools sollen genutzt werden
> » Nutzt einen Mechanismus, um Security-Tools in der Pipeline zu automatisieren (z.B. Bei Code-Check-In wird automatisiert ein SAST gestartet…)
> » Lasst mind. 3 verschiede Code-Snippets oder kleine Programme (gern aus den bisherigen Vorlesungen im Rahmen des Studiengangs) durch die Pipeline laufen
> » Dokumentiert die Ergebnisse und Findings
> » Stellt die Ergebnisse und Erkenntnisse kurz (je Gruppe ca. 15 Min.) im kommenden Termin mit Demo vor.

## Verwendete Security-Tools

Die Pipeline setzt folgende Security-Tools automatisiert ein:

#### 1. **Bandit** - SAST für Python
- **Zweck**: Static Application Security Testing für Python-Code
- **Prüft**: Hardcoded Credentials, SQL Injection, Command Injection, schwache Kryptografie, unsichere Funktionen
- **Integration**: GitHub Actions mit SARIF-Upload ins Security Dashboard

#### 2. **Checkov** - IaC SAST
- **Zweck**: Infrastructure as Code Security Scanning
- **Prüft**: Terraform, Dockerfile, Kubernetes-Manifeste auf Security-Misconfigurations
- **Findings**: IAM-Rollen, Verschlüsselung, Network-Policies, Container-Sicherheit

#### 3. **Trivy** - Container Security Scanner
- **Zweck**: Container Image Vulnerability Scanning
- **Prüft**: OS-Packages, Python-Dependencies auf bekannte CVEs
- **Features**: CRITICAL/HIGH Severity Filtering, .trivyignore Support

#### 4. **OWASP Dependency-Check** - SCA
- **Zweck**: Software Composition Analysis für Third-Party Dependencies
- **Prüft**: Known Vulnerabilities in Libraries (CVE Database)
- **Scope**: Python packages (requirements.txt), Node.js (package.json)

<br>
Neben diesen automatisierten Tools werden folgende manuell nutzbare Security-Tools lokal bereitgestellt:

#### **OWASP ZAP** - DAST (lokal verfügbar)
- **Zweck**: Dynamic Application Security Testing
- **Prüft**: Laufende Anwendung auf XSS, CSRF, Security Headers
- **Verfügbar**: Via Docker Compose auf Port 8090

#### **OWASP Threat Dragon** - Threat Modeling (lokal)
- **Zweck**: Threat Modeling und Security Design Review
- **UI**: Web-basiert auf Port 3000
- **Verfügbar**: Via Docker Compose

## Automatisierte CI/CD Pipeline

Bei jedem `push` oder `pull_request` auf den `main`-Branch werden durch einen **GitHub Actions Workflow** automatisch folgende Jobs ausgeführt:
> `bandit-scan` → `checkov-scan` → `build-and-trivy` → `dependency-check`


**Alle Scan-Ergebnisse werden:**
- Als SARIF-Format ins GitHub Security Dashboard hochgeladen
- Als Workflow-Artefakte zum Download bereitgestellt


## Beispielanwendung: Minimal-App

Die Flask REST API in `src/minimal-app/` demonstriert **sichere** Implementierungspraktiken:

✅ **Keine Hardcoded Credentials** - Secrets via Umgebungsvariablen  
✅ **Sichere Kryptografie** - SHA256 statt MD5, `secrets.token_urlsafe()`  
✅ **Timing-Attack Prevention** - `secrets.compare_digest()` für Passwortvergleich  
✅ **Kein Debug-Modus** - Standardmäßig deaktiviert, via `FLASK_DEBUG` steuerbar  
✅ **Input Validation** - Sanitized User Input  
✅ **Non-Root Container** - Läuft als unprivilegierter User  

Im vorhergehenden Commit wurden gezielt unsichere Muster eingebaut, um die Effektivität der Security-Scans zu demonstrieren.


### Lokales Testen

```powershell
# Umgebungsvariablen setzen
$env:ADMIN_PASSWORD='SecurePassword123!'
$env:API_KEY='sk-prod-your-api-key'
$env:DATABASE_PASSWORD='YourDBPassword'

# App starten
cd src\minimal-app
pip install -r requirements.txt
python app.py
```

## Infrastructure as Code: Terraform

Das Projekt `src/terraform/` enthält eine vollständige gehärtete AWS EC2-Konfiguration mit allen Security Best Practices:

✅ **IAM Instance Profile** - Sichere Credential-Verwaltung ohne Access Keys  
✅ **EBS Root Volume Encryption** - Verschlüsselte Festplatten  
✅ **Detailed Monitoring** - CloudWatch Metriken für Security-Monitoring  
✅ **EBS-Optimized** - Performance-Optimierung  
✅ **IMDSv2 Enforcement** - Instance Metadata Service v2 (SSRF-Protection)  
✅ **Security Group** - Kontrollierter Netzwerkzugriff (SSH, HTTP, HTTPS)  
✅ **CloudWatch Alarms** - Automatisches CPU-Monitoring  


## Lokale Security-Tools mit Docker Compose

Die `docker-compose.yml` im Root-Verzeichnis startet OWASP Threat Dragon und ZAP:

```powershell
docker-compose up -d

# OWASP Threat Dragon UI öffnen
Start-Process "http://localhost:3000"
# OWASP ZAP Proxy öffnen
Start-Process "http://localhost:8090"

```


## GitHub Security Dashboard

Alle Scan-Ergebnisse werden automatisch in den **Security**-Tab hochgeladen.
Unter **Code scanning** können die Findings der Tools gefunden werden. Jeder Alert enthält:
   - **Severity** (Critical/High/Medium/Low)
   - **Betroffene Datei** + Zeilennummer
   - **CWE/CVE ID**
   - **Remediation-Vorschläge**