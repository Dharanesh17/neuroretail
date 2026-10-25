"""DEPRECATED: backend/server.py has been consolidated into backend/app.py.

This file is maintained for backward compatibility. Executing this file will run
the canonical Flask application defined in app.py.
"""
import sys
import warnings

warnings.warn(
    "backend/server.py is deprecated and consolidated into backend/app.py. "
    "Please run 'python app.py' directly.",
    DeprecationWarning,
    stacklevel=2,
)

from app import app, db

def run(port=5000):
    print("DEPRECATION NOTICE: Running canonical Flask API from app.py...")
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    port = 5000
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run(port=port)
