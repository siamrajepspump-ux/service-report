"""
Siamraj Service Report — Production Cloud Entrypoint
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"[Production] Starting Siamraj Service Report on port {port} ...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
