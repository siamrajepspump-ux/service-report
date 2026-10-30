"""
ISO Forms PDF Generator Engine for Siamraj Service Report
Supported Forms:
  - FM-EPS-22 Rev.05 Check Report (Aligned 100% to Master in 'From FM')
  - FM-EPS-23 Rev.04 / Rev.05 Service Report
  - FM-EPS-25 Rev.06 Spare Parts Replacement
  - FM-EPS-31 Rev.09 Inspection Report
  - FM-EPS-45 Rev.01 Customer Satisfaction
  - PHOTO_REPORT (A4 Photo Grid Layout)
"""

import os
import io
import json
import base64
import textwrap
from typing import Dict, Any, List, Optional
import pymupdf
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPLATES_DIR = os.path.join(BASE_DIR, "data", "templates")
FROM_FM_DIR = os.path.join(BASE_DIR, "From FM")
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
OUTPUT_PDF_DIR = os.path.join(STORAGE_DIR, "output_pdf")

# Fonts
FONTS_LOCAL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
BUNDLED_FONT_TH = os.path.join(FONTS_LOCAL_DIR, "THSarabunNew.ttf")
BUNDLED_FONT_TH_B = os.path.join(FONTS_LOCAL_DIR, "THSarabunNew-Bold.ttf")

if os.path.exists(BUNDLED_FONT_TH):
    FONT_TH = BUNDLED_FONT_TH
    FONT_TH_B = BUNDLED_FONT_TH_B if os.path.exists(BUNDLED_FONT_TH_B) else BUNDLED_FONT_TH
else:
    FONT_TH = r"C:\Windows\Fonts\THSarabunNew.ttf"
    FONT_TH_B = r"C:\Windows\Fonts\THSarabunNew Bold.ttf"

