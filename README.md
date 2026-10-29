# 🛠️ Siamraj Service Report — ระบบรายงานงานบริการครบวงจร

ระบบเว็บพอร์ทัลแบบครบวงจร (Unified Service Portal) พัฒนาขึ้นใหม่ทั้งหมดเพื่อสานต่องานระบบ Service Report ของ **บริษัท สยามราชปั๊ม (Siamrajpump)** โดยรวม 4 โมดูลหลักเข้าไว้ด้วยกันในระบบเดียว พร้อมเอนจินออกรายงาน **PDF ฟอร์ม ISO จริง** (FM-EPS-22, FM-EPS-23, FM-EPS-25, FM-EPS-31, FM-EPS-45) และ Photo Report อัตโนมัติ

---

## 🌟 จุดเด่นและสิ่งที่ Rebuild ขึ้นใหม่ทั้งหมด

1. **รวม 4 ระบบไว้ในพอร์ทัลเดียว (Unified Architecture):**
   - 📋 **โมดูล 1: Service Report (FM-EPS-23 / 22 / 45)** — ค้นหาและดึงตั๋วงานจาก CRM อัตโนมัติ บันทึกผลการซ่อมบำรุง ตรวจสภาพ Visual Check 8 รายการ, Alignment Dial Gauge Matrix (0°, 90°, 180°, 270°), Vibration & Bearing Temp (Pump/Motor/Gear), สภาวะทางไฟฟ้า และแบบประเมินความพึงพอใจลูกค้า
   - 🔧 **โมดูล 2: Inspection & Recommended Parts (FM-EPS-31 / 25)** — ตารางวัดขนาดความสึกหรอชิ้นส่วน 19 จุด พร้อมระบบเปรียบเทียบค่าพิกัดมาตรฐาน (Min/Max mm) และประเมิน Pass/Fail อัตโนมัติ พร้อมระบบเลือกอะไหล่จากฐานข้อมูล BOM (Viking & Goulds 3196) มีโหมดแสดงราคา (ฉบับภายใน) และซ่อนราคา (ฉบับลูกค้า)
   - 📸 **โมดูล 3: Service Photo Report** — อัปโหลดภาพถ่ายหน้างาน (เปิดกล้องมือถือหรือลากวาง) จัดหมวดหมู่ (เนมเพลท, ก่อนซ่อม, ระหว่างซ่อม, จุดชำรุด, หลังซ่อม, ส่งมอบ) พร้อมจัดเล่ม A4 Photo Report อัตโนมัติ
   - 📊 **โมดูล 4: Dashboard & คลังเอกสาร** — ติดตามสถานะงาน (Draft / Ready / Submitted) ค้นหาประวัติ และดาวน์โหลดเอกสาร PDF ฟอร์ม ISO ได้ทันที
2. **เอนจินสร้าง PDF ISO แท้ด้วย PyMuPDF (`backend/pdf_engine/iso_engine.py`):**
   - ใช้เทมเพลตมาสเตอร์จริงของสยามราช พิมพ์ข้อความภาษาไทยสวยงามด้วยฟอนต์มาตรฐาน `TH Sarabun New`
   - ติ๊กเครื่องหมายถูก/กากบาทลงในกล่อง Checkbox ตามพิกัดจริง
   - วางภาพลายมือชื่อดิจิทัล (Digital Signature) ของช่างและลูกค้าลงในช่องเซ็นมอบงาน
   - สามารถรวมเอกสารทุกใบเป็นแพ็กเกจส่งมอบลูกค้าเล่มเดียว (`ALL_<ticket>.pdf`)
3. **ระบบลายเซ็นดิจิทัล (HTML5 Canvas Digital Sign Pad):**
   - ช่างและลูกค้าเซ็นบนหน้าจอมือถือหรือแท็บเล็ตได้ทันที มีปุ่มล้างลายเซ็นและบันทึกเวลา
