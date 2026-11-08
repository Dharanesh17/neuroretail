# This file makes backend/ a proper Python package so that Vercel's
# tool.vercel.entrypoint = "backend.app:app" can import the Flask app.
#
# Add this directory to sys.path so that absolute imports like
# `from data_store import db` resolve correctly when Vercel imports
# `backend.app` as a package (the backend/ dir won't be on sys.path
# by default in that case).
import os
import sys

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
