from flask import Flask, jsonify, request
import os
from datetime import datetime

app = Flask(__name__)

items = {}
request_counter = 0


@app.get("/")
def index():
    """Root endpoint with API information"""
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
        ]
    )


@app.get("/health")
def health():
    """Health check endpoint"""
    jsonify(status="ok", timestamp=datetime.now().astimezone().isoformat()), 200


@app.get("/info")
def info():
    """Runtime information endpoint"""
    global request_counter
    request_counter += 1
    return jsonify(
        environment=os.getenv("ENVIRONMENT", "development"),
        python_version=f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
        requests_served=request_counter,
        items_count=len(items),
        timestamp=datetime.now().astimezone().isoformat()
    )


@app.get("/items")
def list_items():
    """List all items"""
    return jsonify(items=list(items.values()), count=len(items)), 200


@app.post("/items")
def create_item():
    """Create a new item"""
    data = request.get_json()
    
    # Input validation
    if not data or "name" not in data:
        return jsonify(error="Missing required field: name"), 400
    
    # Sanitize input (prevent XSS, limit length)
    name = str(data.get("name", "")).strip()[:100]
    description = str(data.get("description", "")).strip()[:500]
    
    if not name:
        return jsonify(error="Name cannot be empty"), 400
    
    # Generate simple ID
    item_id = f"item-{len(items) + 1}"
    
    item = {
        "id": item_id,
        "name": name,
        "description": description,
        "created_at": datetime.utcnow().isoformat()
    }
    
    items[item_id] = item
    return jsonify(item), 201


@app.get("/items/<item_id>")
def get_item(item_id):
    """Get a specific item by ID"""
    # Sanitize item_id to prevent injection
    item_id = str(item_id).strip()[:50]
    
    if item_id not in items:
        return jsonify(error="Item not found"), 404
    
    return jsonify(items[item_id]), 200


@app.delete("/items/<item_id>")
def delete_item(item_id):
    """Delete an item by ID"""
    # Sanitize item_id
    item_id = str(item_id).strip()[:50]
    
    if item_id not in items:
        return jsonify(error="Item not found"), 404
    
    deleted_item = items.pop(item_id)
    return jsonify(message="Item deleted", item=deleted_item), 200


@app.errorhandler(404)
def not_found(error):
    """Custom 404 handler"""
    return jsonify(error="Endpoint not found"), 404


@app.errorhandler(500)
def internal_error(error):
    """Custom 500 handler"""
    return jsonify(error="Internal server error"), 500


if __name__ == "__main__":
    host = os.getenv("FLASK_RUN_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_RUN_PORT", "8080"))
    app.run(host=host, port=port)