4. **ค้นหาตั๋วงาน CRM ได้รวดเร็วแบบ Instant Typeahead:**
   - เชื่อมต่อกับแคชตั๋วงาน CRM กว่า 3,000+ ใบ ค้นหาด้วยเลขงานหรือชื่อลูกค้า ข้อมูลเครื่องจักรจะถูกดึงมาเติมให้อัตโนมัติ

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
G:\My Drive\service-report-portal\
├── backend\
│   ├── app.py                      # FastAPI REST API Server
│   └── pdf_engine\
│       └── iso_engine.py           # PyMuPDF ISO Forms Generator
├── data\
│   ├── crm_tickets_cache.csv       # ข้อมูลตั๋วงาน CRM (>3,000 ใบ)
│   ├── templates\                  # แม่แบบ PDF มาสเตอร์ของฟอร์ม ISO
│   │   ├── FM-EPS-22_ฟอร์มกรอกได้.pdf
│   │   ├── FM-EPS-23_ฟอร์มกรอกได้.pdf
│   │   ├── FM-EPS-25_ฟอร์มกรอกได้.pdf
│   │   ├── FM-EPS-31_ฟอร์มกรอกได้.pdf
│   │   └── FM-EPS-45_ฟอร์มกรอกได้.pdf
│   ├── coordinates\                # พิกัดตำแหน่งกล่องข้อความและ Checkbox
│   │   ├── พิกัดกล่องข้อความ_5ฟอร์ม.json
│   │   └── พิกัดกล่องข้อความ_5ฟอร์ม.csv
│   └── bom\
│       ├── viking\                 # ฐานข้อมูล BOM ปั๊ม Viking (models.json, stock.json, insp.csv)
│       └── goulds\                 # ฐานข้อมูล BOM ปั๊ม Goulds 3196 (STi, MTi, LTi, XLT-i, i-17)
├── frontend\
│   └── public\
│       ├── index.html              # หน้าเว็บหลัก Responsive SPA
│       ├── app.js                  # Frontend Controller & Signature Pad Logic
│       └── styles.css              # Custom Styling & Sarabun Font
├── storage\
│   ├── reports\                    # จัดเก็บไฟล์ JSON ร่างงานและส่งงาน
│   ├── photos\                     # จัดเก็บรูปถ่ายหน้างานแยกตามโฟลเดอร์เลขงาน
│   └── output_pdf\                 # จัดเก็บไฟล์ PDF ISO ที่สร้างสำเร็จ
├── run_portal.py                   # ตัวรันระบบ (เปิดเบราว์เซอร์อัตโนมัติ)
├── run_portal.bat                  # ดับเบิลคลิกเพื่อเปิดระบบบน Windows
└── README.md                       # คู่มือการใช้งานและเอกสารสถาปัตยกรรม
```

---

## 🚀 วิธีการเปิดใช้งาน (How to Run)

### วิธีที่ 1: ดับเบิลคลิก (ง่ายที่สุดบน Windows)
ดับเบิลคลิกที่ไฟล์:
```
run_portal.bat
```
ระบบจะเปิดเซิร์ฟเวอร์และเปิดเว็บเบราว์เซอร์ไปยัง `http://localhost:8000` ให้โดยอัตโนมัติ

### วิธีที่ 2: รันผ่าน Command Line
เปิด Terminal หรือ PowerShell แล้วรันคำสั่ง:
```bash
cd "G:\My Drive\service-report-portal"
python run_portal.py
```

---

## 📱 การใช้งานผ่านมือถือหรือแท็บเล็ตในวงแลน (Local Network)
หากต้องการให้ช่างหน้างานเปิดใช้งานผ่านมือถือหรือ iPad ในไซต์งาน/ออฟฟิศเดียวกัน:
1. ตรวจสอบหมายเลข IP เครื่องที่รันเซิร์ฟเวอร์ (เช่น `192.168.1.50`)
2. บนมือถือ เปิดเบราว์เซอร์แล้วเข้าที่: `http://192.168.1.50:8000`
3. แนะนำให้กด **"Add to Home Screen" (เพิ่มไปยังหน้าจอหลัก)** บนมือถือ เพื่อเปิดใช้งานแบบเต็มจอเหมือนแอปจริง

---

## ⚙️ REST API Endpoints หลัก

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| `GET` | `/api/health` | ตรวจสอบสถานะเซิร์ฟเวอร์และจำนวนตั๋วงานในแคช |
| `GET` | `/api/tickets?q={query}` | ค้นหาตั๋วงานจาก CRM Cache |
| `GET` | `/api/tickets/{ticket_no}` | ดูข้อมูลรายละเอียดของตั๋วงาน |
| `GET` | `/api/bom/viking/models` | ดึงรายชื่อโมเดลปั๊ม Viking |
| `GET` | `/api/bom/goulds/groups` | ดึงกลุ่มเฟรมปั๊ม Goulds 3196 |
| `POST` | `/api/reports/save-draft` | บันทึกร่างงาน (Draft JSON) |
| `GET` | `/api/reports/load-draft/{ticket_no}` | โหลดร่างงานที่เคยบันทึกไว้ |
| `POST` | `/api/reports/submit` | ส่งงานและสั่งสร้าง PDF ISO ทุกฟอร์ม |
| `POST` | `/api/photos/upload` | อัปโหลดรูปภาพหน้างานพร้อมระบุหมวดหมู่และคำบรรยาย |
| `GET` | `/api/photos/{ticket_no}` | ดูรายการภาพถ่ายทั้งหมดของตั๋วงาน |
| `GET` | `/api/download/{ticket_no}/{filename}` | ดาวน์โหลดไฟล์ PDF ที่สร้างเสร็จแล้ว |
