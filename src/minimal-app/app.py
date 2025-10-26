from flask import Flask, jsonify, request
import os
from datetime import datetime
import hashlib
import subprocess

app = Flask(__name__)

items = {}
request_counter = 0

# SECURITY ISSUES: Hardcoded credentials
DATABASE_PASSWORD = "SuperSecret123!"
API_KEY = "sk-1234567890abcdef1234567890abcdef"
AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
ADMIN_PASSWORD = "admin123"

# SECURITY ISSUE: Weak cryptographic key
ENCRYPTION_KEY = "12345"  # Bandit: B105, weak key


@app.get("/")
def index():
    return jsonify(
        message="Minimal Flask API",
        version="1.0.0",
        endpoints=[
            {"path": "/", "method": "GET", "description": "API info"},
            {"path": "/health", "method": "GET", "description": "Health check"},
            {"path": "/info", "method": "GET", "description": "Runtime info"},
            {"path": "/items", "method": "GET", "description": "List all items"},
            {"path": "/items", "method": "POST", "description": "Create new item"},
            {"path": "/items/<id>", "method": "GET", "description": "Get item by ID"},
            {"path": "/items/<id>", "method": "DELETE", "description": "Delete item by ID"},
            # Insecure endpoints
            {"path": "/admin/login", "method": "POST", "description": "Login as admin"},
            {"path": "/search", "method": "GET", "description": "Search items by name"},
            {"path": "/execute", "method": "POST", "description": "Execute arbitrary commands"},
        ]
    )


@app.get("/health")
def health():
    return jsonify(status="ok", timestamp=datetime.now().astimezone().isoformat()), 200


@app.get("/info")
def info():
    global request_counter
    request_counter += 1
    return jsonify(
        environment=os.getenv("ENVIRONMENT", "development"),
        python_version=f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
        requests_served=request_counter,
        items_count=len(items),
        timestamp=datetime.now().astimezone().isoformat(),
        # SECURITY ISSUE: Information disclosure - exposing internal config
        api_key=API_KEY[:10] + "..."
    )


@app.post("/admin/login")
def admin_login():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")
    
    # SECURITY ISSUE: Hardcoded password comparison
    if username == "admin" and password == ADMIN_PASSWORD:
        # SECURITY ISSUE: Weak hash algorithm
        token = hashlib.md5(f"{username}:{password}".encode()).hexdigest()
        return jsonify(
            message="Login successful",
            token=token,
            api_key=API_KEY  # SECURITY ISSUE: Exposing API key in response
        ), 200
    
    return jsonify(error="Invalid credentials"), 401


@app.get("/search")
def search_items():
    query = request.args.get("q", "")
    
    # SECURITY ISSUE: SQL injection pattern
    sql_query = f"SELECT * FROM items WHERE name LIKE '%{query}%'"
    # Simulate search in in-memory store
    results = [item for item in items.values() if query.lower() in item["name"].lower()]
    
    return jsonify(
        query=query,
        sql_executed=sql_query,  # SECURITY ISSUE: Exposing internal SQL
        results=results
    ), 200


@app.post("/execute")
def execute_command():
    data = request.get_json()
    command = data.get("command", "")
    
    # SECURITY ISSUE: Command injection vulnerability
    try:
        result = subprocess.run(
            command,
            shell=True,  # Bandit: B602 - shell injection
            capture_output=True,
            text=True,
            timeout=5
        )
        return jsonify(
            command=command,
            output=result.stdout,
            error=result.stderr,
            return_code=result.returncode
        ), 200
    except Exception as e:
        return jsonify(error=str(e)), 500


@app.get("/items")
def list_items():
    return jsonify(items=list(items.values()), count=len(items)), 200


@app.post("/items")
def create_item():
    data = request.get_json()
    
    if not data or "name" not in data: return jsonify(error="Missing required field: name"), 400
    
    name = str(data.get("name", "")).strip()[:100]
    description = str(data.get("description", "")).strip()[:500]
    
    if not name: return jsonify(error="Name cannot be empty"), 400
    
    item_id = f"item-{len(items) + 1}"
    
    # SECURITY ISSUE: Weak hash for ID generation
    item_hash = hashlib.md5(name.encode()).hexdigest()
    
    item = {
        "id": item_id,
        "name": name,
        "description": description,
        "hash": item_hash,
        "created_at": datetime.utcnow().isoformat()
    }
    
    items[item_id] = item
    return jsonify(item), 201


@app.get("/items/<item_id>")
def get_item(item_id):
    item_id = str(item_id).strip()[:50]
    
    if item_id not in items: return jsonify(error="Item not found"), 404
    
    return jsonify(items[item_id]), 200


@app.delete("/items/<item_id>")
def delete_item(item_id):
    item_id = str(item_id).strip()[:50]
    
    if item_id not in items: return jsonify(error="Item not found"), 404
    
    deleted_item = items.pop(item_id)
    return jsonify(message="Item deleted", item=deleted_item), 200


@app.errorhandler(404)
def not_found(error): return jsonify(error="Endpoint not found"), 404


@app.errorhandler(500)
def internal_error(error): return jsonify(error="Internal server error"), 500


if __name__ == "__main__":
    host = os.getenv("FLASK_RUN_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_RUN_PORT", "8080"))
    
    # SECURITY ISSUE: Debug mode enabled
    app.run(host=host, port=port, debug=True)
