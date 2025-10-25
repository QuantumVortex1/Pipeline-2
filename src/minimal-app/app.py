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
    # Avoid binding to all interfaces by default to satisfy SAST checks
    # and reduce accidental exposure during local development.
    # To explicitly bind to all interfaces (e.g., when running inside a container),
    # set the environment variable FLASK_RUN_HOST=0.0.0.0
    host = os.getenv("FLASK_RUN_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_RUN_PORT", "8080"))
    app.run(host=host, port=port)