class IsoPdfEngine:
    def __init__(self):
        self.has_th_font = os.path.exists(FONT_TH)

    def _get_template_path(self, form_code: str) -> Optional[str]:
        # Priority mapping: Check From FM first, then data/templates
        mapping = {
            "FM-EPS-22": [
                os.path.join(FROM_FM_DIR, "FM-EPS-22 Rev.05 Check Report.pdf"),
                os.path.join(TEMPLATES_DIR, "FM-EPS-22_Rev05_master.pdf"),
                os.path.join(TEMPLATES_DIR, "FM-EPS-22_ฟอร์มกรอกได้.pdf")
            ],
            "FM-EPS-23": [
                os.path.join(FROM_FM_DIR, "FM-EPS-23 Rev.04  Service Report.pdf"),
                os.path.join(TEMPLATES_DIR, "FM-EPS-23_ฟอร์มกรอกได้.pdf")
            ],
            "FM-EPS-25": [
                os.path.join(FROM_FM_DIR, "FM-EPS-25 Rev.06  รายการเปลี่ยนชิ้นส่วน.pdf"),
                os.path.join(TEMPLATES_DIR, "FM-EPS-25_ฟอร์มกรอกได้.pdf")
            ],
            "FM-EPS-31": [
                os.path.join(FROM_FM_DIR, "FM-EPS-31 Rev.09  Inspection Report.pdf"),
                os.path.join(TEMPLATES_DIR, "FM-EPS-31_ฟอร์มกรอกได้.pdf")
            ],
            "FM-EPS-21": [
                os.path.join(FROM_FM_DIR, "Form_FM-EPS-21 Rev.07  Service Expense.pdf"),
                os.path.join(TEMPLATES_DIR, "FM-EPS-21_Rev07_master.pdf"),
                os.path.join(TEMPLATES_DIR, "Form_FM-EPS-21 Rev.07  Service Expense.pdf"),
                os.path.join(TEMPLATES_DIR, "FM-EPS-21.pdf")
            ],
            "FM-EPS-45": [
                os.path.join(TEMPLATES_DIR, "FM-EPS-45_Rev00_master.pdf"),
                os.path.join(FROM_FM_DIR, "FM-EPS-45 Rev.00 แบบประเมินความพึงพอใจ การให้บริการ.pdf"),
                os.path.join(TEMPLATES_DIR, "FM-EPS-45_ฟอร์มกรอกได้.pdf")
            ]
        }
        paths = mapping.get(form_code, [])
        for p in paths:
            if os.path.exists(p):
                return p
        return None

    def _insert_text(self, page, x: float, y: float, text: str, size: float = 10.0, bold: bool = False, color=(0, 0, 0), max_w: float = 0):
        if not text:
            return
        text_str = str(text).strip()
        if not text_str or text_str == "-":
            # For empty or dash
            return

        fontname = "thb" if bold else "th"
        if self.has_th_font:
            fontfile = FONT_TH_B if bold else FONT_TH
            page.insert_font(fontname=fontname, fontfile=fontfile)
            f = pymupdf.Font(fontfile=fontfile)
        else:
            fontname = "helv"
            f = pymupdf.Font("helv")

        # Auto shrink font size if max_w is set and text exceeds it
        if max_w > 0:
            w = f.text_length(text_str, fontsize=size)
            if w > max_w:
                ratio = max_w / w
                size = max(6.5, size * ratio)

        page.insert_text((x, y), text_str, fontsize=size, fontname=fontname, color=color)

    def _insert_centered_text(self, page, cx: float, y: float, text: str, size: float = 9.5, bold: bool = False, color=(0, 0, 0)):
        if not text:
            return
        text_str = str(text).strip()
        if not text_str or text_str == "-":
            text_str = "-"

        fontname = "thb" if bold else "th"
        if self.has_th_font:
            fontfile = FONT_TH_B if bold else FONT_TH
            page.insert_font(fontname=fontname, fontfile=fontfile)
            f = pymupdf.Font(fontfile=fontfile)
        else:
            fontname = "helv"
            f = pymupdf.Font("helv")

        w = f.text_length(text_str, fontsize=size)
        x = cx - (w / 2.0)
        page.insert_text((x, y), text_str, fontsize=size, fontname=fontname, color=color)

    def _insert_tick(self, page, x: float, y: float, size: float = 8.5, color=(0.8, 0, 0), width: float = 1.35):
        """Draw a vector checkmark (เครื่องหมายถูก ✓) at given center coordinates"""
        p1 = pymupdf.Point(x - size * 0.38, y - size * 0.05)
        p2 = pymupdf.Point(x - size * 0.08, y + size * 0.38)
        p3 = pymupdf.Point(x + size * 0.45, y - size * 0.45)
        page.draw_polyline([p1, p2, p3], color=color, width=width, lineCap=1, lineJoin=1)

    def _insert_signature(self, page, rect: tuple, base64_data: str):
        """Insert signature image from base64 into a target rect (x0, y0, x1, y1)"""
        if not base64_data:
            return
        try:
            if "," in base64_data:
                base64_data = base64_data.split(",", 1)[1]
            img_bytes = base64.b64decode(base64_data)
            r = pymupdf.Rect(*rect)
            page.insert_image(r, stream=img_bytes, keep_proportion=True)
        except Exception as e:
            print(f"[IsoPdfEngine] Error inserting signature: {e}")

    def _wrap_text(self, text: str, width: int = 65) -> List[str]:
        """Wrap text into lines without breaking individual words or tokens"""
        if not text:
            return []
        paragraphs = str(text).split("\n")
        lines = []
        for p in paragraphs:
            p_clean = p.strip()
            if not p_clean:
                continue
            wrapped = textwrap.wrap(p_clean, width=width, break_long_words=False, break_on_hyphens=False)
            if wrapped:
                lines.extend(wrapped)
            else:
                lines.append(p_clean)
        return lines

    def _parse_date_dmy_parts(self, val: Any) -> tuple:
        """Parse date value into (day, month, year) strings in DD, MM, YYYY format (ว/ด/ป)."""
        if not val:
            return ("", "", "")
        s = str(val).strip()
        if not s or s == "-":
            return ("", "", "")
        d_part = s.split()[0].split("T")[0]
        
        if "-" in d_part:
            parts = d_part.split("-")
            if len(parts) == 3:
                if len(parts[0]) == 4:  # YYYY-MM-DD
                    return (parts[2].zfill(2), parts[1].zfill(2), parts[0])
                elif len(parts[2]) in [2, 4]:  # DD-MM-YYYY
                    return (parts[0].zfill(2), parts[1].zfill(2), parts[2])
        elif "/" in d_part:
            parts = d_part.split("/")
            if len(parts) == 3:
                if len(parts[0]) == 4:  # YYYY/MM/DD
                    return (parts[2].zfill(2), parts[1].zfill(2), parts[0])
                else:  # DD/MM/YYYY
                    return (parts[0].zfill(2), parts[1].zfill(2), parts[2])
        return ("", "", "")

    def _format_date_dmy(self, val: Any) -> str:
        """Format date to DD/MM/YYYY (ว/ด/ป) string."""
        if not val:
            return "-"
        s = str(val).strip()
        if not s or s == "-":
            return "-"
        day, mon, yr = self._parse_date_dmy_parts(s)
        if day and mon and yr:
            return f"{day}/{mon}/{yr}"
        return s

    # =========================================================================
    # FM-EPS-22: CHECK REPORT (REV.05 - 100% ACCURACY TO SAMPLE)
    # =========================================================================
    def fill_fm_eps_22(self, data: Dict[str, Any], output_path: str) -> str:
        template = self._get_template_path("FM-EPS-22")
        if not template:
            raise FileNotFoundError("FM-EPS-22 template not found")

        doc = pymupdf.open(template)
        page = doc[0]

        # 1. Top Header
        self._insert_text(page, 395, 118, data.get("request_no", ""), size=11, bold=True, max_w=80)
        self._insert_text(page, 518, 118, self._format_date_dmy(data.get("date", "")), size=10, max_w=58)

        # 2. General & Equipment Metadata (4 rows)
        # Row 1: Customer | Plant | Contact person | Tel.
        cust = str(data.get("customer") or "-").strip() or "-"
        plant = str(data.get("plant") or "-").strip() or "-"
        contact_person = str(data.get("contact_person") or "-").strip() or "-"
        contact_no = str(data.get("contact_no") or "-").strip() or "-"
        self._insert_text(page, 95, 161, cust, size=9.5, max_w=85)
        self._insert_text(page, 215, 161, plant, size=9.5, max_w=65)
        self._insert_text(page, 342, 161, contact_person, size=9.5, max_w=95)
        self._insert_text(page, 465, 161, contact_no, size=9.5, max_w=105)

        # Row 2: Pump brand | Model | Serial no. | Pump code
        self._insert_text(page, 115, 178, data.get("pump_brand", ""), size=9.5, max_w=65)
        self._insert_text(page, 215, 178, data.get("pump_model", ""), size=9.5, max_w=65)
        self._insert_text(page, 335, 178, data.get("serial_no", ""), size=9.5, max_w=100)
        self._insert_text(page, 495, 178, data.get("pump_code", ""), size=9.5, max_w=75)

        # Row 3: Motor brand | KW | RPM | Max. amp
        self._insert_text(page, 115, 190, data.get("motor_brand", ""), size=9.5, max_w=65)
        self._insert_text(page, 205, 190, str(data.get("motor_kw", "")), size=9.5, max_w=70)
        self._insert_text(page, 310, 190, str(data.get("motor_rpm", "")), size=9.5, max_w=125)
        self._insert_text(page, 495, 190, str(data.get("motor_max_amp", "")), size=9.5, max_w=75)

        # Row 4: Gear | Ratio | Model | Serial no.
        self._insert_text(page, 85, 208, data.get("gear_brand", data.get("gear", "")), size=9.5, max_w=95)
        self._insert_text(page, 210, 208, str(data.get("gear_ratio", "")), size=9.5, max_w=68)
        self._insert_text(page, 315, 208, data.get("gear_model", ""), size=9.5, max_w=120)
        self._insert_text(page, 495, 208, data.get("gear_serial", ""), size=9.5, max_w=75)

        # 3. Service Subject Checkboxes
        subj = str(data.get("service_subject", "")).lower()
        subjs_list = [str(s).lower() for s in data.get("service_subjects", [])]
        if "start" in subj or any("start" in s for s in subjs_list):
            self._insert_tick(page, 212.8, 223.7)
        if "align" in subj or any("align" in s for s in subjs_list):
            self._insert_tick(page, 363.1, 223.7)
        if "pm" in subj or any("pm" in s for s in subjs_list):
            self._insert_tick(page, 460.4, 225.3)

        # 4. Visual Check Items (8 rows)
        vis_ticks_x = {"normal": 297.36, "adjusted": 329.04, "service": 360.72}
        y_starts = [278, 290, 302, 314, 326, 338, 350, 362]
        checklist = data.get("visual_checklist", [])
        for i, y in enumerate(y_starts):
            item_data = checklist[i] if i < len(checklist) else {}
            status = str(item_data.get("status", "normal")).lower()
            tx = vis_ticks_x.get(status, 297.36)
            self._insert_tick(page, tx, y)

            remark = item_data.get("remark", "")
            if remark:
                self._insert_text(page, 382, y, remark, size=8.5, max_w=86)
            note = item_data.get("note", "")
            if note:
                self._insert_text(page, 477, y, note, size=8.5, max_w=93)

        # 5. Alignment Check & Reset
        al = data.get("alignment", {})
        al_cols_cx = [99.48, 131.40, 165.48, 199.20] # 0, 90, 180, 270

        # Check: Radial (y=533), X (y=546)
        c_rad = al.get("check_radial", {})
        c_x = al.get("check_x", {})
        for idx, deg in enumerate(["0", "90", "180", "270"]):
            self._insert_centered_text(page, al_cols_cx[idx], 533, c_rad.get(deg, "-"), size=8.5)
            self._insert_centered_text(page, al_cols_cx[idx], 546, c_x.get(deg, "-"), size=8.5)

        # Reset: Radial (y=584), X (y=597)
        r_rad = al.get("reset_radial", {})
        r_x = al.get("reset_x", {})
        for idx, deg in enumerate(["0", "90", "180", "270"]):
            self._insert_centered_text(page, al_cols_cx[idx], 584, r_rad.get(deg, "-"), size=8.5)
            self._insert_centered_text(page, al_cols_cx[idx], 597, r_x.get(deg, "-"), size=8.5)

        if al.get("sv_gauge"):
            self._insert_text(page, 190, 609, str(al.get("sv_gauge")), size=8.5, max_w=70)

        # Alignment Note lines (4 lines)
        al_note = str(al.get("note", "")).strip()
        if al_note:
            note_lines = al_note.split("\n")
            for l_idx, line_txt in enumerate(note_lines[:4]):
                self._insert_text(page, 85 if l_idx == 0 else 60, 622 + (l_idx * 13), line_txt, size=8.5, max_w=150)

        # 6. Vibration & Bearing Temp Table
        vib = data.get("vibration", {})
        vib_cols_cx = [297.36, 329.04, 360.72, 392.40, 424.08, 455.76, 497.52, 548.88] # DE H,V,A, NDE H,V,A, Temp DE, NDE
        machine_y = {"pump": 558, "motor": 571, "gear": 583}
        for m_key, y_val in machine_y.items():
            m_data = vib.get(m_key, {})
            vals = [
                m_data.get("dh", "-"), m_data.get("dv", "-"), m_data.get("da", "-"),
                m_data.get("nh", "-"), m_data.get("nv", "-"), m_data.get("na", "-"),
                m_data.get("t_de", "-"), m_data.get("t_nde", "-")
            ]
            for c_idx, val in enumerate(vals):
                self._insert_centered_text(page, vib_cols_cx[c_idx], y_val, str(val), size=8.5)

        if vib.get("meter_sv"):
            self._insert_text(page, 440, 518, str(vib.get("meter_sv")), size=8)
        if vib.get("thermometer_sv"):
            self._insert_text(page, 510, 530, str(vib.get("thermometer_sv")), size=8)

        # 7. Operation Condition
        op = data.get("operation", {})
        op_cx = [424.08, 455.76, 489.00] # U, V, W
        # Insulation
        self._insert_centered_text(page, op_cx[0], 622, op.get("ins_u", "-"), size=8.5)
        self._insert_centered_text(page, op_cx[1], 622, op.get("ins_v", "-"), size=8.5)
        self._insert_centered_text(page, op_cx[2], 622, op.get("ins_w", "-"), size=8.5)
        # Current
        self._insert_centered_text(page, op_cx[0], 634, op.get("cur_u", "-"), size=8.5)
        self._insert_centered_text(page, op_cx[1], 634, op.get("cur_v", "-"), size=8.5)
        self._insert_centered_text(page, op_cx[2], 634, op.get("cur_w", "-"), size=8.5)
        # Voltage
        self._insert_centered_text(page, op_cx[0], 647, op.get("vol_uv", "-"), size=8.5)
        self._insert_centered_text(page, op_cx[1], 647, op.get("vol_uw", "-"), size=8.5)
        self._insert_centered_text(page, op_cx[2], 647, op.get("vol_vw", "-"), size=8.5)
        # Speed
        self._insert_centered_text(page, 457.32, 659, op.get("speed", "-"), size=8.5)

        # 8. Recommendation (4 lines max)
        rec_txt = str(data.get("recommendation", "")).strip()
        if rec_txt:
            rec_lines = rec_txt.split("\n")
            for r_idx, r_line in enumerate(rec_lines[:4]):
                self._insert_text(page, 60, 695 + (r_idx * 14), r_line, size=9.5, max_w=510)

        # 9. Signatures & Serviced Time
        # Technician Box (x=117 to 215, y=755 to 769)
        if data.get("sign_tech"):
            self._insert_signature(page, (120, 755, 212, 768), data["sign_tech"])
        else:
            self._insert_centered_text(page, 166, 765, data.get("serviced_by", "-"), size=9.5)

        self._insert_centered_text(page, 166, 779, self._format_date_dmy(data.get("serviced_date", data.get("date", "-"))), size=9.5)

        # Serviced Time: Start & Finished
        self._insert_text(page, 320, 765, data.get("time_start", "-"), size=9.5, max_w=80)
        self._insert_text(page, 330, 779, data.get("time_finished", "-"), size=9.5, max_w=75)

        # Customer Box (x=471 to 577, y=755 to 769)
        if data.get("sign_customer"):
            self._insert_signature(page, (475, 755, 573, 768), data["sign_customer"])
        else:
            self._insert_centered_text(page, 524, 765, data.get("customer_signer_name", "-"), size=9.5)

        cust_dt = data.get("customer_sign_datetime")
        if not cust_dt:
            s_d = self._format_date_dmy(data.get("serviced_date") or data.get("date") or "")
            t_f = data.get("time_finished", "")
            cust_dt = f"{s_d} {t_f}".strip()
        else:
            # Format if contains date
            parts = cust_dt.split()
            if len(parts) >= 1:
                parts[0] = self._format_date_dmy(parts[0])
                cust_dt = " ".join(parts)
        self._insert_centered_text(page, 524, 779, cust_dt or "-", size=9)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        doc.close()
        return output_path

    # =========================================================================
    # FM-EPS-23: SERVICE REPORT
    # =========================================================================
    def fill_fm_eps_23(self, data: Dict[str, Any], output_path: str) -> str:
        template = self._get_template_path("FM-EPS-23")
        if not template:
            raise FileNotFoundError("FM-EPS-23 template not found")

        doc = pymupdf.open(template)
        page = doc[0]

        # Header fields
        # Request No. line at x=309..408, y=129.6
        self._insert_text(page, 312, 126, data.get("request_no", "-"), size=10, bold=True, max_w=95)
        # Date line at x=478..545, y=129.5
        self._insert_text(page, 480, 126, self._format_date_dmy(data.get("date", "-")), size=10, bold=True, max_w=65)

        # Equipment Info Row 1 (y ≈ 171)
        cust = str(data.get("customer") or "-").strip() or "-"
        plant = str(data.get("plant") or "-").strip() or "-"
        contact_person = str(data.get("contact_person") or "-").strip() or "-"
        contact_no = str(data.get("contact_no") or "-").strip() or "-"
        self._insert_text(page, 65, 171, cust, size=9.5, max_w=95)
        self._insert_text(page, 190, 171, plant, size=9.5, max_w=80)
        self._insert_text(page, 337, 171, contact_person, size=9.5, max_w=85)
        self._insert_text(page, 447, 171, contact_no, size=9.5, max_w=120)

        # Row 2 (y ≈ 185)
        self._insert_text(page, 77, 185, data.get("pump_brand", "-"), size=9.5, max_w=85)
        self._insert_text(page, 195, 185, data.get("pump_model", "-"), size=9.5, max_w=73)
        self._insert_text(page, 314, 185, data.get("serial_no", "-"), size=9.5, max_w=108)
        self._insert_text(page, 475, 185, data.get("pump_code", "-"), size=9.5, max_w=95)

        # Row 3 (y ≈ 200)
        self._insert_text(page, 78, 200, data.get("motor_brand", "-"), size=9.5, max_w=85)
        self._insert_text(page, 190, 200, str(data.get("motor_kw", "-")), size=9.5, max_w=78)
        self._insert_text(page, 300, 200, str(data.get("motor_rpm", "-")), size=9.5, max_w=122)
        self._insert_text(page, 468, 200, str(data.get("motor_max_amp", "-")), size=9.5, max_w=100)

        # Row 4 (y ≈ 214)
        gear_brand = data.get("gear_brand", data.get("gear", "-"))
        self._insert_text(page, 52, 214, gear_brand, size=9.5, max_w=110)
        self._insert_text(page, 192, 214, str(data.get("gear_ratio", "-")), size=9.5, max_w=76)
        self._insert_text(page, 307, 214, data.get("gear_model", "-"), size=9.5, max_w=115)
        self._insert_text(page, 468, 214, data.get("gear_serial", "-"), size=9.5, max_w=100)

        # Service Subject Checkboxes
        subjects = data.get("service_subjects", [])
        if "Installation" in subjects: self._insert_tick(page, 186.4, 240.9)
        if "Inspection" in subjects: self._insert_tick(page, 337.3, 240.9)
        if "Repair" in subjects: self._insert_tick(page, 186.4, 257.3)
        if "Modification" in subjects: self._insert_tick(page, 337.3, 257.3)
        if "Other" in subjects or data.get("subject_other"):
            self._insert_tick(page, 186.4, 273.7)
            self._insert_text(page, 235, 273, data.get("subject_other", ""), size=9.0, max_w=150)

        # Problem / Symptoms Checkboxes
        problems = data.get("problem_ticks", [])
        prob_coords = {
            "seal_leak": (188.3, 300.5),
            "pump_noise": (255.7, 301.9),
            "pump_heat": (331.7, 301.8),
            "pressure_drop": (402.7, 301.9),
            "flow_drop": (489.0, 301.4),
            "misalignment": (187.9, 316.8),
            "motor_noise": (189.3, 332.5),
            "motor_heat": (259.2, 333.5),
            "gear_ring_broken": (187.7, 349.2),
            "hub_flange_damage": (282.8, 348.8)
        }
        for p in problems:
            coord = prob_coords.get(p)
            if coord:
                self._insert_tick(page, coord[0], coord[1])

        # Problem Etc. text
        if data.get("problem_etc"):
            self._insert_text(page, 145, 368, data["problem_etc"], size=9.0, max_w=420)

        # Cause & Investigation (lines at y=392, 408, 425)
        cause_text = data.get("cause", "")
        if cause_text:
            c_lines = self._wrap_text(cause_text, width=60)
            cause_y = [390, 406, 423]
            for i, line in enumerate(c_lines[:3]):
                max_w = 480 if i < 2 else 315
                self._insert_text(page, 90, cause_y[i], line, size=9.0, max_w=max_w)

        # Cause Ref document
        if data.get("cause_ref_check") or data.get("cause_ref"):
            self._insert_tick(page, 417.9, 431.2)
            if data.get("cause_ref"):
                self._insert_text(page, 475, 434, data["cause_ref"], size=8.5, max_w=95)

        # Repairing (lines at y=465, 481, 498, 514)
        repair_text = data.get("repairing", "")
        if repair_text:
            r_lines = self._wrap_text(repair_text, width=60)
            rep_y = [463, 479, 496, 512]
            for i, line in enumerate(r_lines[:4]):
                max_w = 480 if i < 3 else 315
                self._insert_text(page, 90, rep_y[i], line, size=9.0, max_w=max_w)

        # Repairing Ref document
        if data.get("repairing_ref_check") or data.get("repairing_ref"):
            self._insert_tick(page, 417.9, 520.7)
            if data.get("repairing_ref"):
                self._insert_text(page, 475, 523, data["repairing_ref"], size=8.5, max_w=95)

        # Prevention Checkboxes
        prev = data.get("prevention_ticks", [])
        if "no_run_dry" in prev: self._insert_tick(page, 156.0, 543.7)
        if "every_time_pump_motor_removed" in prev or "alignment_training" in prev:
            self._insert_tick(page, 156.0, 560.6)
        if "alignment_3_months" in prev: self._insert_tick(page, 156.0, 577.1)
        if "oil_change_schedule" in prev: self._insert_tick(page, 156.0, 593.8)
        if "other" in prev or data.get("prevention_other"):
            self._insert_tick(page, 156.0, 610.2)
            p_other = data.get("prevention_other", "")
            if p_other:
                po_lines = self._wrap_text(p_other, width=52)
                if len(po_lines) > 0: self._insert_text(page, 198, 618, po_lines[0], size=8.5, max_w=370)
                if len(po_lines) > 1: self._insert_text(page, 170, 634, po_lines[1], size=8.5, max_w=400)
                if len(po_lines) > 2: self._insert_text(page, 170, 651, po_lines[2], size=8.5, max_w=235)

        # Prevention Ref document
        if data.get("prev_ref_check") or data.get("prev_ref"):
            self._insert_tick(page, 417.9, 659.6)
            if data.get("prev_ref"):
                self._insert_text(page, 475, 662, data["prev_ref"], size=8.5, max_w=95)

        # Test Results
        test_res = data.get("test_result", "")
        test_details = data.get("test_result_details", {})
        if test_res == "test_run" or "test_run" in test_details:
            self._insert_tick(page, 156.0, 682.6)
            dt = data.get("test_run_detail") or test_details.get("test_run", "")
            if dt: self._insert_text(page, 205, 683, dt, size=8.5, max_w=360)
        elif test_res == "no_test_run" or "no_test_run" in test_details:
            self._insert_tick(page, 156.0, 699.6)
            dt = data.get("no_test_run_detail") or test_details.get("no_test_run", "")
            if dt: self._insert_text(page, 220, 700, dt, size=8.5, max_w=345)
        elif test_res == "service_again" or "service_again" in test_details:
            self._insert_tick(page, 156.0, 715.7)
            dt = data.get("service_again_detail") or test_details.get("service_again", "")
            if dt: self._insert_text(page, 235, 716, dt, size=8.5, max_w=330)
        elif test_res == "return_shop" or "return_shop" in test_details:
            self._insert_tick(page, 156.0, 732.2)
            dt = data.get("return_shop_detail") or test_details.get("return_shop", "")
            if dt: self._insert_text(page, 230, 732, dt, size=8.5, max_w=335)
        elif test_res == "other" or "other" in test_details or data.get("test_other_detail"):
            self._insert_tick(page, 156.0, 749.0)
            dt = data.get("test_other_detail") or test_details.get("other", "")
            if dt: self._insert_text(page, 195, 749, dt, size=8.5, max_w=210)

        # Test Ref document
        if data.get("test_ref_check") or data.get("test_ref"):
            self._insert_tick(page, 417.9, 765.6)
            if data.get("test_ref"):
                self._insert_text(page, 475, 768, data["test_ref"], size=8.5, max_w=95)

        # Signatures & Timing Table (Bottom y=780..810)
        # Serviced By Signature Box: (87, 781, 225, 795)
        if data.get("sign_tech"):
            self._insert_signature(page, (95, 781, 220, 795), data["sign_tech"])
        elif data.get("serviced_by"):
            self._insert_text(page, 95, 791, data["serviced_by"], size=9.0, bold=True, max_w=125)

        # Serviced Date: y ≈ 805
        s_date = self._format_date_dmy(data.get("serviced_date", data.get("date", "-")))
        self._insert_text(page, 95, 805, s_date, size=9.0, max_w=125)

        # Serviced Time (Start & Finished)
        # Start : line y ≈ 791
        if data.get("time_start"):
            self._insert_text(page, 310, 791, str(data["time_start"]), size=9.0, max_w=95)
        # Finished : line y ≈ 805
        if data.get("time_finished"):
            self._insert_text(page, 320, 805, str(data["time_finished"]), size=9.0, max_w=85)

        # Customer Sign Box: (478, 781, 574, 795)
        if data.get("sign_customer"):
            self._insert_signature(page, (482, 781, 570, 795), data["sign_customer"])
        elif data.get("customer_signer_name"):
            self._insert_text(page, 482, 791, data["customer_signer_name"], size=9.0, bold=True, max_w=90)

        # Customer Sign Date / Time: y ≈ 805
        c_date = self._format_date_dmy(data.get("customer_sign_date", data.get("date", "-")))
        self._insert_text(page, 482, 805, c_date, size=9.0, max_w=90)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        doc.close()
        return output_path

    # =========================================================================
    # FM-EPS-25: SPARE PARTS REPLACEMENT (MULTI-PAGE CAPABLE)
    # =========================================================================
    def fill_fm_eps_25(self, data: Dict[str, Any], output_path: str) -> str:
        template = self._get_template_path("FM-EPS-25")
        if not template:
            raise FileNotFoundError("FM-EPS-25 template not found")

        parts = data.get("parts", [])
        show_prices = data.get("show_prices", False)
        ROWS_PER_PAGE = 16

        # Calculate total pages needed (16 rows per page on standard FM-EPS-25)
        if len(parts) == 0:
            total_pages = 1
        else:
            total_pages = (len(parts) + ROWS_PER_PAGE - 1) // ROWS_PER_PAGE

        doc = pymupdf.open()
        template_doc = pymupdf.open(template)
        for _ in range(total_pages):
            doc.insert_pdf(template_doc, from_page=0, to_page=0)
        template_doc.close()

        # Header fields
        req_no = str(data.get("request_no", "")).strip()
        cust = str(data.get("parts_customer") or data.get("customer") or "-").strip() or "-"
        job_no = str(data.get("parts_job_no") or data.get("job_no") or "").strip()
        plant = str(data.get("parts_plant") or data.get("plant") or "-").strip() or "-"
        io_no = str(data.get("parts_io_no") or data.get("io_no") or "").strip()
        contact_no = str(data.get("parts_contact_no") or data.get("contact_no") or "-").strip() or "-"
        contact_person = str(data.get("parts_contact_person") or data.get("contact_person") or "-").strip() or "-"

        start_date_raw = str(
            data.get("parts_sheet_date") or data.get("parts_date") or data.get("sheet_date") or 
            data.get("start_date") or data.get("date") or data.get("serviced_date") or ""
        ).strip()
        start_date = self._format_date_dmy(start_date_raw) if start_date_raw and start_date_raw != "-" else ""

        p_brand = str(data.get("parts_brand_custom") or data.get("pump_brand") or data.get("brand") or "").strip()
        p_model = str(data.get("parts_sheet_model") or data.get("sheet_model") or data.get("pump_model") or data.get("parts_model_input") or "").strip()
        p_serial = str(data.get("parts_sheet_serial") or data.get("sheet_serial") or data.get("serial_no") or "").strip()

        for page_idx in range(total_pages):
            page = doc[page_idx]

            # 0. Page Number (Top Right: Page X/Y)
            page.draw_rect(pymupdf.Rect(513, 11, 555, 23), color=(1, 1, 1), fill=(1, 1, 1))
            self._insert_text(page, 515, 20, f"{page_idx + 1} / {total_pages}", size=8.5, bold=True)

            # 1. Header fields (aligned with underlines)
            if req_no and req_no != "-":
                self._insert_text(page, 465, 156, req_no, size=9.5, bold=True, max_w=95)
            # Customer, Plant, Tel, Contact Person (always printed, '-' if missing)
            self._insert_text(page, 68, 174, cust, size=9.0, max_w=340)
            if job_no and job_no != "-":
                self._insert_text(page, 463, 174, job_no, size=9.0, max_w=95)
            self._insert_text(page, 68, 192, plant, size=9.0, max_w=340)
            if io_no and io_no != "-":
                self._insert_text(page, 463, 192, io_no, size=9.0, max_w=95)
            self._insert_text(page, 78, 210, contact_no, size=9.0, max_w=140)
            self._insert_text(page, 290, 210, contact_person, size=9.0, max_w=118)
            if start_date:
                self._insert_text(page, 471, 210, start_date, size=9.0, max_w=90)

            if p_brand and p_brand != "-":
                self._insert_text(page, 90, 228, p_brand, size=9.0, max_w=130)
            if p_model and p_model != "-":
                self._insert_text(page, 272, 228, p_model, size=9.0, max_w=135)
            if p_serial and p_serial != "-":
                self._insert_text(page, 442, 228, p_serial, size=9.0, max_w=115)

            # 2. Slice parts for this page (16 per page)
            page_parts = parts[page_idx * ROWS_PER_PAGE : (page_idx + 1) * ROWS_PER_PAGE]
            for i, p in enumerate(page_parts):
                row_y = 269.9 + (i * 20.52) + 14.0

                # จำนวน (Qty)
                qty = str(p.get("qty", "1")).strip()
                self._insert_centered_text(page, 47.4, row_y, qty, size=8.5)

                # รายการที่เปลี่ยน/ซ่อม (Description)
                desc = p.get("description") or p.get("part_name") or p.get("part_no", "")
                self._insert_text(page, 70.0, row_y, str(desc), size=8.5, max_w=150)

                # สั่งทำ / STOCK / STORE (ปล่อยว่าง ไม่ระบุสต็อก)
                src = str(p.get("source", p.get("stock", ""))).strip().lower()
                if any(k in src for k in ["mto", "made_to_order", "สั่งทำ", "custom"]):
                    self._insert_tick(page, 240.4, row_y - 2.0, size=7.5)
                elif any(k in src for k in ["store", "คลัง"]):
                    self._insert_tick(page, 333.6, row_y - 2.0, size=7.5)
                elif any(k in src for k in ["stock", "สต็อก"]):
                    self._insert_tick(page, 283.0, row_y - 2.0, size=7.5)
                # Else: ปล่อยว่าง ไม่ใส่เครื่องหมายสต็อกตามที่แจ้ง

                # ราคา/ชิ้น (Unit Price)
                if show_prices and p.get("price") is not None and str(p.get("price")).strip() not in ["", "-", "0"]:
                    try:
                        price_val = float(str(p.get("price")).replace(",", ""))
                        price_str = f"{price_val:,.2f}" if price_val % 1 != 0 else f"{int(price_val):,}"
                    except ValueError:
                        price_str = str(p.get("price"))
                    self._insert_centered_text(page, 384.2, row_y, price_str, size=8.5)
                else:
                    self._insert_centered_text(page, 384.2, row_y, "-", size=8.5)

                # สั่งทำที่ (Supplier / Order From)
                supp = str(p.get("supplier") or p.get("order_from") or p.get("made_at") or "-").strip()
                if supp and supp != "-":
                    self._insert_centered_text(page, 434.8, row_y, supp, size=8.0)

                # ส่งวันที่
                sent_d = str(p.get("sent_date") or p.get("send_date") or "-").strip()
                if sent_d and sent_d != "-":
                    self._insert_centered_text(page, 485.4, row_y, self._format_date_dmy(sent_d), size=7.5)

                # เสร็จวันที่
                fin_d = str(p.get("finished_date") or p.get("finish_date") or "-").strip()
                if fin_d and fin_d != "-":
                    self._insert_centered_text(page, 536.0, row_y, self._format_date_dmy(fin_d), size=7.5)

            # 3. Bottom Fields
            self._insert_text(page, 68, 628, data.get("sale_name", "-"), size=8.5, max_w=180)
            rec_name = data.get("receiver_name") or data.get("serviced_by") or "-"
            self._insert_text(page, 305, 628, rec_name, size=8.5, max_w=100)
            rec_date = self._format_date_dmy(data.get("receive_date") or data.get("serviced_date") or data.get("date") or "-")
            self._insert_text(page, 471, 628, rec_date, size=8.5, max_w=90)

            self._insert_text(page, 100, 649, self._format_date_dmy(data.get("due_date", "-")), size=8.5, max_w=305)
            self._insert_text(page, 453, 649, self._format_date_dmy(data.get("delivery_date", "-")), size=8.5, max_w=105)

            # 4. รายงานการตรวจ / TEST PUMP (Notes / Summary wrapped into 4 lines)
            note_text = data.get("test_pump_note") or data.get("parts_note") or data.get("recommendation") or data.get("repairing") or ""
            disp_note = note_text
            if page_idx < total_pages - 1:
                disp_note = note_text if note_text else "(มีต่อหน้าถัดไป...)"
            if disp_note:
                note_lines = self._wrap_text(disp_note, width=85)
                line_ys = [683.0, 704.0, 724.0, 744.0]
                for idx, nline in enumerate(note_lines[:4]):
                    self._insert_text(page, 35.0, line_ys[idx], nline, size=8.5, max_w=520)

            # 5. Senior Technician / Service Engineer Signature & Date
            if data.get("sign_tech"):
                self._insert_signature(page, (252, 755, 358, 778), data["sign_tech"])

            tech_name = data.get("serviced_by") or data.get("tech_name") or "-"
            self._insert_text(page, 254, 779, str(tech_name), size=8.5, bold=True, max_w=102)

            date_str = str(data.get("serviced_date") or data.get("date") or "").strip()
            if date_str:
                d_day, d_mon, d_yr = self._parse_date_dmy_parts(date_str)
                if d_day and d_mon and d_yr:
                    self._insert_centered_text(page, 385.3, 779, d_day, size=8.5)
                    self._insert_centered_text(page, 415.5, 779, d_mon, size=8.5)
                    self._insert_centered_text(page, 445.2, 779, d_yr[-2:], size=8.5)
                else:
                    d_parts = date_str.replace("-", "/").split("/")
                    if len(d_parts) == 3:
                        self._insert_centered_text(page, 385.3, 779, d_parts[0], size=8.5)
                        self._insert_centered_text(page, 415.5, 779, d_parts[1], size=8.5)
                        self._insert_centered_text(page, 445.2, 779, d_parts[2][-2:], size=8.5)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        doc.close()
        return output_path

    # =========================================================================
    # FM-EPS-31: INSPECTION REPORT (REV.09 EXACT ALIGNMENT TO MASTER)
    # =========================================================================
    def fill_fm_eps_31(self, data: Dict[str, Any], output_path: str) -> str:
        template = self._get_template_path("FM-EPS-31")
        if not template:
            raise FileNotFoundError("FM-EPS-31 template not found")

        doc = pymupdf.open(template)
        page = doc[0]

        # 1. Header fields
        # Request No. at x ≈ 482, y ≈ 249
        self._insert_text(page, 482, 249, data.get("request_no", "-"), size=9.5, bold=True, max_w=66)

        # Pump Brand, Model, S/N, Date line at y ≈ 267
        self._insert_text(page, 118, 267, data.get("pump_brand", "-"), size=9.0, max_w=78)
        self._insert_text(page, 232, 267, data.get("pump_model", "-"), size=9.0, max_w=95)
        self._insert_text(page, 352, 267, data.get("serial_no", "-"), size=9.0, max_w=75)

        # Date: Format as ว/ด/ป aligned to template "Date : ........../.........../……………."
        raw_date = data.get("insp_sheet_date") or data.get("serviced_date") or data.get("date") or ""
        day, mon, yr = self._parse_date_dmy_parts(raw_date)
        if day and mon and yr:
            self._insert_centered_text(page, 463.5, 267.0, day, size=9.0)
            self._insert_centered_text(page, 486.8, 267.0, mon, size=9.0)
            self._insert_centered_text(page, 518.0, 267.0, yr, size=9.0)
        elif raw_date and raw_date != "-":
            self._insert_text(page, 455, 267, self._format_date_dmy(raw_date), size=9.0, max_w=88)

        # 2. Measurement Table Rows (The 11 Master Parts / 22 Sub-rows)
        # 19 standard positions mapping:
        # idx: (is_std_anchor, std_y, row_y)
        row_mappings = [
            (True, 334.0, 326.5),   # 0: ROTOR OD - UPPER
            (False, None, 341.4),   # 1: ROTOR OD - LOWER
            (True, 363.8, 356.3),   # 2: ROTOR ID - UPPER
            (False, None, 371.1),   # 3: ROTOR ID - LOWER
            (True, 394.0, 386.5),   # 4: ROTOR TOOTH LENGTH - FIRST SLOT (was 394.0)
            (True, 423.3, 415.8),   # 5: IDLER OD - UPPER
            (False, None, 430.7),   # 6: IDLER OD - LOWER
            (True, 453.0, 445.6),   # 7: IDLER BUSHING ID - UPPER
            (False, None, 460.4),   # 8: IDLER BUSHING ID - LOWER
            (True, 483.5, 476.0),   # 9: IDLER TOOTH LENGTH - FIRST SLOT (was 483.5)
            (True, 512.4, 505.0),   # 10: IDLER PIN OD - UPPER
            (False, None, 519.8),   # 11: IDLER PIN OD - LOWER
            (True, 542.1, 534.7),   # 12: SHAFT OD - UPPER
            (False, None, 549.6),   # 13: SHAFT OD - LOWER
            (True, 572.0, 564.5),   # 14: SHAFT BUSHING ID - UPPER
            (False, None, 579.4),   # 15: SHAFT BUSHING ID - LOWER
            (True, 602.5, 595.0),   # 16: CRESCENT LENGTH - FIRST SLOT (was 602.5)
            (True, 631.5, 624.0),   # 17: CASING ID - UPPER
            (False, None, 638.9),   # 18: CASING ID - LOWER
        ]

        measurements = data.get("measurements", [])
        for idx, (is_std_anchor, std_y, row_y) in enumerate(row_mappings):
            if idx >= len(measurements):
                break
            m = measurements[idx]
            if not m:
                continue

            # Standard Dimensions (Centered in Col 1: cx = 175.26)
            if is_std_anchor and std_y is not None:
                std_mm = str(m.get("std_mm", "")).strip()
                std_min = str(m.get("std_min", "")).strip()
                std_max = str(m.get("std_max", "")).strip()
                std_text = ""
                if std_mm and std_mm != "-":
                    std_text = std_mm
                elif std_min and std_max:
                    if std_min == std_max:
                        std_text = std_min
                    else:
                        std_text = f"{std_min} - {std_max}"
                elif std_min:
                    std_text = std_min
                elif std_max:
                    std_text = std_max
                elif m.get("standard"):
                    std_text = str(m["standard"]).strip()

                if std_text and std_text != "-":
                    self._insert_centered_text(page, 175.26, std_y, std_text, size=7.5)

            # Measurement Values
            in_a = str(m.get("in_a", "-")).strip()
            in_b = str(m.get("in_b", "-")).strip()
            fi_a = str(m.get("final_a", m.get("fi_a", "-"))).strip()
            fi_b = str(m.get("final_b", m.get("fi_b", "-"))).strip()

            self._insert_centered_text(page, 309.78, row_y, in_a, size=8.0)
            self._insert_centered_text(page, 358.44, row_y, in_b, size=8.0)
            self._insert_centered_text(page, 407.10, row_y, fi_a, size=8.0)
            self._insert_centered_text(page, 455.70, row_y, fi_b, size=8.0)

            # Remark (Col 7: cx = 515.34) - Only print what the user explicitly entered
            rem = str(m.get("remark", "")).strip()
            if rem and rem != "-":
                color = (0, 0.5, 0) if rem == "PASS" else ((0.8, 0, 0) if rem == "FAIL" else (0, 0, 0))
                self._insert_centered_text(page, 515.34, row_y, rem, size=7.5, bold=(rem in ["PASS", "FAIL"]), color=color)

        # 3. Note : Measuring with ...
        measuring_with = data.get("measuring_with", data.get("note_measuring_with", "Vernier Caliper"))
        if not measuring_with or "Bore Gauge" in str(measuring_with) or ("Micrometer" in str(measuring_with) and "Vernier" in str(measuring_with)):
            measuring_with = "Vernier Caliper"
        if measuring_with:
            self._insert_text(page, 370.0, 668.0, str(measuring_with), size=8.0, max_w=150)

        # 4. Signatures & Names
        # Incoming Check By (Technician)
        sig_in = data.get("sign_tech_incoming") or data.get("sign_tech")
        if sig_in:
            self._insert_signature(page, (160, 678, 274, 696), sig_in)
        in_tech = data.get("tech_incoming_name") or data.get("incoming_check_by") or data.get("serviced_by")
        if in_tech and in_tech != "-":
            self._insert_text(page, 165.0, 696.0, str(in_tech), size=8.5, bold=True, max_w=108)

        # Final Check By (Technician) - ONLY if explicitly signed/named for Final
        sig_fi = data.get("sign_tech_final")
        if sig_fi:
            self._insert_signature(page, (400, 678, 530, 696), sig_fi)
        fi_tech = data.get("tech_final_name") or data.get("final_check_by")
        if fi_tech and fi_tech != "-":
            self._insert_text(page, 405.0, 696.0, str(fi_tech), size=8.5, bold=True, max_w=120)

        # Approve By (Left / Incoming)
        if data.get("sign_approve_incoming"):
            self._insert_signature(page, (130, 734, 265, 752), data["sign_approve_incoming"])
        appr_in = data.get("approve_incoming_name") or data.get("approve_by_incoming")
        if appr_in and appr_in != "-":
            self._insert_text(page, 135.0, 752.0, str(appr_in), size=8.5, bold=True, max_w=125)

        # Approve By (Right / Final) - ONLY if explicitly signed/named for Final
        if data.get("sign_approve_final"):
            self._insert_signature(page, (395, 734, 533, 752), data["sign_approve_final"])
        appr_fi = data.get("approve_final_name") or data.get("approve_by_final")
        if appr_fi and appr_fi != "-":
            self._insert_text(page, 400.0, 752.0, str(appr_fi), size=8.5, bold=True, max_w=128)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        doc.close()
        return output_path

    # =========================================================================
    # FM-EPS-45: CUSTOMER SATISFACTION (Supports Rev.00 & Rev.01)
    # =========================================================================
    def fill_fm_eps_45(self, data: Dict[str, Any], output_path: str) -> str:
        template = self._get_template_path("FM-EPS-45")
        if not template:
            raise FileNotFoundError("FM-EPS-45 template not found")

        doc = pymupdf.open(template)
        page = doc[0]

        # Remove interactive form widgets if any so vector THSarabunNew font and checkmarks render crisply
        for w in list(page.widgets()):
            page.delete_widget(w)

        is_rev00 = page.rect.height < 820.0 or "Rev00" in template or "Rev.00" in template

        # 1. Top Header: Request No. & Date
        req_no = str(data.get("request_no") or data.get("ticket_no") or "").strip()
        raw_date = data.get("sat_eval_date") or data.get("eval_date") or data.get("serviced_date") or data.get("date") or ""
        date_str = self._format_date_dmy(raw_date)

        if is_rev00:
            # Header Request No.
            if req_no and req_no != "-":
                self._insert_text(page, 455.0, 42.0, f"Request No. : {req_no}", size=9.0, bold=True)

            # Header Date: วันที่ประเมิน ........................เดือน..............................ปี พ.ศ. ...............
            day, mon, yr = self._parse_date_dmy_parts(raw_date)
            if day and mon and yr:
                try:
                    yr_int = int(yr)
                    yr_be = yr_int + 543 if yr_int < 2500 else yr_int
                    thai_months = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                                   "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
                    mon_int = int(mon)
                    mon_name = thai_months[mon_int] if 1 <= mon_int <= 12 else mon
                    day_str = str(int(day))
                    self._insert_centered_text(page, 260.0, 103.0, day_str, size=9.5)
                    self._insert_centered_text(page, 345.0, 103.0, mon_name, size=9.5)
                    self._insert_centered_text(page, 427.0, 103.0, str(yr_be), size=9.5)
                except Exception:
                    self._insert_centered_text(page, 345.0, 103.0, date_str, size=9.5)
            elif date_str and date_str != "-":
                self._insert_centered_text(page, 345.0, 103.0, date_str, size=9.5)

            # 2. 14 Question Ratings: Coordinates for Rev.00
            x_scores = {4: 351.8, 3: 402.3, 2: 452.8, 1: 503.3, 0: 553.8}
            y_centers = [
                230.6, 267.8, 305.1, 333.0,  # 1. ด้านเทคนิค (1.1 - 1.4)
                361.0, 388.9, 407.5, 435.5, 463.4,  # 2. ด้านคุณภาพ/เวลา/ความสะอาด/จำนวนผู้ปฏิบัติงาน (2.1 - 2.5)
                491.4, 528.6, 556.5,  # 3. ด้านบุคคลิกภาพส่วนตัวของพนักงาน (3.1 - 3.3)
                584.5, 612.4   # 4. เครื่องมือ/อุปกรณ์ (4.1 - 4.2)
            ]
        else:
            # Rev.01 fallback
            if req_no and req_no != "-":
                self._insert_text(page, 440, 75, f"Request No. : {req_no}", size=9.0, bold=True)
            if date_str and date_str != "-":
                self._insert_text(page, 440, 88, f"Date : {date_str}", size=9.0)

            x_scores = {4: 377.6, 3: 423.6, 2: 467.6, 1: 513.6, 0: 559.6}
            y_centers = [
                250.7, 269.7, 307.7, 327.7,
                366.7, 385.7, 405.7, 423.7, 462.7,
                501.7, 521.7, 558.7,
                597.7, 616.7
            ]

        question_keys = [
            "tech_1", "tech_2", "tech_3", "tech_4",
            "qual_1", "qual_2", "qual_3", "qual_4", "qual_5",
            "pers_1", "pers_2", "pers_3",
            "tool_1", "tool_2"
        ]

        ratings = data.get("ratings", {})
        total_score = 0

        for q_idx, q_key in enumerate(question_keys):
            score = ratings.get(q_key)
            if score is None:
                score = ratings.get(str(q_idx + 1), ratings.get(q_idx, 4))
            try:
                score = int(score)
            except (ValueError, TypeError):
                score = 4

            score = max(0, min(4, score))
            total_score += score

            # Draw vector checkmark
            x = x_scores.get(score, 351.8 if is_rev00 else 377.6)
            y = y_centers[q_idx]
            self._insert_tick(page, x, y)

        # 3. Total Score
        percent = round((total_score / 56.0) * 100) if total_score > 0 else 0
        score_text = f"{total_score} / 56  ({percent}%)"
        if is_rev00:
            self._insert_centered_text(page, 452.8, 634.5, score_text, size=10.5, bold=True)
        else:
            self._insert_centered_text(page, 468.6, 638.5, score_text, size=10.5, bold=True)

        # 4. Suggestions (up to 3 lines)
        raw_sugg = str(data.get("suggestions") or "").strip()
        if raw_sugg:
            lines = textwrap.wrap(raw_sugg, width=95)
            sugg_ys = [680.0, 702.5, 725.0] if is_rev00 else [663.0, 684.0, 705.0]
            sugg_x = 48.0 if is_rev00 else 95.0
            for i, line in enumerate(lines[:3]):
                self._insert_text(page, sugg_x, sugg_ys[i], line, size=9.0)

        # 5. Bottom Metadata
        cust = str(data.get("sat_customer") or data.get("customer") or "-").strip() or "-"
        signer = str(data.get("sat_contact_person") or data.get("customer_signer_name") or data.get("contact_person") or "-").strip() or "-"
        tel = str(data.get("sat_contact_no") or data.get("contact_no") or "-").strip() or "-"

        if is_rev00:
            # ชื่อลูกค้า : ………………………….………     ,   บริษัท :  …………....................................................…   , เบอร์โทร : ……………………………
            self._insert_text(page, 92.0, 759.0, signer, size=9.0, max_w=115.0)
            self._insert_text(page, 255.0, 759.0, cust, size=9.0, max_w=170.0)
            self._insert_text(page, 480.0, 759.0, tel, size=9.0, max_w=90.0)
            if data.get("sign_customer"):
                self._insert_signature(page, (60, 705, 190, 745), data["sign_customer"])
        else:
            self._insert_text(page, 58.0, 765.0, cust, size=9.0, max_w=175.0)
            self._insert_text(page, 282.0, 765.0, signer, size=9.0, max_w=130.0)
            self._insert_text(page, 480.0, 765.0, tel, size=9.0, max_w=95.0)
            if date_str and date_str != "-":
                self._insert_text(page, 120.0, 794.0, date_str, size=9.0, max_w=115.0)
            if data.get("sign_customer"):
                self._insert_signature(page, (280, 715, 405, 752), data["sign_customer"])

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        doc.close()
        return output_path

    # =========================================================================
    # PHOTO REPORT (A4 Slide Grid)
    # =========================================================================
    def generate_photo_report(self, data: Dict[str, Any], photos: List[Dict[str, Any]], output_path: str) -> str:
        """
        Generates authentic Siamraj Photo Report matching the company template:
          - Multiple Cover Sheets supported (1 Cover Sheet per pump in the job)
          - Photo Pages (4 photos/page arranged 2x2 with Figure & Description)
          - Recommended section and Signatures on EVERY photo page
          - Job No. and Reported By are user-specified (no hardcoded defaults)
        """
        doc = pymupdf.open()

        # Build list of covers (pumps)
        covers_list = data.get("covers")
        if not covers_list or not isinstance(covers_list, list) or len(covers_list) == 0:
            covers_list = [{
                "id": "cover_1",
                "name": "ปั๊มตัวที่ 1",
                "customer": data.get("customer") or data.get("customer_name") or "-",
                "plant": data.get("plant") or data.get("site") or "-",
                "job": data.get("job_no") or data.get("job") or "",
                "date": data.get("date") or data.get("date_dmy") or data.get("issue_date") or "-",
                "pump_brand": data.get("pump_brand") or data.get("product_code") or data.get("pump") or "-",
                "model": data.get("model") or data.get("pump_model") or "-",
                "serial_no": data.get("serial_no") or data.get("serial") or "-",
                "reported_by": data.get("reported_by") or "",
                "recommended": data.get("recommended") or data.get("photo_recommended") or "",
                "photos": photos
            }]

        ticket = data.get("ticket_no") or data.get("request_no") or "-"

        for c_idx, c_info in enumerate(covers_list):
            cust = c_info.get("customer") or data.get("customer") or "-"
            plant = c_info.get("plant") or data.get("plant") or "-"
            pump = c_info.get("pump_brand") or "-"
            model = c_info.get("model") or "-"
            sn = c_info.get("serial_no") or "-"
            job = c_info.get("job") or c_info.get("job_no") or ""
            reported_by = c_info.get("reported_by") or ""
            date_str = self._format_date_dmy(c_info.get("date") or c_info.get("date_dmy") or data.get("date") or "-")
            rec_text = c_info.get("recommended") or ""
            cover_photos = c_info.get("photos")
            if cover_photos is None:
                # If cover_photos is not explicitly set, use global photos for cover 0
                cover_photos = photos if c_idx == 0 else []

            # -------------------------------------------------------------
            # COVER SHEET (Sheet1 style) FOR THIS PUMP
            # -------------------------------------------------------------
            cover_page = doc.new_page(width=595.3, height=841.9)
            if self.has_th_font:
                cover_page.insert_font(fontname="th", fontfile=FONT_TH)
                cover_page.insert_font(fontname="thb", fontfile=FONT_TH_B)

            # Outer border
            cover_page.draw_rect(pymupdf.Rect(30, 30, 565, 812), color=(0, 0, 0), width=1.5)

            cover_items = [
                ("CUSTOMER", cust),
                ("SITE", plant),
                ("PUMP", pump),
                ("MODEL", model),
                ("S/N", sn),
                ("JOB", job if job else "-"),
            ]
            y_start = 280
            line_spacing = 42
            for i, (label, val) in enumerate(cover_items):
                y = y_start + (i * line_spacing)
                self._insert_text(cover_page, 110, y, label, size=18, bold=True)
                self._insert_text(cover_page, 205, y, ":", size=18, bold=True)
                self._insert_text(cover_page, 225, y, str(val), size=18, bold=True, max_w=310)

            # -------------------------------------------------------------
            # PHOTO REPORT PAGES (Sheet '1', '2'...) FOR THIS PUMP
            # -------------------------------------------------------------
            photos_per_page = 4
            num_chunks = max(1, (len(cover_photos) + photos_per_page - 1) // photos_per_page)

            for p_idx in range(num_chunks):
                page_photos = cover_photos[p_idx * photos_per_page:(p_idx + 1) * photos_per_page]

                page = doc.new_page(width=595.3, height=841.9)
                if self.has_th_font:
                    page.insert_font(fontname="th", fontfile=FONT_TH)
                    page.insert_font(fontname="thb", fontfile=FONT_TH_B)

                # Outer border
                page.draw_rect(pymupdf.Rect(30, 30, 565, 812), color=(0, 0, 0), width=1.5)

                # Header: SERVICE REPORT box
                title_rect = pymupdf.Rect(150, 42, 445, 78)
                page.draw_rect(title_rect, color=(0, 0, 0), width=0.8)
                self._insert_text(page, 210, 68, "SERVICE REPORT", size=24, bold=True)

                # Request No on top right
                self._insert_text(page, 425, 92, f"Request :  {ticket}", size=12, bold=True)
                page.draw_line(pymupdf.Point(475, 95), pymupdf.Point(555, 95), color=(0, 0, 0), width=0.5)

                # Divider Line 1
                page.draw_line(pymupdf.Point(30, 102), pymupdf.Point(565, 102), color=(0, 0, 0), width=0.8)

                # Metadata Row 1
                self._insert_text(page, 38, 118, f"Customer :  {cust}", size=11, bold=True, max_w=200)
                self._insert_text(page, 250, 118, f"Job :  {job if job else '-'}", size=11, bold=True, max_w=160)
                self._insert_text(page, 425, 118, f"Date :  {date_str}", size=11, bold=True, max_w=130)

                # Metadata Row 2
                self._insert_text(page, 38, 134, f"Pump brand :  {pump}", size=11, bold=True, max_w=200)
                self._insert_text(page, 250, 134, f"Model :  {model}", size=11, bold=True, max_w=160)
                self._insert_text(page, 425, 134, f"Serial no :  {sn}", size=11, bold=True, max_w=130)

                # Divider Line 2
                page.draw_line(pymupdf.Point(30, 142), pymupdf.Point(565, 142), color=(0, 0, 0), width=0.8)

                # 4 Photo Slots: 2 cols x 2 rows
                slots = [
                    {"img_rect": pymupdf.Rect(38, 150, 290, 330), "fig_y": 344, "desc_y": 360, "x": 38, "w": 252},
                    {"img_rect": pymupdf.Rect(305, 150, 557, 330), "fig_y": 344, "desc_y": 360, "x": 305, "w": 252},
                    {"img_rect": pymupdf.Rect(38, 376, 290, 556), "fig_y": 570, "desc_y": 586, "x": 38, "w": 252},
                    {"img_rect": pymupdf.Rect(305, 376, 557, 556), "fig_y": 570, "desc_y": 586, "x": 305, "w": 252},
                ]

                for i in range(4):
                    slot = slots[i]
                    page.draw_rect(slot["img_rect"], color=(0.5, 0.5, 0.5), width=0.6)
                    fig_num = p_idx * photos_per_page + i + 1
                    p_info = page_photos[i] if i < len(page_photos) else None

                    if p_info:
                        img_path = p_info.get("file_path") or p_info.get("path")
                        b64 = p_info.get("base64")
                        if img_path and os.path.exists(img_path):
                            try:
                                inner = pymupdf.Rect(slot["img_rect"].x0 + 1, slot["img_rect"].y0 + 1, slot["img_rect"].x1 - 1, slot["img_rect"].y1 - 1)
                                page.insert_image(inner, filename=img_path, keep_proportion=True)
                            except Exception as e:
                                print(f"[PhotoReport] Error inserting image: {e}")
                        elif b64:
                            self._insert_signature(page, (slot["img_rect"].x0, slot["img_rect"].y0, slot["img_rect"].x1, slot["img_rect"].y1), b64)

                        caption = p_info.get("caption", "")
                        fig_label = p_info.get("figure") or str(fig_num)
                    else:
                        fig_label = str(fig_num)
                        caption = ""

                    self._insert_text(page, slot["x"] + 10, slot["fig_y"], f"Figure :  {fig_label}", size=11, bold=True)
                    self._insert_text(page, slot["x"], slot["desc_y"], f"Description :  {caption}", size=11, bold=False, max_w=slot["w"])
                    page.draw_line(pymupdf.Point(slot["x"] + 65, slot["desc_y"] + 2), pymupdf.Point(slot["x"] + slot["w"], slot["desc_y"] + 2), color=(0.7, 0.7, 0.7), width=0.5)

                # Recommended Section (ON EVERY PHOTO PAGE)
                self._insert_text(page, 38, 610, "Recommended", size=12, bold=True)
                rec_lines = [628, 648, 668, 688]
                for r_y in rec_lines:
                    page.draw_line(pymupdf.Point(38, r_y), pymupdf.Point(557, r_y), color=(0.7, 0.7, 0.7), width=0.5)
                if rec_text:
                    wrapped_rec = textwrap.wrap(rec_text, width=80)
                    for r_i, line_t in enumerate(wrapped_rec[:4]):
                        self._insert_text(page, 38, rec_lines[r_i] - 3, line_t, size=11, bold=False)

                # Footer Divider Line
                page.draw_line(pymupdf.Point(30, 715), pymupdf.Point(565, 715), color=(0, 0, 0), width=0.8)

                # Signatures (ON EVERY PHOTO PAGE)
                # Customer sign
                cust_sig = data.get("customer_signature")
                if cust_sig:
                    self._insert_signature(page, (45, 725, 175, 770), cust_sig)
                page.draw_line(pymupdf.Point(38, 775), pymupdf.Point(180, 775), color=(0.5, 0.5, 0.5), width=0.5)
                self._insert_text(page, 38, 792, "Customer sign ;", size=11, bold=False)

                # Sales
                sales_sig = data.get("sales_signature")
                if sales_sig:
                    self._insert_signature(page, (215, 725, 345, 770), sales_sig)
                page.draw_line(pymupdf.Point(210, 775), pymupdf.Point(350, 775), color=(0.5, 0.5, 0.5), width=0.5)
                self._insert_text(page, 210, 792, "Sales ;", size=11, bold=False)

                # Reported By
                tech_sig = data.get("technician_signature")
                if tech_sig:
                    self._insert_signature(page, (385, 725, 515, 770), tech_sig)
                page.draw_line(pymupdf.Point(380, 775), pymupdf.Point(555, 775), color=(0.5, 0.5, 0.5), width=0.5)
                rep_text = f"Reported By : {reported_by}" if reported_by else "Reported By :"
                self._insert_text(page, 380, 792, rep_text, size=11, bold=False)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        doc.close()
        return output_path

    def generate_photo_report_excel(self, data: Dict[str, Any], photos: List[Dict[str, Any]], output_path: str) -> str:
        """
        Exports authentic Siamraj Photo Report matching the company Excel template (.xlsx):
          - Cover Page (Sheet1 style) for each pump
          - Photo Grid Pages (4 photos/page with images embedded)
          - Recommended notes on EVERY photo page
          - Job No. and Reported By user-specified
        """
        import openpyxl
        from openpyxl.drawing.image import Image as OpenpyxlImage

        master_template = os.path.join(TEMPLATES_DIR, "FORM_PHOTO_REPORT_master.xlsx")
        if not os.path.exists(master_template):
            master_template = os.path.join(FROM_FM_DIR, "FORM_PHOTO_REPORT_master.xlsx")

        wb = openpyxl.load_workbook(master_template)

        # Build list of covers (pumps)
        covers_list = data.get("covers")
        if not covers_list or not isinstance(covers_list, list) or len(covers_list) == 0:
            covers_list = [{
                "id": "cover_1",
                "name": "ปั๊มตัวที่ 1",
                "customer": data.get("customer") or data.get("customer_name") or "-",
                "plant": data.get("plant") or data.get("site") or "-",
                "job": data.get("job_no") or data.get("job") or "",
                "date": data.get("date") or data.get("date_dmy") or data.get("issue_date") or "-",
                "pump_brand": data.get("pump_brand") or data.get("product_code") or data.get("pump") or "-",
                "model": data.get("model") or data.get("pump_model") or "-",
                "serial_no": data.get("serial_no") or data.get("serial") or "-",
                "reported_by": data.get("reported_by") or "",
                "recommended": data.get("recommended") or data.get("photo_recommended") or "",
                "photos": photos
            }]

        ticket = data.get("ticket_no") or data.get("request_no") or "-"
        master_cover_ws = wb["Sheet1"] if "Sheet1" in wb.sheetnames else wb.active
        master_photo_ws = wb["1"] if "1" in wb.sheetnames else wb.worksheets[-1]

        # Keep track of created sheets
        first_cover_used = False
        first_photo_used = False

        for c_idx, c_info in enumerate(covers_list):
            cust = c_info.get("customer") or data.get("customer") or "-"
            plant = c_info.get("plant") or data.get("plant") or "-"
            pump = c_info.get("pump_brand") or "-"
            model = c_info.get("model") or "-"
            sn = c_info.get("serial_no") or "-"
            job = c_info.get("job") or c_info.get("job_no") or ""
            reported_by = c_info.get("reported_by") or ""
            date_str = self._format_date_dmy(c_info.get("date") or c_info.get("date_dmy") or data.get("date") or "-")
            rec_text = c_info.get("recommended") or ""
            cover_photos = c_info.get("photos")
            if cover_photos is None:
                cover_photos = photos if c_idx == 0 else []

            # 1. Cover Sheet for this pump
            if not first_cover_used and "Sheet1" in wb.sheetnames:
                ws_c = master_cover_ws
                if len(covers_list) > 1:
                    ws_c.title = f"Cover {c_idx + 1}"
                first_cover_used = True
            else:
                ws_c = wb.copy_worksheet(master_cover_ws)
                ws_c.title = f"Cover {c_idx + 1}"

            ws_c["B17"] = f"CUSTOMER : {cust}"
            ws_c["B20"] = f"SITE               : {plant}"
            ws_c["B23"] = f"PUMP            : {pump}"
            ws_c["B26"] = f"MODEL        : {model}"
            ws_c["B29"] = f"S/N                 : {sn}"
            ws_c["B32"] = f"JOB               : {job if job else ''}"

            # 2. Photo Sheets for this pump
            photos_per_page = 4
            num_chunks = max(1, (len(cover_photos) + photos_per_page - 1) // photos_per_page)

            for p_idx in range(num_chunks):
                prefix = f"P{c_idx + 1}_" if len(covers_list) > 1 else ""
                sheet_title = f"{prefix}{p_idx + 1}"

                if not first_photo_used and "1" in wb.sheetnames:
                    ws = master_photo_ws
                    ws.title = sheet_title
                    first_photo_used = True
                else:
                    ws = wb.copy_worksheet(master_photo_ws)
                    ws.title = sheet_title

                page_photos = cover_photos[p_idx * photos_per_page:(p_idx + 1) * photos_per_page]

                # Header
                ws["H4"] = f"Request :  {ticket}"
                ws["A7"] = f"Customer :  {cust}"
                ws["E7"] = f"Job : {job if job else ''}"
                ws["H7"] = f"Date : {date_str}"
                ws["A8"] = f"Pump brand : {pump}"
                ws["E8"] = f"Model : {model}"
                ws["H8"] = f"Serial no : {sn}"

                slot_cells = [
                    {"cell": "A10", "fig_cell": "B23", "desc_cell": "B24"},
                    {"cell": "F10", "fig_cell": "G23", "desc_cell": "G24"},
                    {"cell": "A25", "fig_cell": "B38", "desc_cell": "B39"},
                    {"cell": "F25", "fig_cell": "G38", "desc_cell": "G39"},
                ]

                for i in range(4):
                    sc = slot_cells[i]
                    fig_num = p_idx * photos_per_page + i + 1
                    p_info = page_photos[i] if i < len(page_photos) else None

                    if p_info:
                        fig_label = p_info.get("figure") or str(fig_num)
                        caption = p_info.get("caption", "")
                        img_path = p_info.get("file_path") or p_info.get("path")
                        if img_path and os.path.exists(img_path):
                            try:
                                xl_img = OpenpyxlImage(img_path)
                                xl_img.width = 240
                                xl_img.height = 170
                                ws.add_image(xl_img, sc["cell"])
                            except Exception as e:
                                print(f"[PhotoExcel] Error adding image {img_path}: {e}")
                    else:
                        fig_label = str(fig_num)
                        caption = ""

                    ws[sc["fig_cell"]] = f"Figure : {fig_label}"
                    ws[sc["desc_cell"]] = caption

                # Recommended (ON EVERY PHOTO PAGE)
                if rec_text:
                    wrapped_rec = textwrap.wrap(rec_text, width=80)
                    rec_rows = [41, 42, 43, 44]
                    for r_i, r_text in enumerate(wrapped_rec[:4]):
                        ws.cell(row=rec_rows[r_i], column=1, value=r_text)
                else:
                    ws["A41"] = ""
                    ws["A42"] = ""
                    ws["A43"] = ""
                    ws["A44"] = ""

                # Reported By
                ws["I45"] = reported_by if reported_by else ""

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        wb.save(output_path)
        return output_path


    # =========================================================================
    # FM-EPS-21: SERVICE EXPENSE FORM (Rev.07, 02/03/69)
    # =========================================================================
    def fill_fm_eps_21(self, data: Dict[str, Any], output_path: str) -> str:
        template = self._get_template_path("FM-EPS-21")
        if not template:
            raise FileNotFoundError("FM-EPS-21 template not found")

        doc = pymupdf.open(template)
        page = doc[0]

        # Header: Request No. & Date
        req_no = str(data.get("exp_request_no") or data.get("ticket_no") or data.get("request_no") or "").strip()
        raw_date = data.get("exp_date") or data.get("serviced_date") or data.get("date") or ""
        date_str = self._format_date_dmy(raw_date)

        if req_no:
            self._insert_text(page, 480, 126, req_no, size=10, bold=True)
        if date_str:
            self._insert_text(page, 495, 142, date_str, size=9.5)

        # Box 1: Customer & Job Info
        cust = str(data.get("exp_customer") or data.get("customer") or "").strip()
        sales_person = str(data.get("exp_sales") or data.get("sales_person") or data.get("sales") or "").strip()
        sales_group = str(data.get("exp_group") or data.get("sales_group") or data.get("group") or "").strip()
        prod_model = str(data.get("exp_product") or data.get("pump_model") or data.get("model") or "").strip()
        io_so = str(data.get("exp_io") or data.get("io_no") or data.get("sales_orders") or data.get("so") or "").strip()
        site_place = str(data.get("exp_place") or data.get("plant") or data.get("site") or "").strip()
        contact = str(data.get("exp_contact") or data.get("contact_person") or "").strip()
        tel = str(data.get("exp_tel") or data.get("contact_no") or "").strip()
        if tel:
            contact = f"{contact} ({tel})" if contact else tel

        if cust:
            self._insert_text(page, 115, 163, cust, size=9.5, bold=True)
        if sales_person:
            self._insert_text(page, 310, 163, sales_person, size=9.5)
        if sales_group:
            self._insert_text(page, 515, 163, sales_group, size=9.5)

        if prod_model:
            self._insert_text(page, 115, 177, prod_model, size=9.5)
        if io_so:
            self._insert_text(page, 310, 177, io_so, size=9.5)

        if site_place:
            self._insert_text(page, 115, 191, site_place, size=9.5)
        if contact:
            self._insert_text(page, 350, 191, contact, size=9.5)

        # Box 2: Job Checkboxes
        job_map = [
            ("exp_job_install", 233),
            ("exp_job_startup", 245),
            ("exp_job_repair", 257),
            ("exp_job_alignment", 269),
            ("exp_job_other1", 281),
            ("exp_job_other2", 293),
            ("exp_job_other3", 305)
        ]
        for key, y_pos in job_map:
            val = data.get(key)
            if val in [True, "true", "True", "1", 1, "yes", "Yes"]:
                self._insert_tick(page, 86.5, y_pos, size=8.5, color=(0, 0, 0))

        for key_txt, y_pos in [("exp_job_other1_text", 281), ("exp_job_other2_text", 293), ("exp_job_other3_text", 305)]:
            txt_val = str(data.get(key_txt) or "").strip()
            if txt_val:
                self._insert_text(page, 130, y_pos, txt_val, size=9)

        # Box 2: Expenses
        exp_items = [
            ("exp_cost_labor", "exp_amt_labor", 233),
            ("exp_cost_toll", "exp_amt_toll", 245),
            ("exp_cost_gas", "exp_amt_gas", 257),
            ("exp_cost_equip", "exp_amt_equip", 269),
            ("exp_cost_allowance", "exp_amt_allowance", 281),
            ("exp_cost_hotel", "exp_amt_hotel", 293),
            ("exp_cost_other", "exp_amt_other", 305)
        ]
        for chk_key, amt_key, y_pos in exp_items:
            c_val = data.get(chk_key)
            a_val = str(data.get(amt_key) or "").strip()
            if c_val in [True, "true", "True", "1", 1, "yes", "Yes"] or a_val:
                self._insert_tick(page, 313.5, y_pos, size=8.5, color=(0, 0, 0))
            if a_val:
                self._insert_text(page, 430, y_pos, a_val, size=9)

        # Gas distance note if provided
        gas_dist = str(data.get("exp_gas_distance") or "").strip()
        if gas_dist:
            self._insert_text(page, 375, 257, gas_dist, size=8.5)

        # Box 3: Work Summary & Time
        summary_times = [
            ("exp_work_start", 180, 344), ("exp_work_end", 315, 344), ("exp_work_total", 480, 344),
            ("exp_travel_to_start", 180, 358), ("exp_travel_to_end", 315, 358), ("exp_travel_to_total", 480, 358),
            ("exp_travel_back_start", 180, 372), ("exp_travel_back_end", 315, 372), ("exp_travel_back_total", 480, 372)
        ]
        for k, x_pos, y_pos in summary_times:
            v = str(data.get(k) or "").strip()
            if v:
                self._insert_text(page, x_pos, y_pos, v, size=9)

        if data.get("exp_distance"):
            self._insert_text(page, 125, 393, str(data.get("exp_distance")), size=9.5)
        if data.get("exp_crew_tech"):
            self._insert_text(page, 345, 393, str(data.get("exp_crew_tech")), size=9.5)
        if data.get("exp_crew_sr_tech"):
            self._insert_text(page, 485, 393, str(data.get("exp_crew_sr_tech")), size=9.5)
        if data.get("exp_crew_eng"):
            self._insert_text(page, 410, 407, str(data.get("exp_crew_eng")), size=9.5)

        # Box 4: Charge to
        charge_items = [
            ("exp_charge_sales", "exp_charge_sales_amt", 451),
            ("exp_charge_service", "exp_charge_service_amt", 463),
            ("exp_charge_company", "exp_charge_company_amt", 475)
        ]
        for chk_key, amt_key, y_pos in charge_items:
            c_val = data.get(chk_key)
            a_val = str(data.get(amt_key) or "").strip()
            if c_val in [True, "true", "True", "1", 1, "yes", "Yes"] or a_val:
                self._insert_tick(page, 86.5, y_pos, size=8.5, color=(0, 0, 0))
            if a_val:
                self._insert_text(page, 370, y_pos, a_val, size=9)

        # Box 5: Result & Fund from
        result_items = [
            ("exp_res_completed", 523),
            ("exp_res_in_progress", 536),
            ("exp_res_pending_approval", 548),
            ("exp_res_pending_parts", 560),
            ("exp_res_no_repair", 573)
        ]
        for key, y_pos in result_items:
            if data.get(key) in [True, "true", "True", "1", 1, "yes", "Yes"]:
                self._insert_tick(page, 86.5, y_pos, size=8.5, color=(0, 0, 0))

        fund_items = [
            ("exp_fund_io_job", 523),
            ("exp_fund_io_orderer", 536),
            ("exp_fund_budget", 548),
            ("exp_fund_other", 560)
        ]
        for key, y_pos in fund_items:
            if data.get(key) in [True, "true", "True", "1", 1, "yes", "Yes"]:
                self._insert_tick(page, 313.5, y_pos, size=8.5, color=(0, 0, 0))

        # Box 6: Additional comments
        comments = str(data.get("exp_comments") or data.get("comments") or "").strip()
        if comments:
            c_lines = comments.split("\n")
            curr_y = 608
            for cl in c_lines[:3]:
                if cl.strip():
                    self._insert_text(page, 65, curr_y, cl.strip()[:95], size=9)
                curr_y += 14

        # Signatures
        tech_sig = data.get("signature_tech") or data.get("sig_technician") or data.get("signature_engineer")
        if tech_sig:
            self._insert_signature(page, (70, 645, 160, 675), tech_sig)
        tech_name = str(data.get("exp_tech_name") or data.get("technician_name") or data.get("tech_name") or "").strip()
        if tech_name:
            self._insert_text(page, 105, 680, tech_name, size=9.5)
        tech_date = self._format_date_dmy(data.get("exp_tech_date") or raw_date)
        if tech_date:
            self._insert_text(page, 90, 698, tech_date, size=9)

        sr_sig = data.get("exp_sr_tech_sig")
        if sr_sig:
            self._insert_signature(page, (200, 645, 290, 675), sr_sig)
        sr_name = str(data.get("exp_sr_tech_name") or "").strip()
        if sr_name:
            self._insert_text(page, 235, 680, sr_name, size=9.5)
        sr_date = self._format_date_dmy(data.get("exp_sr_tech_date") or raw_date)
        if sr_date:
            self._insert_text(page, 220, 698, sr_date, size=9)

        sales_sig = data.get("exp_sales_sig") or data.get("signature_cust") or data.get("sig_customer")
        if sales_sig:
            self._insert_signature(page, (390, 645, 480, 675), sales_sig)
        sales_n = str(data.get("exp_sales_name") or sales_person).strip()
        if sales_n:
            self._insert_text(page, 430, 680, sales_n, size=9.5)
        sales_d = self._format_date_dmy(data.get("exp_sales_date") or raw_date)
        if sales_d:
            self._insert_text(page, 420, 698, sales_d, size=9)

        mgr_sig = data.get("exp_mgr_sig")
        if mgr_sig:
            self._insert_signature(page, (390, 695, 480, 725), mgr_sig)
        mgr_n = str(data.get("exp_mgr_name") or "").strip()
        if mgr_n:
            self._insert_text(page, 430, 730, mgr_n, size=9.5)
        mgr_d = self._format_date_dmy(data.get("exp_mgr_date") or raw_date)
        if mgr_d:
            self._insert_text(page, 420, 747, mgr_d, size=9)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        doc.close()
        return output_path

    # =========================================================================
    # SERVICE REQUEST FORM GENERATOR (FM-EPS-28, Rev.05, 21/09/63)
    # Matches official CRM layout: clean white page without horizontal dividers
    # =========================================================================
    def generate_service_request_pdf(self, data: Dict[str, Any], output_path: str) -> str:
        """Render official ISO Service Request Form (FM-EPS-28) from pure CRM data"""
        doc = pymupdf.open()
        page = doc.new_page(width=595.08, height=841.68) # A4

        def _txt(x, y, txt, size=13, bold=False, color=(0,0,0)):
            if txt is None or txt == "":
                return
            fn = "thb" if bold else "th"
            ff = FONT_TH_B if bold else FONT_TH
            page.insert_text(pymupdf.Point(x, y), str(txt), fontsize=size, fontname=fn, fontfile=ff, color=color)

        # 1. Title
        _txt(220, 80, "Service Request Form", size=18, bold=True)

        # 2. Top Right
        t_no = str(data.get("Title") or data.get("RequestNo") or data.get("TicketKey") or data.get("TicketNo") or data.get("ticket_no") or "-").strip()
        raw_created = data.get("Created Time") or data.get("CreatedDate") or data.get("created_time") or ""
        issue_date = "-"
        if raw_created and str(raw_created).strip() not in ["-", "nan", "none"]:
            try:
                from datetime import datetime
                raw_clean = str(raw_created).split(".")[0].strip()
                if " " in raw_clean:
                    dt = datetime.strptime(raw_clean, "%Y-%m-%d %H:%M:%S")
                    issue_date = dt.strftime("%Y-%m-%d %I:%M %p")
                else:
                    issue_date = raw_clean
            except Exception:
                issue_date = str(raw_created).strip()

        _txt(359, 108, f"Service Request No. : {t_no}", size=12.5)
        _txt(359, 124, f"Issue Date : {issue_date}", size=12.5)

        # 3. Company & Site
        cust = str(data.get("Organization Name") or data.get("Customer") or "-").replace("Accounts::::", "").strip() or "-"
        contact = str(data.get("Site Contact Person") or data.get("ContactPerson") or "-").strip() or "-"
        phone = str(data.get("Site Contact Phone") or data.get("ContactPhone") or "-").strip() or "-"
        addr = str(data.get("Address or Site") or data.get("Site") or "-").strip() or "-"

        _txt(68, 155, f"Company name : {cust}", size=12.5)
        _txt(68, 175, f"Site Contact Person : {contact}", size=12.5)
        _txt(68, 195, f"Site Contact Phone : {phone}", size=12.5)
        _txt(68, 215, f"Address / Site : {addr}", size=12.5)

        # 4. Two Columns
        so = str(data.get("Sales Orders") or data.get("SalesOrder") or "-").strip() or "-"
        prod = str(data.get("Product") or data.get("ProductCode") or "-").strip() or "-"
        serial = str(data.get("Serial Number") or data.get("SerialNo") or "-").strip() or "-"

        req_group = str(data.get("Request By Group") or data.get("Group") or "").strip()
        assigned_to = str(data.get("Assigned To") or data.get("AssignedTo") or "").strip()
        assigned_by = str(data.get("Assigned By") or "").strip()
        if req_group and assigned_to:
            req_by = f"{req_group} / {assigned_to.title()}"
        elif req_group:
            req_by = req_group
        elif assigned_to:
            req_by = assigned_to.title()
        elif assigned_by:
            req_by = assigned_by
        else:
            req_by = "-"

        model = str(data.get("Model") or data.get("PumpModel") or "-").strip() or "-"
        typ = str(data.get("Type") or "-").strip() or "-"

        _txt(68, 240, f"Sales Order : {so}", size=12.5)
        _txt(68, 256, f"Product : {prod}", size=12.5)
        _txt(68, 272, f"Serial No. : {serial}", size=12.5)

        _txt(275, 240, f"Request By : {req_by}", size=12.5)
        _txt(275, 256, f"Pump Model : {model}", size=12.5)
        _txt(275, 272, f"Type : {typ}", size=12.5)

        # 5. Problem / Detail of work
        desc = str(data.get("Description") or data.get("ProblemDetail") or "").strip()
        _txt(68, 300, "Problem / Detail of work :", size=12.5)
        
        y_curr = 300
        if desc:
            lines = [line.strip() for line in desc.split("\n") if line.strip()]
            if lines:
                first_l = lines[0]
                _txt(195, y_curr, first_l[:75], size=12.5)
                y_curr += 18
                for extra_line in lines[1:]:
                    _txt(68, y_curr, extra_line[:95], size=12.5)
                    y_curr += 18

        # 6. Work Require
        y_req_header = max(345, y_curr + 15)
        _txt(66, y_req_header, "Work Require :", size=12.5, bold=True)

        items = [
            ("Start up Commissioning :", data.get("Start up Commissioning")),
            ("Inspection :", data.get("Inspection")),
            ("Reassembly :", data.get("Reassembly")),
            ("Spare part Changing or Modification :", data.get("Spare part Changing or Modification")),
            ("Repair :", data.get("Repair")),
            ("Other :", data.get("Other"))
        ]
        y_r = y_req_header + 16
        for label, val in items:
            _txt(68, y_r, label, size=12.5)
            is_yes = str(val).strip() in ["1", "1.0", "True", "true", "Yes", "yes"]
            _txt(348, y_r, "Yes" if is_yes else "No", size=12.5)
            y_r += 16

        # 7. Documents & Appointments
        y_doc = y_r + 14
        _txt(67, y_doc, "Including Document :", size=12.5)
        y_doc += 16
        detail_val = str(data.get("Detail") or "-").strip() or "-"
        _txt(67, y_doc, f"Detail : {detail_val}", size=12.5)

        y_app = y_doc + 24
        app_date = str(data.get("Appointment Date") or data.get("AppointmentDate") or "-").strip() or "-"
        if app_date and " " in app_date:
            app_date = app_date.split(" ")[0]
        app_time = str(data.get("Appointment Time") or "-").strip() or "-"
        _txt(66, y_app, f"Appointment Date : {app_date}", size=12.5)
        y_app += 16
        _txt(66, y_app, f"Appointment Time : {app_time}", size=12.5)

        # 8. Service & Assignment
        y_serv = y_app + 24
        serv_by = str(data.get("Service By") or data.get("ServiceBy") or "-").replace("|##|", ", ").strip() or "-"
        assigned_by = str(data.get("Assigned By") or data.get("AssignedTo") or "-").strip() or "-"
        comp_d = str(data.get("Completed Date") or data.get("CompletedDate") or "-").strip() or "-"
        if comp_d and " " in comp_d:
            comp_d = comp_d.split(" ")[0]

        _txt(67, y_serv, f"Service By : {serv_by}", size=12.5)
        y_serv += 16
        _txt(66, y_serv, f"Assigned By : {assigned_by}", size=12.5)
        y_serv += 16
        _txt(66, y_serv, f"Completed Date : {comp_d}", size=12.5)

        # 9. Footer
        _txt(390, 775, "FM-EPS-28, Rev.05, 21/09/63", size=10)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        doc.close()
        return output_path

    def get_or_create_service_request_pdf(self, ticket: str, data: Dict[str, Any], output_dir: str) -> Optional[str]:
        """Find pre-existing CRM ticket PDF from drive or generate dynamically from CRM data"""
        ticket_str = str(ticket).strip()
        out_req_pdf = os.path.join(output_dir, f"CRM_REQUEST_{ticket_str}.pdf")

        # 1. Search CRM Ticket folders
        search_dirs = [
            r"g:\Shared drives\Service Report\ฝ่ายงาน (Back Office)\Service Photo App\1. CRM Ticket",
            r"g:\Shared drives\Service Report\Service Report Automation\CRM Ticket",
            os.path.join(BASE_DIR, "data", "crm_tickets")
        ]
        import shutil
        for s_dir in search_dirs:
            if os.path.exists(s_dir):
                for fname in os.listdir(s_dir):
                    if fname.lower().endswith(".pdf") and ticket_str in fname:
                        src_file = os.path.join(s_dir, fname)
                        try:
                            shutil.copyfile(src_file, out_req_pdf)
                            return out_req_pdf
                        except Exception as e:
                            print(f"[CRM Service Request] Error copying {src_file}: {e}")

        # 2. Look up PURE CRM record (strictly from CRM database, NOT technician's form inputs)
        pure_crm = {}
        csv_candidates = [
            r"G:\My Drive\Service_App_Data\Tickets_Cleaned.csv",
            r"G:\My Drive\Service_App_Data\Tickets.csv",
            os.path.join(BASE_DIR, "data", "crm_tickets_cache.csv")
        ]
        import csv
        for cp in csv_candidates:
            if os.path.exists(cp):
                try:
                    with open(cp, "r", encoding="utf-8-sig", errors="ignore") as cf:
                        reader = csv.DictReader(cf)
                        for row in reader:
                            t_title = str(row.get("Title") or "").strip()
                            t_key = str(row.get("TicketKey") or "").strip()
                            t_no = str(row.get("TicketNo") or "").strip()
                            t_req = str(row.get("RequestNo") or "").strip()
                            if ticket_str in [t_title, t_key, t_no, t_req] and ticket_str:
                                pure_crm = {k: v for k, v in row.items() if v is not None}
                                break
                    if pure_crm:
                        break
                except Exception as ex:
                    print(f"[CRM Service Request] Error reading CSV {cp}: {ex}")

        # If not found in CSVs, fallback to backend get_ticket
        if not pure_crm:
            try:
                import sys
                from app import get_ticket
                t_obj = get_ticket(ticket_str)
                if t_obj:
                    pure_crm = dict(t_obj)
            except Exception:
                pass

        if not pure_crm:
            pure_crm = {"Title": ticket_str, "TicketNo": ticket_str}
        else:
            pure_crm["ticket_no"] = ticket_str

        # 3. Generate dynamically from pure CRM ticket data
        try:
            return self.generate_service_request_pdf(pure_crm, out_req_pdf)
        except Exception as e:
            print(f"[CRM Service Request] Error generating PDF for {ticket_str}: {e}")
            return None

    # =========================================================================
    # COMBINED ALL-IN-ONE PDF PACKAGE
    # =========================================================================
    def merge_pdf_package(self, pdf_paths: List[str], output_path: str) -> str:
        merged_doc = pymupdf.open()
        for path in pdf_paths:
            if path and os.path.exists(path):
                try:
                    src_doc = pymupdf.open(path)
                    merged_doc.insert_pdf(src_doc)
                    src_doc.close()
                except Exception as e:
                    print(f"[MergePdf] Error merging {path}: {e}")

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        merged_doc.save(output_path)
        merged_doc.close()
        return output_path
