/**
 * =============================================================================
 * SIAMRAJ SERVICE REPORT — Google Apps Script (Backend Database & Google Drive)
 * Version: 1.1.0
 * =============================================================================
 * 
 * หน้าที่ของสคริปต์นี้:
 * 1. รับข้อมูลสรุปงานบริการจากระบบ Siamraj Service Report
 * 2. บันทึกลง Google Sheet แผ่น 'Service_Reports' อัตโนมัติ (อัปเดตบรรทัดเดิมถ้ามี Request No. ซ้ำ)
 * 3. อัปโหลดไฟล์ PDF ฉบับสมบูรณ์ไปเก็บใน Google Drive โฟลเดอร์ 'Service_Reports_PDF'
 * 4. นำลิงก์เปิดดู PDF บน Google Drive มาหยอดลงช่องใน Google Sheet ให้อัตโนมัติทันที
 */

// =============================================================================
// ตั้งค่า (CONFIGURATION)
// =============================================================================
// หากท่านสร้าง Google Sheet ไว้แล้ว ให้นำ URL หรือ ID ของ Google Sheet มาใส่ที่นี่ได้เลยครับ
// ตัวอย่าง: 'https://docs.google.com/spreadsheets/d/1abcXYZ.../edit'
// *ถ้าเว้นว่างไว้ ระบบจะค้นหาหรือสร้างไฟล์ Google Sheet ชื่อ "Siamraj Service Report Database" ใน Drive ให้อัตโนมัติ
const SPREADSHEET_ID_OR_URL = ''; 

const SHEET_NAME = 'Service_Reports';
const FOLDER_NAME = 'Service_Reports_PDF';

function getSpreadsheet() {
  // 1. ถ้ามีการระบุ ID หรือ URL ในโค้ด
  if (SPREADSHEET_ID_OR_URL && SPREADSHEET_ID_OR_URL.trim() !== '') {
    let raw = SPREADSHEET_ID_OR_URL.trim();
    if (raw.indexOf('/d/') !== -1) {
      const parts = raw.split('/d/');
      raw = parts[1].split('/')[0];
    }
    return SpreadsheetApp.openById(raw);
  }
  
  // 2. ถ้าสคริปต์นี้ผูกอยู่ภายใน Google Sheet (เปิดจาก Extensions > Apps Script)
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  // 3. ถ้าเป็น Standalone Script ให้ค้นหาไฟล์ชื่อนี้ใน Google Drive
  try {
    const files = DriveApp.getFilesByName('Siamraj Service Report Database');
    if (files.hasNext()) {
      return SpreadsheetApp.open(files.next());
    }
  } catch (e) {}

  // 4. ถ้ายังไม่มีใน Drive ให้สร้าง Google Sheet ใหม่ชื่อ 'Siamraj Service Report Database' ให้อัตโนมัติทันที
  return SpreadsheetApp.create('Siamraj Service Report Database');
}

function setupSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  const headers = [
    'Timestamp (วันเวลาบันทึก)',
    'Status (สถานะ)',
    'Request No. (เลขที่ตั๋ว)',
    'Customer (ชื่อลูกค้า)',
    'Site / Plant (สถานที่)',
    'Pump Model (รุ่นปั๊ม)',
    'Serial No. (หมายเลขเครื่อง)',
    'Serviced By (ช่างผู้จัดทำ)',
    'Serviced Date (วันที่เข้าบริการ)',
    'Forms in Package (ชุดใบงาน)',
    'Total Expense (รวมค่าใช้จ่าย)',
    'Satisfaction (คะแนนประเมิน)',
    'Drive PDF Link (ลิงก์เปิดดู PDF)',
    'Last Updated'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#B91C1C')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    // จัดความกว้างคอลัมน์ให้อ่านง่ายพอดี
    sheet.setColumnWidth(1, 160); // Timestamp
    sheet.setColumnWidth(2, 90);  // Status
    sheet.setColumnWidth(3, 110); // Request No
    sheet.setColumnWidth(4, 220); // Customer
    sheet.setColumnWidth(5, 180); // Site
    sheet.setColumnWidth(6, 120); // Model
    sheet.setColumnWidth(7, 130); // Serial
    sheet.setColumnWidth(8, 150); // Serviced By
    sheet.setColumnWidth(9, 120); // Serviced Date
    sheet.setColumnWidth(10, 240); // Forms
    sheet.setColumnWidth(11, 120); // Expense
    sheet.setColumnWidth(12, 120); // Satisfaction
    sheet.setColumnWidth(13, 260); // Drive PDF Link
    sheet.setColumnWidth(14, 160); // Last Updated
  }
  return sheet;
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'No POST data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    const ss = getSpreadsheet();
    const sheet = setupSheet();
    const requestNo = String(data.request_no || data.ticket_no || '').trim();
    if (!requestNo) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Missing request_no' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 1. Upload PDF to Google Drive if base64 provided
    let drivePdfUrl = '';
    if (data.pdf_base64) {
      try {
        const folder = getOrCreateFolder(FOLDER_NAME);
        const cleanCust = String(data.customer || '').replace(/[\\/:*?"<>|]/g, '').trim();
        const defaultName = cleanCust ? `SERVICE_REPORT_${requestNo}_${cleanCust}.pdf` : `SERVICE_REPORT_${requestNo}.pdf`;
        const fileName = data.pdf_filename || defaultName;
        
        // ลบไฟล์เดิมในโฟลเดอร์ถ้าชื่อซ้ำ เพื่อไม่ให้เปลืองพื้นที่ Drive
        const oldFiles = folder.getFilesByName(fileName);
        while (oldFiles.hasNext()) oldFiles.next().setTrashed(true);
        
        const decoded = Utilities.base64Decode(data.pdf_base64);
        const blob = Utilities.newBlob(decoded, 'application/pdf', fileName);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        drivePdfUrl = file.getUrl();
      } catch (errUpload) {
        drivePdfUrl = 'Upload notice: ' + errUpload.toString();
      }
    }
    
    const nowStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
    const rowValues = [
      nowStr,
      String(data.status || 'submitted').toUpperCase(),
      requestNo,
      data.customer || '',
      data.plant || '',
      data.model || '',
      data.serial || '',
      data.serviced_by || '',
      data.serviced_date || '',
      data.forms_included || '',
      data.total_expense || '-',
      data.sat_score || '-',
      drivePdfUrl || data.pdf_url || '',
      nowStr
    ];
    
    // 2. Find existing requestNo to update or append
    let rowIndex = -1;
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const values = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for (let i = 0; i < values.length; i++) {
        if (String(values[i][0]).trim() === requestNo) {
          rowIndex = i + 2;
          break;
        }
      }
    }
    
    if (rowIndex > 1) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
      rowIndex = sheet.getLastRow();
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      request_no: requestNo,
      row: rowIndex,
      drive_pdf_url: drivePdfUrl,
      spreadsheet_url: ss.getUrl(),
      updated_at: nowStr
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = getSpreadsheet();
    const sheet = setupSheet();
    const count = Math.max(0, sheet.getLastRow() - 1);
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      service: 'Siamraj Service Report GAS Database API',
      status: 'online',
      spreadsheet_name: ss.getName(),
      spreadsheet_url: ss.getUrl(),
      sheet_name: SHEET_NAME,
      folder_name: FOLDER_NAME,
      total_records: count,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
