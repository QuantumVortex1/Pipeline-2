DevOps Pipeline als 4er- Gruppe

## Aufgabe  

DevSecOps Pipeline    
    
» Nutzt das Selbststudium, um in den Gruppen mit den genannten (und gern auch
anderen) Tools eine kleine DevSecOps Pipeline aufzubauen. Mindestens 4 Tools sollen
genutzt werden      
» Nutzt einen Mechanismus, um Security-Tools in der Pipeline zu automatisieren (z.B. Bei
Code-Check-In wird automatisiert ein SAST gestartet…)    
» Lasst mind. 3 verschiede Code-Snippets oder kleine Programme (gern aus den
bisherigen Vorlesungen im Rahmen des Studiengangs) durch die Pipeline laufen    
» Dokumentiert die Ergebnisse und Findings     
» Stellt die Ergebnisse und Erkenntnisse kurz (je Gruppe ca. 15 Min.) im kommenden
Termin mit Demo vor.    

# DevSecOps Pipeline - Beispiel

Dieses Repository stellt eine kleine, praxisnahe DevSecOps-Pipeline bereit. Sie enthält:

- Drei kleine Beispielprojekte, die durch die Pipeline laufen:
	- `samples/python-flask` - kleines Flask-App-Beispiel (SAST, DAST, Container-Scan)
	- `samples/nodejs` - Node.js-Beispiel mit Abhängigkeiten (SCA)
	- `samples/iac` - kleines IaC (Terraform) Beispiel (IaC SAST)
- Ein GitHub Actions CI-Workflow (`.github/workflows/ci.yml`) der bei `push` und `pull_request` automatisch mehrere Security-Scans startet
- Ein `docker-compose.yml` zur lokalen Bereitstellung von ausgewählten Tools (OWASP Threat Dragon, OWASP ZAP UI)

Verwendete Sicherheits-Tools (mind. 4):

- Bandit (SAST für Python)
- OWASP Dependency-Check (SCA)
- Checkov (IaC SAST)
- Trivy (Container- / Image-Scanning)
- OWASP ZAP (DAST)
- OWASP Threat Dragon (Threat Modeling, lokal per Docker-Compose)

Ziel: Bei Code-Check-In (GitHub) laufen automatisiert SAST/SCA/IaC/Container/DAST-Scans; Reports werden als Artefakte angehängt.

Kurzanleitung — GitHub Actions (CI)

1. Push oder PR in dieses Repository auslösen. Die GitHub Actions Workflow-Datei `.github/workflows/ci.yml` enthält Jobs für:
	 - Bandit (Python SAST)
	 - OWASP Dependency-Check (Node.js SCA, via Docker-Container)
	 - Checkov (IaC-Scan)
	 - Build eines Beispiel-Containers, Scan mit Trivy
	 - Start der Beispiel-App und DAST mit OWASP ZAP
2. Reports werden als Workflow-Artefakte angehängt (JSON/HTML)

Lokales Testen mit Docker Compose

Die `docker-compose.yml` enthält Dienste zum lokalen Hosten von OWASP Threat Dragon (Web-UI fürs Threat Modeling) und OWASP ZAP UI. Um lokal zu starten (PowerShell):

```powershell
cd "c:\Users\sassi\Documents\DevSecOps_Pipeline\DevSecOps-Pipeline"
docker-compose up -d
```

Die Threat-Modeling-UI ist danach lokal erreichbar unter `http://localhost:3000`.

Wie die Beispielprojekte manuell durchsucht werden können (lokal)

- Python SAST (Bandit):
	- `pip install bandit`
	- `bandit -r samples/python-flask`
- Node SCA (Dependency-Check CLI via Docker):
	- `docker run --rm -v ${PWD}/samples/nodejs:/src owasp/dependency-check:latest --scan /src`
- IaC (Checkov):
	- `pip install checkov`
	- `checkov -d samples/iac`
- Container-Scan (Trivy):
	- `docker build -t sample-app:latest ./samples/python-flask`
	- `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image sample-app:latest`

Nächste Schritte / Erweiterungen

- Integration von DefectDojo (Vulnerability Management) — kann per API angebunden werden (nicht im Minimal-Setup)
- Ergänzung Semgrep oder SonarQube für weitere SAST-Regeln
- Optional: GitHub Pages / Self-hosting der Reporting-UI

Viel Erfolg beim Ausprobieren — die CI/Compose-Dateien sind im Repo. Siehe unten für die einzelnen Dateien.

## Mögliche Tools


Threat modelling OWASP Threat Dragon   
Vulnerability Management Defect Dojo   
Software Composition Analysis (SCA) OWASP Dependency Check   
SAST Bandit, Brakeman, Sonarqube, Semgrep   
DAST OWASP Zed Attack Proxy (ZAP)   
IAST Contrast Security (community edition)   
Container Security Clair, AquaSec Trivy, Anchore, Docker   
Content Trust   
SAST for IaC Tfsec, Checkov, Kics (Checkmarx)    