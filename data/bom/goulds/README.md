# Goulds 3196 i-FRAME — Part List แยกตามกลุ่มเฟรม
**(รวบรวมไว้ก่อน — ยังไม่ขึ้นแอป Inspection & Repair Parts)**

## ไฟล์ในโฟลเดอร์นี้
| ไฟล์ | คืออะไร |
|---|---|
| `Goulds_3196_PartList_STi.xlsx` | Part List กลุ่ม STi |
| `Goulds_3196_PartList_MTi.xlsx` | Part List กลุ่ม MTi |
| `Goulds_3196_PartList_LTi.xlsx` | Part List กลุ่ม LTi |
| `Goulds_3196_PartList_XLT-i.xlsx` | Part List กลุ่ม XLT-i |
| `Goulds_3196_PartList_i-17.xlsx` | Part List กลุ่ม i-17 |
| `Goulds_3196_PartList_เทียบทุกกลุ่ม.xlsx` | ⭐ ตารางเทียบเลข Part No. ทั้ง 5 กลุ่มในชีตเดียว |
| `diagrams/` | ผังอะไหล่ (exploded view) แยกไฟล์ PNG ความละเอียดสูง |
| `_build_result.json` | log การสร้างไฟล์ |

แต่ละไฟล์มี 4 ชีต: **คำอธิบาย** (อ่านก่อน) · **Part List** · **วัสดุ (อ้างอิง)** · **ผังอะไหล่**

## คอลัมน์ในชีต Part List
`ITEM | PART NO. | DESCRIPTION | MATERIAL | QTY | PRICE | หมายเหตุ | วัสดุ (รหัส)`
(เรียงคอลัมน์แบบเดียวกับ BOM ของ Viking เพื่อให้ย้ายเข้าแอปได้ง่าย)

## แหล่งข้อมูล (เอกสารจริงของ Goulds/ITT ในเครื่อง)
- **ETM 725.1A400** “Parts List with Materials of Construction” 27 May 2022 — `3196 ANSI Process\ETM\ETM_3196.pdf` หน้า 104-106 (ชื่อ/จำนวน/วัสดุ)
- **Goulds 725.1A150** “Power End Comparison Chart — Oil Lube” — ไฟล์เดียวกัน หน้า 39-43 (เลข Part No. แยกกลุ่ม)
- **IOM 3196 i-FRAME** Table 29/30/31 — `Manual_Goulds Pumps\IOM_3196i-FRAME.pdf` หน้า 160-164 (จำนวน/รหัสวัสดุ)
- **ผังอะไหล่** — IOM หน้า 165-166 Figure 141-144

## ข้อควรระวัง
1. เลข Part No. มาจากเอกสาร Goulds ปี 2008/2009 — **เช็คกับ ITT อีกครั้งก่อนสั่งซื้อ**
2. ช่องที่กำกับ “ใช้เลขเดิม X-Series” = ในเอกสารต้นฉบับช่อง i-FRAME ว่าง (ใช้เลขเดิมได้)
3. อะไหล่ฝั่งน้ำ (Casing/Impeller/Gland/Seal) ไม่มีเลขในตารางนี้ — Goulds ให้ระบุขนาด + ซีเรียลนัมเบอร์
4. กลุ่ม XLT-i กับ i-17 ใช้ตาราง Part No. ร่วมกัน — ต่างเฉพาะข้อที่ระบุขนาด 17"
5. ราคา (PRICE) เว้นว่าง — ให้ฝ่ายขายกรอกจากใบเสนอราคา ITT

## ขั้นต่อไป (ยังไม่ทำ)
- เก็บรุ่นอื่นให้ครบตามที่ต้องการ → แปลงเป็นโครง BOM ของแอป (แบบเดียวกับ Viking) → ขึ้นแอป
- โครงที่แอปต้องใช้: `ITEM | PART NO. | DESCRIPTION | MATERIAL | PRICE` + ผังอะไหล่ต่อรุ่น

_สร้างโดยหน้ามึน (Na-Muen) — 08/10/2026_
