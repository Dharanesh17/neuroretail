"""Vercel serverless entry point.

Wraps the Flask backend (backend/app.py) as a Vercel Python serverless
function.  Vercel's Python runtime auto-detects the Flask ``app`` variable
and handles the WSGI conversion — no manual handler needed.
"""
import os
import sys

# Add the backend directory to the Python path so that backend imports resolve
_backend = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "backend")
)
if _backend not in sys.path:
    sys.path.insert(0, _backend)

# Import the Flask app — this initialises all routes, the database, and ML models
from app import app  # noqa: E402

# Vercel's @vercel/python runtime detects the `app` (Flask) variable automatically
