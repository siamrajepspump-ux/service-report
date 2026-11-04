"""
Sync CRM Tickets from Google Drive (Tickets.csv / Tickets_Cleaned.csv) into data/crm_tickets_cache.csv
Ensures both local and cloud Render instance always have the latest CRM tickets.
"""

import os
import sys
import csv
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
CACHE_CSV = os.path.join(DATA_DIR, "crm_tickets_cache.csv")

PRIMARY_DIR = r"G:\My Drive\Service_App_Data"
RAW_CSV = os.path.join(PRIMARY_DIR, "Tickets.csv")
CLEANED_CSV = os.path.join(PRIMARY_DIR, "Tickets_Cleaned.csv")

def clean_str(val):
    if val is None:
        return ""
    s = str(val).strip()
    if s.lower() in ["nan", "none"]:
        return ""
    return s

def sync_crm_cache():
    print("=" * 60)
    print(" [CRM Sync] Starting CRM Tickets Sync to Cache...")
    print("=" * 60)

    # 1. Check if raw Tickets.csv is newer than Tickets_Cleaned.csv, trigger clean_data
    if os.path.exists(RAW_CSV) and os.path.exists(CLEANED_CSV):
        try:
            if os.path.getmtime(RAW_CSV) > os.path.getmtime(CLEANED_CSV):
                print(" -> Tickets.csv is newer than Tickets_Cleaned.csv. Cleaning...")
                if PRIMARY_DIR not in sys.path:
                    sys.path.insert(0, PRIMARY_DIR)
                from clean_data import run_data_cleaning
                run_data_cleaning()
                print(" -> Cleaning complete!")
        except Exception as e:
            print(f" -> Auto-clean notice: {e}")

    source_csv = CLEANED_CSV if os.path.exists(CLEANED_CSV) else RAW_CSV
    if not os.path.exists(source_csv):
        print(f" [!] Source CRM CSV not found at: {source_csv}")
        return False

    if not os.path.exists(CACHE_CSV):
        print(f" [!] Cache CSV not found at: {CACHE_CSV}")
        return False

    # 2. Read existing cache into memory (dict by RequestNo / TicketKey)
    with open(CACHE_CSV, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        existing_rows = list(reader)

    # Ensure all comprehensive CRM fields are preserved in cache
    STANDARD_FIELDS = [
        "TicketKey", "TicketNo", "RequestNo", "VtigerTicket", "CRM ID", "Status",
        "Category", "Priority", "CreatedDate", "Created Time", "AppointmentDate",
        "Appointment Date", "Appointment Time", "CompletedDate", "Completed Date",
        "Customer", "Organization Name", "Site", "Address or Site", "ContactPerson",
        "Site Contact Person", "ContactPhone", "Site Contact Phone", "SalesOrder",
        "Sales Orders", "Product", "Model", "SerialNo", "Serial Number", "Group",
        "Request By Group", "AssignedTo", "Assigned To", "Assigned By", "ServiceBy",
        "Service By", "ProblemDetail", "Description", "Cause", "Prevention",
        "Solution", "Type", "Detail", "Start up Commissioning", "Inspection",
        "Reassembly", "Spare part Changing or Modification", "Repair", "Other",
        "Resolution_Days", "SyncedAt"
    ]
    for sf in STANDARD_FIELDS:
        if sf not in fieldnames:
            fieldnames.append(sf)

    cache_dict = {}
    for idx, r in enumerate(existing_rows):
        key = clean_str(r.get("RequestNo")) or clean_str(r.get("TicketNo")) or clean_str(r.get("TicketKey"))
        if key:
            cache_dict[key] = idx

    print(f" -> Existing cache loaded: {len(existing_rows)} records (Field count: {len(fieldnames)})")

    # 3. Read source Cleaned CSV and merge
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    updated_count = 0
    new_count = 0

    with open(source_csv, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for r in reader:
            req_no = clean_str(r.get("Title"))
            vtiger_no = clean_str(r.get("Ticket Number"))
            if not req_no:
                req_no = vtiger_no
            if not req_no:
                continue

            created_time = clean_str(r.get("Created Time"))
            created_date = created_time.split(" ")[0] if created_time else ""
            appt_date = clean_str(r.get("Appointment Date"))
            appt_date_only = appt_date.split(" ")[0] if appt_date else ""
            comp_date = clean_str(r.get("Completed Date"))
            comp_date_only = comp_date.split(" ")[0] if comp_date else ""

            row_data = {
                "TicketKey": req_no,
                "TicketNo": req_no,
                "RequestNo": req_no,
                "VtigerTicket": vtiger_no,
                "CRM ID": "CRM",
                "Status": clean_str(r.get("Status")) or "Open",
                "Category": clean_str(r.get("Category")),
                "Priority": clean_str(r.get("Priority")),
                "CreatedDate": created_date,
                "Created Time": created_time,
                "AppointmentDate": appt_date_only,
                "Appointment Date": appt_date,
                "Appointment Time": clean_str(r.get("Appointment Time")),
                "CompletedDate": comp_date_only,
                "Completed Date": comp_date,
                "Customer": clean_str(r.get("Organization Name")),
                "Organization Name": clean_str(r.get("Organization Name")),
                "Site": clean_str(r.get("Address or Site")),
                "Address or Site": clean_str(r.get("Address or Site")),
                "ContactPerson": clean_str(r.get("Site Contact Person")),
                "Site Contact Person": clean_str(r.get("Site Contact Person")),
                "ContactPhone": clean_str(r.get("Site Contact Phone")),
                "Site Contact Phone": clean_str(r.get("Site Contact Phone")),
                "SalesOrder": clean_str(r.get("Sales Orders")),
                "Sales Orders": clean_str(r.get("Sales Orders")),
                "Product": clean_str(r.get("Product")),
                "Model": clean_str(r.get("Model")),
                "SerialNo": clean_str(r.get("Serial Number")),
                "Serial Number": clean_str(r.get("Serial Number")),
                "Group": clean_str(r.get("Request By Group")),
                "Request By Group": clean_str(r.get("Request By Group")),
                "AssignedTo": clean_str(r.get("Assigned To")),
                "Assigned To": clean_str(r.get("Assigned To")),
                "Assigned By": clean_str(r.get("Assigned By")),
                "ServiceBy": clean_str(r.get("Service By")),
                "Service By": clean_str(r.get("Service By")),
                "ProblemDetail": clean_str(r.get("Description")),
                "Description": clean_str(r.get("Description")),
                "Cause": clean_str(r.get("Cause")),
                "Prevention": clean_str(r.get("Prevention")),
                "Solution": clean_str(r.get("Solution")),
                "Type": clean_str(r.get("Type")),
                "Detail": clean_str(r.get("Detail")),
                "Start up Commissioning": clean_str(r.get("Start up Commissioning")),
                "Inspection": clean_str(r.get("Inspection")),
                "Reassembly": clean_str(r.get("Reassembly")),
                "Spare part Changing or Modification": clean_str(r.get("Spare part Changing or Modification")),
                "Repair": clean_str(r.get("Repair")),
                "Other": clean_str(r.get("Other")),
                "SyncedAt": now_str
            }

            # Normalize to fieldnames
            clean_item = {fn: row_data.get(fn, "") for fn in fieldnames}

            if req_no in cache_dict:
                existing_rows[cache_dict[req_no]].update(clean_item)
                updated_count += 1
            else:
                existing_rows.append(clean_item)
                cache_dict[req_no] = len(existing_rows) - 1
                new_count += 1

    # 4. Write back to crm_tickets_cache.csv
    with open(CACHE_CSV, mode="w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(existing_rows)

    print(f" -> Sync completed: {updated_count} updated, {new_count} newly added!")
    print(f" -> Total tickets in cache: {len(existing_rows)}")
    
    # Show top 5 latest numeric tickets
    numeric_reqs = [int(r["RequestNo"]) for r in existing_rows if r.get("RequestNo") and r["RequestNo"].isdigit()]
    if numeric_reqs:
        print(f" -> Latest 5 Request Nos: {sorted(numeric_reqs)[-5:]}")

    print("=" * 60)
    return True

if __name__ == "__main__":
    sync_crm_cache()
