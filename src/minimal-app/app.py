from flask import Flask, jsonify, request
import os
from datetime import datetime
import hashlib
import secrets

app = Flask(__name__)

items = {}
request_counter = 0

DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "")
API_KEY = os.getenv("API_KEY", "")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", secrets.token_hex(32))


@app.get("/")
def index():
    return jsonify(
        message="Secure Flask API",
        version="1.0.0",
        endpoints=[
            {"path": "/", "method": "GET", "description": "API info"},
            {"path": "/health", "method": "GET", "description": "Health check"},
            {"path": "/info", "method": "GET", "description": "Runtime info"},
            {"path": "/items", "method": "GET", "description": "List all items"},
            {"path": "/items", "method": "POST", "description": "Create new item"},
            {"path": "/items/<id>", "method": "GET", "description": "Get item by ID"},
            {"path": "/items/<id>", "method": "DELETE", "description": "Delete item by ID"},
            {"path": "/admin/login", "method": "POST", "description": "Login as admin"},
            {"path": "/search", "method": "GET", "description": "Search items by name"}
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
        timestamp=datetime.now().astimezone().isoformat()
    )


@app.post("/admin/login")
def admin_login():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")
    
    if username == "admin" and password == ADMIN_PASSWORD:
        token = hashlib.sha256(f"{username}:{password}:{secrets.token_hex(16)}".encode(), usedforsecurity=True).hexdigest()
        return jsonify(
            message="Login successful",
            token=token
        ), 200
    
    return jsonify(error="Invalid credentials"), 401


@app.get("/search")
def search_items():
    query = request.args.get("q", "")
    results = [item for item in items.values() if query.lower() in item["name"].lower()]
    
    return jsonify(
        query=query,
        results=results
    ), 200


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
    
    item_hash = hashlib.sha256(name.encode(), usedforsecurity=False).hexdigest()
    
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
    
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    app.run(host=host, port=port, debug=debug_mode)
