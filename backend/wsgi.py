"""
Production WSGI Entrypoint for NeuroRetail
Uses Waitress for production-grade, multi-threaded request serving on Windows & cross-platform.
"""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from app import app

if __name__ == "__main__":
    from waitress import serve
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    threads = int(os.getenv("WAITRESS_THREADS", "8"))
    print(f"Starting NeuroRetail Production Server on http://{host}:{port} with {threads} threads...")
    serve(app, host=host, port=port, threads=threads)

