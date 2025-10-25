from flask import Flask, jsonify
import os

app = Flask(__name__)


@app.get("/")
def index():
    return jsonify(message="Hello, world!")


@app.get("/health")
def health():
    return jsonify(status="ok"), 200


if __name__ == "__main__":
    host = os.getenv("FLASK_RUN_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_RUN_PORT", "8080"))
    app.run(host=host, port=port)
