"""
Google Apps Script (GAS) & Google Sheets Synchronization Module
Unified backend module for syncing Service Reports & PDFs to Google Sheets & Google Drive
"""

import os
import json
import base64
import threading
import requests
from datetime import datetime
from typing import Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_FILE = os.path.join(BASE_DIR, "data", "gas_config.json")

def get_gas_config() -> Dict[str, Any]:
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[GAS] Config read error: {e}")
    return {"enabled": False, "webapp_url": "", "last_synced": None, "last_status": None}

def save_gas_config(webapp_url: str, enabled: bool = True) -> Dict[str, Any]:
    cfg = get_gas_config()
    cfg["webapp_url"] = webapp_url.strip()
    cfg["enabled"] = bool(enabled and cfg["webapp_url"])
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    return cfg

def build_gas_payload(ticket_no: str, data: Dict[str, Any], pdf_path: Optional[str] = None) -> Dict[str, Any]:
    # Extract customer and site
    customer = data.get("customer") or data.get("Customer") or data.get("exp_customer") or data.get("sat_customer") or ""
    plant = data.get("plant") or data.get("Plant") or data.get("Site") or data.get("site") or data.get("exp_place") or ""
    model = data.get("model") or data.get("PumpModel") or data.get("cr_pump_model") or data.get("insp_sheet_model") or ""
    serial = data.get("serial_no") or data.get("SerialNo") or data.get("cr_pump_serial") or data.get("insp_sheet_serial") or ""
    serviced_by = data.get("serviced_by") or data.get("tech_signer_name") or data.get("Tech") or data.get("tech") or ""
    serviced_date = data.get("serviced_date") or data.get("date") or data.get("cr_serviced_date") or data.get("exp_date") or ""
    status = data.get("_status", "submitted")

    # Forms included
    form_instances = data.get("form_instances", [])
    if form_instances:
        forms_list = []
        for fi in form_instances:
            code = fi.get("code", "")
            lbl = fi.get("customLabel")
            forms_list.append(f"{code} ({lbl})" if lbl else code)
        forms_included = ", ".join(forms_list)
    else:
        forms_included = "FM-EPS-23"

    # Total Expense
    total_expense = "-"
    if "exp_cost_labor" in data or "exp_amt_labor" in data:
        items = []
        for k in ["labor", "toll", "gas", "equip", "allowance", "hotel", "other"]:
            amt = data.get(f"exp_amt_{k}")
            if amt:
                items.append(f"{amt}")
        if items:
            total_expense = " / ".join(items)

    # Satisfaction Score
    sat_score = "-"
    if data.get("sat_total_score"):
        sat_score = f"{data.get('sat_total_score')} / 56 ({data.get('sat_percent', '100%')})"

    # Handle PDF base64 encoding if file exists and is under 20MB
    pdf_base64 = None
    pdf_filename = None
    if pdf_path and os.path.exists(pdf_path):
        size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
        if size_mb <= 20:
            try:
                with open(pdf_path, "rb") as pf:
                    pdf_base64 = base64.b64encode(pf.read()).decode("utf-8")
                pdf_filename = os.path.basename(pdf_path)
            except Exception as e:
                print(f"[GAS] Base64 PDF encode error: {e}")

    return {
        "action": "sync_report",
        "request_no": ticket_no,
        "ticket_no": ticket_no,
        "status": status,
        "customer": customer,
        "plant": plant,
        "model": model,
        "serial": serial,
        "serviced_by": serviced_by,
        "serviced_date": serviced_date,
        "forms_included": forms_included,
        "total_expense": total_expense,
        "sat_score": sat_score,
        "pdf_filename": pdf_filename or f"SERVICE_REPORT_{ticket_no}.pdf",
        "pdf_base64": pdf_base64,
        "raw_data": {
            "ticket_no": ticket_no,
            "status": status,
            "updated_at": datetime.now().isoformat()
        }
    }

def sync_to_google_sheet(ticket_no: str, data: Dict[str, Any], pdf_path: Optional[str] = None, async_mode: bool = True) -> Dict[str, Any]:
    cfg = get_gas_config()
    if not cfg.get("enabled") or not cfg.get("webapp_url"):
        return {"ok": False, "skipped": True, "reason": "GAS sync not enabled or URL not configured"}

    def _do_sync():
        try:
            url = cfg["webapp_url"]
            payload = build_gas_payload(ticket_no, data, pdf_path)
            print(f"[GAS] Syncing ticket {ticket_no} to Google Sheets ({url[:45]}...)")
            
            # Google Apps Script web apps redirect 302 to googleusercontent.com
            resp = requests.post(url, json=payload, timeout=45, allow_redirects=True)
            if resp.status_code == 200:
                res_data = resp.json()
                cfg["last_synced"] = datetime.now().isoformat()
                cfg["last_status"] = "success"
                save_gas_config(cfg["webapp_url"], True)
                print(f"[GAS] Sync SUCCESS for ticket {ticket_no}: {res_data}")
                return res_data
            else:
                cfg["last_status"] = f"error HTTP {resp.status_code}"
                print(f"[GAS] Sync failed HTTP {resp.status_code}: {resp.text[:200]}")
                return {"ok": False, "status_code": resp.status_code, "text": resp.text[:200]}
        except Exception as e:
            cfg["last_status"] = f"exception {str(e)}"
            print(f"[GAS] Sync Exception: {e}")
            return {"ok": False, "error": str(e)}

    if async_mode:
        t = threading.Thread(target=_do_sync, daemon=True)
        t.start()
        return {"ok": True, "async": True, "ticket_no": ticket_no}
    else:
        return _do_sync()

def test_gas_connection(webapp_url: str) -> Dict[str, Any]:
    try:
        url = webapp_url.strip()
        resp = requests.get(url, timeout=15, allow_redirects=True)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, dict) and data.get("ok") is False:
                return {"ok": False, "error": data.get("error", "GAS returned error"), "response": data}
            return {"ok": True, "response": data}
        return {"ok": False, "status_code": resp.status_code, "text": resp.text[:200]}
    except Exception as e:
        return {"ok": False, "error": str(e)}
