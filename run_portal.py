"""
Siamraj Service Report — One-Click Runner
"""

import os
import sys
import time
import socket
import webbrowser
import threading
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
sys.path.append(BACKEND_DIR)

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def open_browser():
    time.sleep(1.5)
    url = "http://localhost:8000"
    print(f"\n[Portal] Opening web browser at {url} ...")
    webbrowser.open(url)

if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("=" * 65)
    print("  SIAMRAJ SERVICE REPORT — ระบบงานบริการครบวงจร")
    print("=" * 65)
    print(f"[Portal] Base directory: {BASE_DIR}")

    port = 8000
    if is_port_in_use(port):
        print(f"[Portal] Notice: Port {port} is already in use.")
        # Check if already running Siamraj Portal
        already_running = False
        try:
            import urllib.request
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health", timeout=1.5) as resp:
                if resp.status == 200:
                    already_running = True
        except Exception:
            already_running = False

        if already_running:
            print(f"[Portal] Siamraj Portal is ALREADY RUNNING at http://localhost:{port}!")
            print(f"[Portal] Opening browser now...")
            webbrowser.open(f"http://localhost:{port}")
            print("[Portal] Portal is active. Press CTRL+C to close.")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                sys.exit(0)
        else:
            # If port in use by orphaned/hung process, free it on Windows
            if sys.platform == "win32":
                try:
                    import subprocess
                    output = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode()
                    for line in output.strip().split("\n"):
                        parts = line.split()
                        if len(parts) >= 5 and "LISTENING" in parts:
                            pid = parts[-1]
                            print(f"[Portal] Clearing old process PID {pid} on port {port}...")
                            subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
                            time.sleep(1)
                except Exception as e:
                    print(f"[Portal] Could not auto-clear port: {e}")

    print(f"[Portal] Starting Unified Backend Server on http://0.0.0.0:{port} ...")
    threading.Thread(target=open_browser, daemon=True).start()

    from app import app
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
