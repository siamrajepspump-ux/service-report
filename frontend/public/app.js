/**

 * Siamraj Service Report - Frontend Client Application

 */



// Global State

const state = {

  currentTicket: null,

  techPad: null,

  custPad: null,

  photos: [],

  parts: [],

  vikingModels: [],

  gouldsGroups: [],

  currentInspRows: [],

  currentInspModel: "",

  currentInspPIR: "",

  bomPartsCatalog: [],

  currentBomModel: "",

  currentBomDiagram: "",

  photoCovers: [],

  activeCoverId: null,

  activePhotoReportPhotos: [],

  packageInstances: [],

  activeInstanceId: null,

  packageViewMode: "tab" // "tab" (focused) or "all" (show all forms)

};



// 8 Standard items for FM-EPS-22 Check Report

const VISUAL_ITEMS = [

  "1. การรั่วซึมของปั๊ม (Pump leakage)",

  "2. การรั่วซึมของน้ำมันหล่อลื่น (Lubrication oil leakage)",

  "3. ระดับของน้ำมันหล่อลื่น (Lubrication oil level)",

  "4. ทดสอบการหมุนของปั๊มด้วยมือ (Pump rotation by hand)",

  "5. การขันแน่นของท่อดูด (Suction pipe fastening)",

  "6. การขันแน่นของท่อจ่าย (Discharge pipe fastening)",

  "7. สภาพทั่วไปของ coupling (Coupling condition)",

  "8. สภาพทั่วไปของจาระบี (Greasing condition)"

];



// 14 Evaluation items in 4 categories for FM-EPS-45 Rev.00 (03/03/59)

const SATISFACTION_SECTIONS = [

  {

    category: "1. ด้านเทคนิค",

    items: [

      { id: "tech_1", no: "1.1", text: "พนักงานมีความรู้ความสามารถในการแก้ไขปัญหาให้กับท่าน" },

      { id: "tech_2", no: "1.2", text: "พนักงานอธิบายถึงสาเหตุหรือวิธีการแก้ไขป้องกัน ไม่ให้เกิดปัญหากับปั๊ม หรือ อุปกรณ์ของท่าน" },

      { id: "tech_3", no: "1.3", text: "พนักงานมีความรู้เกี่ยวกับระบบและการทำงานของอุปกรณ์ ที่เกี่ยวข้องกัน" },

      { id: "tech_4", no: "1.4", text: "ความสามารถทางด้านเทคนิคที่เกี่ยวกับสินค้า" }

    ]

  },

  {

    category: "2. ด้านคุณภาพ/เวลา/ความสะอาด/จำนวนผู้ปฏิบัติงาน",

    items: [

      { id: "qual_1", no: "2.1", text: "คุณภาพ/ผลงานในการปฏิบัติงาน กับปั๊มหรืออุปกรณ์ของท่าน" },

      { id: "qual_2", no: "2.2", text: "ความรวดเร็วในการตรวจ/ซ่อม ปั๊มหรือ อุปกรณ์ของท่าน" },

      { id: "qual_3", no: "2.3", text: "พนักงานมาตามกำหนดเวลานัดหมายกับท่าน" },

      { id: "qual_4", no: "2.4", text: "เมื่อพนักงานปฏิบัติงานในการตรวจ/ซ่อมเรียบร้อยแล้ว ความสะอาดของปั๊ม/อุปกรณ์ และพื้นที่ปฏิบัติงาน" },

      { id: "qual_5", no: "2.5", text: "ความเหมาะสมของ จำนวนพนักงานที่เข้าไปปฏิบัติงาน" }

    ]

  },

  {

    category: "3. ด้านบุคคลิกภาพส่วนตัวของพนักงาน",

    items: [

      { id: "pers_1", no: "3.1", text: "กริยามารยาทในการพูดคุย/ประสานงานหรือการตอบข้อซักถาม" },

      { id: "pers_2", no: "3.2", text: "สภาพ/ความเรียบร้อยและความถูกต้อง ในการแต่งกาย ขณะเข้าปฏิบัติงานในพื้นที่ปฏิบัติงาน" },

      { id: "pers_3", no: "3.3", text: "ความพร้อมก่อนการปฏิบัติงาน" }

    ]

  },

  {

    category: "4. เครื่องมือ/อุปกรณ์",

    items: [

      { id: "tool_1", no: "4.1", text: "เครื่องมือ/อุปกรณ์ ที่ต้องใช้งานในการตรวจซ่อม" },

      { id: "tool_2", no: "4.2", text: "สภาพของเครื่องมือที่พนักงานใช้ในการตรวจซ่อม" }

    ]

  }

];



const ALL_SAT_ITEMS = SATISFACTION_SECTIONS.flatMap(s => s.items);

// Backward compatibility alias

const SATISFACTION_ITEMS = ALL_SAT_ITEMS;



// Standard 19 Inspection dimensions for FM-EPS-31

const INSP_DEFAULT_ROWS = [

  { part: "ROTOR OD", pos: "UPPER" },

  { part: "ROTOR OD", pos: "LOWER" },

  { part: "ROTOR ID", pos: "UPPER" },

  { part: "ROTOR ID", pos: "LOWER" },

  { part: "ROTOR TOOTH LENGTH", pos: "-" },

  { part: "IDLER OD", pos: "UPPER" },

  { part: "IDLER OD", pos: "LOWER" },

  { part: "IDLER BUSHING ID", pos: "UPPER" },

  { part: "IDLER BUSHING ID", pos: "LOWER" },

  { part: "IDLER TOOTH LENGTH", pos: "-" },

  { part: "IDLER PIN OD", pos: "UPPER" },

  { part: "IDLER PIN OD", pos: "LOWER" },

  { part: "SHAFT OD", pos: "UPPER" },

  { part: "SHAFT OD", pos: "LOWER" },

  { part: "SHAFT BUSHING ID", pos: "UPPER" },

  { part: "SHAFT BUSHING ID", pos: "LOWER" },

  { part: "CRESCENT LENGTH", pos: "-" },

  { part: "CASING ID", pos: "UPPER" },

  { part: "CASING ID", pos: "LOWER" }

];



function formatIsoToDmy(isoStr) {

  if (!isoStr) return "";

  const s = String(isoStr).trim();

  const dPart = s.split(" ")[0].split("T")[0];

  if (dPart.includes("-")) {

    const p = dPart.split("-");

    if (p.length === 3 && p[0].length === 4) {

      return `${p[2]}/${p[1]}/${p[0]}`;

    }

  }

  return s;

}



document.addEventListener("DOMContentLoaded", () => {

  initIcons();

  initSignaturePads();

  renderVisualChecklist();

  renderSatisfactionTable();

  renderInspectionTable();

  renderPartsTable();

  setupQuickSearch();

  setupHeroSearch();

  loadRecentJobsPills();

  setupPhotoDropzone();

  loadBOMOptions();

  loadReportsList();



  // Initialize Dynamic Form Package

  renderPackageTabs();

  if (state.packageInstances.length > 0 && state.activeInstanceId) {

    selectPackageInstance(state.activeInstanceId);

  } else {

    applyPackageViewMode();

  }



  // Set default service date to today

  const today = new Date().toISOString().split("T")[0];

  const dateInput = document.getElementById("sr_date");

  if (dateInput) dateInput.value = today;



  // Sync techSignerName with Top Banner

  const techInput = document.getElementById("techSignerName");

  if (techInput) {

    techInput.addEventListener("input", () => {

      const bannerTechEl = document.getElementById("bannerTech");

      if (bannerTechEl) {

        const val = techInput.value.trim();

        bannerTechEl.innerHTML = val ? `<span class="text-slate-800 font-bold">${val}</span>` : `<span class="text-amber-700 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">กรอกเอง</span>`;

      }

    });

  }

});



function initIcons() {

  if (window.lucide) {

    window.lucide.createIcons();

  }

}



// =============================================================================

// TAB NAVIGATION (TOP MODULE TABS)

// =============================================================================

function updateTopNavHighlight(type) {

  const btnReport = document.getElementById("nav-service-report");

  const btnPhoto = document.getElementById("nav-photo");

  const activeClasses = ["bg-white", "text-red-800", "font-semibold", "shadow-sm"];

  const inactiveClasses = ["text-red-100", "hover:bg-red-700/60"];



  if (type === "photo") {

    if (btnPhoto) {

      btnPhoto.classList.remove(...inactiveClasses);

      btnPhoto.classList.add(...activeClasses);

    }

    if (btnReport) {

      btnReport.classList.remove(...activeClasses);

      btnReport.classList.add(...inactiveClasses);

    }

  } else {

    if (btnReport) {

      btnReport.classList.remove(...inactiveClasses);

      btnReport.classList.add(...activeClasses);

    }

    if (btnPhoto) {

      btnPhoto.classList.remove(...activeClasses);

      btnPhoto.classList.add(...inactiveClasses);

    }

  }

}



function goToServiceReports() {

  switchTab("tab-service-report");

  // If active is PHOTO_REPORT, switch to a report form

  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  if (activeInst && activeInst.code === "PHOTO_REPORT") {

    const reportInst = state.packageInstances.find(i => i.code !== "PHOTO_REPORT");

    if (reportInst) {

      selectPackageInstance(reportInst.id);

    }

  } else if (!activeInst && state.packageInstances.length > 0) {

    selectPackageInstance(state.packageInstances[0].id);

  }

  updateTopNavHighlight("report");

}



function goToPhotoReport() {

  switchTab("tab-service-report");

  let photoInst = state.packageInstances.find(i => i.code === "PHOTO_REPORT");

  if (!photoInst) {

    addFormToPackage("PHOTO_REPORT");

  } else {

    selectPackageInstance(photoInst.id);

  }

  updateTopNavHighlight("photo");

}



function switchTab(tabId) {

  if (tabId === "tab-photo") {

    goToPhotoReport();

    return;

  }

  if (tabId === "tab-inspection") {

    selectPackageFormByCode("FM-EPS-31");

    return;

  }



  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));

  const target = document.getElementById(tabId);

  if (target) target.classList.remove("hidden");



  if (tabId === "tab-service-report") {

    resizeSignPads();

    renderPackageTabs();

    const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

    updateTopNavHighlight(activeInst?.code === "PHOTO_REPORT" ? "photo" : "report");

  }

  initIcons();

}



function toggleSection(secId) {

  const sec = document.getElementById(secId);

  const icon = document.getElementById(`${secId}-icon`);

  if (!sec) return;

  sec.classList.toggle("hidden");

  if (icon) {

    icon.classList.toggle("rotate-180");

  }

}



// =============================================================================

// DYNAMIC WORK ORDER PACKAGE & MULTI-FORM CONTROLLER

// =============================================================================

const FORM_DEFS = {
  "FM-EPS-21": {
    code: "FM-EPS-21",
    title: "ใบสรุปค่าใช้จ่ายงานบริการ (Service Expense)",
    shortTitle: "Service Expense",
    badgeBg: "bg-amber-600",
    icon: "receipt",
    panelId: "panel-FM-EPS-21"
  },

  "FM-EPS-23": {

    code: "FM-EPS-23",

    title: "รายงานการบริการ (Service Report)",

    shortTitle: "Service Report",

    badgeBg: "bg-red-600",

    icon: "clipboard-list",

    panelId: "panel-FM-EPS-23"

  },

  "FM-EPS-22": {

    code: "FM-EPS-22",

    title: "รายงานการตรวจสภาพเครื่องจักร (Check Report)",

    shortTitle: "Check Report",

    badgeBg: "bg-blue-600",

    icon: "check-circle-2",

    panelId: "panel-FM-EPS-22"

  },

  "FM-EPS-31": {

    code: "FM-EPS-31",

    title: "ตารางวัดขนาดสึกหรอชิ้นส่วน (Dimensional Inspection)",

    shortTitle: "Inspection",

    badgeBg: "bg-emerald-600",

    icon: "ruler",

    panelId: "panel-FM-EPS-31"

  },

  "FM-EPS-25": {

    code: "FM-EPS-25",

    title: "รายการเปลี่ยนชิ้นส่วน & เสนอราคา (Recommended Spare Parts)",

    shortTitle: "Spare Parts",

    badgeBg: "bg-amber-600",

    icon: "package",

    panelId: "panel-FM-EPS-25"

  },

  "PHOTO_REPORT": {

    code: "PHOTO_REPORT",

    title: "รายงานภาพถ่ายประกอบ (Service Photo Report)",

    shortTitle: "Photo Report",

    badgeBg: "bg-purple-600",

    icon: "camera",

    panelId: "panel-PHOTO_REPORT"

  },

  "FM-EPS-45": {

    code: "FM-EPS-45",

    title: "แบบประเมินความพึงพอใจลูกค้า (Customer Satisfaction)",

    shortTitle: "Satisfaction",

    badgeBg: "bg-rose-600",

    icon: "star",

    panelId: "panel-FM-EPS-45"

  }

};



function renderPackageTabs() {

  const container = document.getElementById("packageTabsContainer");

  const countBadge = document.getElementById("packageCountBadge");

  if (!container) return;



  if (countBadge) {

    countBadge.innerText = `${state.packageInstances.length} ใบงาน`;

  }



  // Update modal count badges

  Object.keys(FORM_DEFS).forEach(code => {

    const cnt = state.packageInstances.filter(i => i.code === code).length;

    const el = document.getElementById(`badge-count-${code}`);

    if (el) {

      if (cnt > 0) {

        el.innerText = `มีในชุดแล้ว ${cnt} ใบ`;

        el.className = "text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200";

      } else {

        el.innerText = "ยังไม่มีในชุด";

        el.className = "text-[11px] font-semibold text-slate-400";

      }

    }

  });



  if (state.packageInstances.length === 0) {

    container.innerHTML = `

      <div class="flex items-center space-x-2 py-1 text-xs">

        <span class="text-slate-400 italic">ยังไม่มีใบงานในรายงานนี้</span>

        <button type="button" onclick="openAddFormModal()" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer">

          <i data-lucide="plus-circle" class="w-4 h-4"></i>

          <span>+ เลือกใบงาน (Choose Form)</span>

        </button>

      </div>

    `;

    initIcons();

    return;

  }



  const html = state.packageInstances.map((inst, idx) => {

    const def = FORM_DEFS[inst.code] || { badgeBg: "bg-slate-600", icon: "file", shortTitle: inst.code };

    const isActive = inst.id === state.activeInstanceId;

    const sameCodeCount = state.packageInstances.filter(i => i.code === inst.code).length;

    const numTag = (sameCodeCount > 1 || inst.num > 1) ? ` #${inst.num || (idx + 1)}` : "";

    const customTag = inst.customLabel ? ` <span class="opacity-90 font-normal">(${inst.customLabel})</span>` : "";

    const canDelete = true;



    if (isActive) {

      return `

        <div onclick="selectPackageInstance('${inst.id}')" 

             class="group cursor-pointer bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm shadow-md ring-2 ring-red-400/80 flex items-center space-x-1.5 sm:space-x-2 transition transform hover:scale-[1.01] shrink-0 whitespace-nowrap">

          <i data-lucide="${def.icon}" class="w-4 h-4 text-yellow-300 shrink-0"></i>

          <span>${def.shortTitle}${numTag}</span>

          ${customTag}

          ${canDelete ? `

            <button type="button" onclick="event.stopPropagation(); removeFormFromPackage('${inst.id}')" title="ลบใบงานนี้" class="ml-1 p-1 rounded-full hover:bg-black/20 text-white/90 hover:text-white transition cursor-pointer">

              <i data-lucide="x" class="w-3.5 h-3.5"></i>

            </button>

          ` : ""}

        </div>

      `;

    } else {

      return `

        <div onclick="selectPackageInstance('${inst.id}')" 

             class="group cursor-pointer bg-slate-800 hover:bg-slate-700 hover:border-slate-600 text-slate-200 px-3 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm border border-slate-700/80 flex items-center space-x-1.5 sm:space-x-2 transition shrink-0 whitespace-nowrap">

          <span class="w-2 h-2 rounded-full ${def.badgeBg} shrink-0"></span>

          <i data-lucide="${def.icon}" class="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0"></i>

          <span class="font-medium">${def.shortTitle}${numTag}</span>

          ${customTag}

          ${canDelete ? `

            <button type="button" onclick="event.stopPropagation(); removeFormFromPackage('${inst.id}')" title="ลบใบงานนี้" class="ml-1 p-1 rounded-full hover:bg-red-500/30 text-slate-400 hover:text-red-300 transition opacity-70 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer">

              <i data-lucide="x" class="w-3 h-3"></i>

            </button>

          ` : ""}

        </div>

      `;

    }

  }).join("");



  container.innerHTML = html + `

    <button type="button" onclick="openAddFormModal()" title="เพิ่มใบงานใหม่" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-white transition flex items-center space-x-1 text-xs">

      <i data-lucide="plus" class="w-4 h-4"></i>

      <span class="hidden sm:inline">เพิ่มใบงาน</span>

    </button>

  `;



  initIcons();

}



function openAddFormModal() {

  const modal = document.getElementById("modalAddForm");

  if (!modal) return;

  modal.classList.remove("hidden");

  renderPackageTabs();

  initIcons();

}



function closeAddFormModal() {

  const modal = document.getElementById("modalAddForm");

  if (modal) modal.classList.add("hidden");

}



function addFormToPackage(code, customLabel = "") {

  const existing = state.packageInstances.filter(i => i.code === code);

  const num = existing.length + 1;

  const def = FORM_DEFS[code] || { title: code, shortTitle: code };

  const newId = "inst_" + Date.now() + "_" + Math.floor(Math.random() * 1000).toString();



  const custVal = document.getElementById("sr_customer")?.value?.trim() || (state.currentTicket?.Customer || state.currentTicket?.["Organization Name"] || "").trim() || "-";

  const plantVal = document.getElementById("sr_plant")?.value?.trim() || (state.currentTicket?.Site || state.currentTicket?.["Address or Site"] || "").trim() || "-";

  const contactVal = document.getElementById("sr_contact_person")?.value?.trim() || (state.currentTicket?.ContactPerson || state.currentTicket?.["Site Contact Person"] || "").trim() || "-";

  const telVal = document.getElementById("sr_contact_no")?.value?.trim() || (state.currentTicket?.ContactPhone || state.currentTicket?.["Site Contact Phone"] || "").trim() || "-";



  let initialData = null;

  const dateVal = document.getElementById("sr_date")?.value || new Date().toISOString().split("T")[0];

  const servDateVal = document.getElementById("sr_serviced_date")?.value || dateVal;

  const startVal = document.getElementById("sr_time_start")?.value || "";

  const finishVal = document.getElementById("sr_time_finished")?.value || "";



  if (code === "FM-EPS-22") {

    initialData = {

      cr_date: dateVal,

      date: dateVal,

      cr_serviced_date: servDateVal,

      serviced_date: servDateVal,

      cr_time_start: startVal,

      time_start: startVal,

      cr_time_finished: finishVal,

      time_finished: finishVal,

      pump_brand: num === 1 ? (state.currentTicket?.ProductCode || state.currentTicket?.PumpBrand || "VIKING") : "VIKING",

      pump_model: num === 1 ? (state.currentTicket?.PumpModel || "") : "",

      serial_no: num === 1 ? (state.currentTicket?.SerialNo || "") : ""

    };

  } else if (code === "FM-EPS-25") {

    initialData = {

      parts_customer: custVal,

      parts_plant: plantVal,

      parts_contact_person: contactVal,

      parts_contact_no: telVal,

      customer: custVal,

      plant: plantVal,

      contact_person: contactVal,

      contact_no: telVal,

      parts_sheet_date: dateVal

    };

  } else if (code === "PHOTO_REPORT") {

    initialData = {

      customer: custVal,

      plant: plantVal,

      job: "",

      date: formatIsoToDmy(dateVal),

      date_dmy: formatIsoToDmy(dateVal),

      pump_brand: num === 1 ? (state.currentTicket?.ProductCode || state.currentTicket?.PumpBrand || "") : "",

      model: num === 1 ? (state.currentTicket?.PumpModel || "") : "",

      serial_no: num === 1 ? (state.currentTicket?.SerialNo || "") : "",

      reported_by: "",

      recommended: "",

      photos: []

    };

  }



  const defaultLabel = (code === "PHOTO_REPORT")

    ? (num > 1 ? `ปั๊มตัวที่ ${num}` : (existing.length > 0 ? `ปั๊มตัวที่ ${num}` : "ปั๊มตัวที่ 1"))

    : (num > 1 ? `ชุดที่ ${num}` : "");



  const newInst = {

    id: newId,

    code: code,

    title: def.title,

    num: num,

    customLabel: customLabel || defaultLabel,

    data: initialData

  };



  state.packageInstances.push(newInst);

  closeAddFormModal();

  renderPackageTabs();

  selectPackageInstance(newId);

  showToast(`เพิ่มใบงาน ${def.shortTitle} ${newInst.customLabel ? '(' + newInst.customLabel + ')' : '#' + num} เรียบร้อยแล้ว`);

}



function removeFormFromPackage(instId) {

  const inst = state.packageInstances.find(i => i.id === instId);

  const def = FORM_DEFS[inst?.code] || { shortTitle: inst?.code || "ใบงาน" };

  const label = inst?.customLabel || (inst?.num > 1 ? `#${inst.num}` : def.shortTitle);



  if (!confirm(`ต้องการลบใบงาน "${def.shortTitle} ${label}" ออกจากรายงานนี้ใช่หรือไม่?`)) return;



  state.packageInstances = state.packageInstances.filter(i => i.id !== instId);

  if (state.activeInstanceId === instId) {

    state.activeInstanceId = state.packageInstances.length > 0 ? state.packageInstances[0].id : null;

  }

  renderPackageTabs();

  if (state.activeInstanceId) {

    selectPackageInstance(state.activeInstanceId);

  } else {

    applyPackageViewMode();

  }

  showToast("ลบใบงานออกจากชุดรายงานแล้ว");

}



function selectPackageInstance(instId) {

  if (!instId) {

    state.activeInstanceId = null;

    applyPackageViewMode();

    return;

  }



  // 1. Save data of current active instance

  saveCurrentActiveInstanceData();



  // 2. Set active instance

  state.activeInstanceId = instId;

  const inst = state.packageInstances.find(i => i.id === instId);

  if (!inst) {

    state.activeInstanceId = null;

    applyPackageViewMode();

    return;

  }



  const def = FORM_DEFS[inst.code] || { 

    badgeBg: "bg-red-600", 

    title: inst.code, 

    shortTitle: inst.code, 

    panelId: `panel-${inst.code}` 

  };



  // 3. Update Indicator Bar

  const badgeEl = document.getElementById("activeFormBadge");

  const titleEl = document.getElementById("activeFormTitle");

  const subEl = document.getElementById("activeFormSubtitle");

  const custLabelInput = document.getElementById("activeFormCustomLabel");



  if (badgeEl) {

    badgeEl.innerText = inst.code;

    badgeEl.className = `${def.badgeBg} text-white text-xs font-bold px-2 py-0.5 rounded`;

  }

  if (titleEl) titleEl.innerText = def.title;

  if (subEl) subEl.innerText = (inst.num > 1) ? `ชุดที่ ${inst.num}` : (inst.customLabel || "ใบที่ 1");

  if (custLabelInput) custLabelInput.value = inst.customLabel || "";



  // Quick Photo Add Button toggle

  const btnAddPhoto = document.getElementById("btnHeaderAddPhotoReport");

  if (btnAddPhoto) {

    if (inst.code === "PHOTO_REPORT") {

      btnAddPhoto.classList.remove("hidden");

    } else {

      btnAddPhoto.classList.add("hidden");

    }

  }



  // 4. Show/Hide Panels according to view mode

  applyPackageViewMode();



  // 5. Load instance data into DOM

  loadInstanceDataIntoDom(inst);



  // 6. Highlight active tab

  renderPackageTabs();



  // 7. If FM-EPS-23 or FM-EPS-22 (signatures enabled), resize pads

  if (inst.code === "FM-EPS-23" || inst.code === "FM-EPS-22") {

    resizeSignPads();

  }



  // 8. Sync Top Navbar highlight (Report vs Photo)

  updateTopNavHighlight(inst.code === "PHOTO_REPORT" ? "photo" : "report");

  initIcons();

}



function updateActiveFormCustomLabel(val) {

  const inst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  if (inst) {

    inst.customLabel = val.trim();

    const subEl = document.getElementById("activeFormSubtitle");

    if (subEl) subEl.innerText = inst.customLabel || (inst.num > 1 ? `ชุดที่ ${inst.num}` : "ใบที่ 1");

    renderPackageTabs();

  }

}



function togglePackageViewMode() {

  // Always enforce strict focused tab view

  state.packageViewMode = "tab";

  applyPackageViewMode();

}



function applyPackageViewMode() {

  const noFormEl = document.getElementById("noFormPlaceholder");

  const indicatorEl = document.getElementById("activeFormHeaderIndicator");



  // All known form panel IDs

  const ALL_PANEL_IDS = [
    "panel-FM-EPS-21",

    "panel-FM-EPS-23",

    "panel-FM-EPS-22",

    "panel-FM-EPS-31",

    "panel-FM-EPS-25",

    "panel-PHOTO_REPORT",

    "panel-FM-EPS-45"

  ];



  if (!state.packageInstances || state.packageInstances.length === 0) {

    ALL_PANEL_IDS.forEach(pid => {

      const p = document.getElementById(pid);

      if (p) {

        p.classList.add("hidden");

        p.style.display = "none";

      }

    });

    const sigPanel = document.getElementById("panel-signatures");

    if (sigPanel) {

      sigPanel.classList.add("hidden");

      sigPanel.style.display = "none";

    }

    if (indicatorEl) indicatorEl.classList.add("hidden");

    if (noFormEl) noFormEl.classList.remove("hidden");

    initIcons();

    return;

  }



  if (noFormEl) noFormEl.classList.add("hidden");

  if (indicatorEl) indicatorEl.classList.remove("hidden");



  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  if (!activeInst) {

    if (state.packageInstances.length > 0) {

      selectPackageInstance(state.packageInstances[0].id);

    }

    return;

  }



  // 1. Strictly hide ALL form panels both via CSS class and inline display: none

  ALL_PANEL_IDS.forEach(pid => {

    const p = document.getElementById(pid);

    if (p) {

      p.classList.add("hidden");

      p.style.display = "none";

    }

  });



  // 2. Reveal ONLY the active form panel

  const activePanelId = FORM_DEFS[activeInst.code]?.panelId || `panel-${activeInst.code}`;

  const targetPanel = document.getElementById(activePanelId);

  if (targetPanel) {

    targetPanel.classList.remove("hidden");

    targetPanel.style.display = "block";

  }



  // 3. Digital Signatures: Show when Service Report (FM-EPS-23) or Check Report (FM-EPS-22) is active

  const sigPanel = document.getElementById("panel-signatures");

  if (sigPanel) {

    if (activeInst.code === "FM-EPS-23" || activeInst.code === "FM-EPS-22" || activeInst.code === "FM-EPS-21") {

      sigPanel.classList.remove("hidden");

      sigPanel.style.display = "block";

    } else {

      sigPanel.classList.add("hidden");

      sigPanel.style.display = "none";

    }

  }



  initIcons();

}



function saveCurrentActiveInstanceData() {

  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  if (!activeInst) return;



  if (activeInst.code === "FM-EPS-21") {
    activeInst.data = {
      exp_request_no: document.getElementById("exp_request_no")?.value || "",
      exp_date: document.getElementById("exp_date")?.value || "",
      exp_customer: document.getElementById("exp_customer")?.value || "",
      exp_sales: document.getElementById("exp_sales")?.value || "",
      exp_group: document.getElementById("exp_group")?.value || "",
      exp_product: document.getElementById("exp_product")?.value || "",
      exp_io: document.getElementById("exp_io")?.value || "",
      exp_place: document.getElementById("exp_place")?.value || "",
      exp_contact: document.getElementById("exp_contact")?.value || "",
      exp_tel: document.getElementById("exp_tel")?.value || "",
      // Jobs
      exp_job_install: document.getElementById("exp_job_install")?.checked || false,
      exp_job_startup: document.getElementById("exp_job_startup")?.checked || false,
      exp_job_repair: document.getElementById("exp_job_repair")?.checked || false,
      exp_job_alignment: document.getElementById("exp_job_alignment")?.checked || false,
      exp_job_other1: document.getElementById("exp_job_other1")?.checked || false,
      exp_job_other1_text: document.getElementById("exp_job_other1_text")?.value || "",
      exp_job_other2: document.getElementById("exp_job_other2")?.checked || false,
      exp_job_other2_text: document.getElementById("exp_job_other2_text")?.value || "",
      exp_job_other3: document.getElementById("exp_job_other3")?.checked || false,
      exp_job_other3_text: document.getElementById("exp_job_other3_text")?.value || "",
      // Costs
      exp_cost_labor: document.getElementById("exp_cost_labor")?.checked || false,
      exp_amt_labor: document.getElementById("exp_amt_labor")?.value || "",
      exp_cost_toll: document.getElementById("exp_cost_toll")?.checked || false,
      exp_amt_toll: document.getElementById("exp_amt_toll")?.value || "",
      exp_cost_gas: document.getElementById("exp_cost_gas")?.checked || false,
      exp_amt_gas: document.getElementById("exp_amt_gas")?.value || "",
      exp_gas_distance: document.getElementById("exp_gas_distance")?.value || "",
      exp_cost_equip: document.getElementById("exp_cost_equip")?.checked || false,
      exp_amt_equip: document.getElementById("exp_amt_equip")?.value || "",
      exp_cost_allowance: document.getElementById("exp_cost_allowance")?.checked || false,
      exp_amt_allowance: document.getElementById("exp_amt_allowance")?.value || "",
      exp_cost_hotel: document.getElementById("exp_cost_hotel")?.checked || false,
      exp_amt_hotel: document.getElementById("exp_amt_hotel")?.value || "",
      exp_cost_other: document.getElementById("exp_cost_other")?.checked || false,
      exp_amt_other: document.getElementById("exp_amt_other")?.value || "",
      // Work summary
      exp_work_start: document.getElementById("exp_work_start")?.value || "",
      exp_work_end: document.getElementById("exp_work_end")?.value || "",
      exp_work_total: document.getElementById("exp_work_total")?.value || "",
      exp_travel_to_start: document.getElementById("exp_travel_to_start")?.value || "",
      exp_travel_to_end: document.getElementById("exp_travel_to_end")?.value || "",
      exp_travel_to_total: document.getElementById("exp_travel_to_total")?.value || "",
      exp_travel_back_start: document.getElementById("exp_travel_back_start")?.value || "",
      exp_travel_back_end: document.getElementById("exp_travel_back_end")?.value || "",
      exp_travel_back_total: document.getElementById("exp_travel_back_total")?.value || "",
      exp_distance: document.getElementById("exp_distance")?.value || "",
      exp_crew_tech: document.getElementById("exp_crew_tech")?.value || "",
      exp_crew_sr_tech: document.getElementById("exp_crew_sr_tech")?.value || "",
      exp_crew_eng: document.getElementById("exp_crew_eng")?.value || "",
      // Charge to
      exp_charge_sales: document.getElementById("exp_charge_sales")?.checked || false,
      exp_charge_sales_amt: document.getElementById("exp_charge_sales_amt")?.value || "",
      exp_charge_service: document.getElementById("exp_charge_service")?.checked || false,
      exp_charge_service_amt: document.getElementById("exp_charge_service_amt")?.value || "",
      exp_charge_company: document.getElementById("exp_charge_company")?.checked || false,
      exp_charge_company_amt: document.getElementById("exp_charge_company_amt")?.value || "",
      // Results
      exp_res_completed: document.getElementById("exp_res_completed")?.checked || false,
      exp_res_in_progress: document.getElementById("exp_res_in_progress")?.checked || false,
      exp_res_pending_approval: document.getElementById("exp_res_pending_approval")?.checked || false,
      exp_res_pending_parts: document.getElementById("exp_res_pending_parts")?.checked || false,
      exp_res_no_repair: document.getElementById("exp_res_no_repair")?.checked || false,
      // Fund from
      exp_fund_io_job: document.getElementById("exp_fund_io_job")?.checked || false,
      exp_fund_io_orderer: document.getElementById("exp_fund_io_orderer")?.checked || false,
      exp_fund_budget: document.getElementById("exp_fund_budget")?.checked || false,
      exp_fund_other: document.getElementById("exp_fund_other")?.checked || false,
      // Comments
      exp_comments: document.getElementById("exp_comments")?.value || "",
      // Signatures
      exp_tech_name: document.getElementById("exp_tech_name")?.value || "",
      exp_tech_date: document.getElementById("exp_tech_date")?.value || "",
      exp_sr_tech_name: document.getElementById("exp_sr_tech_name")?.value || "",
      exp_sr_tech_date: document.getElementById("exp_sr_tech_date")?.value || "",
      exp_sales_name: document.getElementById("exp_sales_name")?.value || "",
      exp_sales_date: document.getElementById("exp_sales_date")?.value || "",
      exp_mgr_name: document.getElementById("exp_mgr_name")?.value || "",
      exp_mgr_date: document.getElementById("exp_mgr_date")?.value || ""
    };
  } else if (activeInst.code === "FM-EPS-31") {

    const rows = (state.currentInspRows && state.currentInspRows.length > 0) ? state.currentInspRows : INSP_DEFAULT_ROWS;

    const measurements = rows.map((row, idx) => ({

      part_name: row.part,

      position: row.pos,

      std_in: row.std_in || "-",

      std_mm: row.std_mm || "-",

      std_min: row.min || (row.val_mm ? row.val_mm.toString() : "-"),

      std_max: row.max || (row.val_mm ? row.val_mm.toString() : "-"),

      cmp: row.cmp || "",

      val_mm: row.val_mm || null,

      val_in: row.val_in || null,

      in_a: document.getElementById(`insp_in_a_${idx}`)?.value || "-",

      in_b: document.getElementById(`insp_in_b_${idx}`)?.value || "-",

      final_a: document.getElementById(`insp_fi_a_${idx}`)?.value || "-",

      final_b: document.getElementById(`insp_fi_b_${idx}`)?.value || "-",

      result: document.getElementById(`insp_badge_${idx}`)?.innerText || "PASS",

      remark: document.getElementById(`insp_rem_${idx}`)?.value || ""

    }));



    const sheetBrand = document.getElementById("insp_sheet_brand")?.value?.trim() || 

                       document.getElementById("inspBrandCustomInput")?.value?.trim() || 

                       document.getElementById("inspBrandSelect")?.value || "VIKING";

    const brandSelect = document.getElementById("inspBrandSelect")?.value || "VIKING";

    const brandCustom = document.getElementById("inspBrandCustomInput")?.value?.trim() || "";

    const sheetModel = document.getElementById("insp_sheet_model")?.value?.trim() || "";

    const sheetSerial = document.getElementById("insp_sheet_serial")?.value?.trim() || "";

    const sheetCode = document.getElementById("insp_sheet_code")?.value?.trim() || "";

    const sheetDate = document.getElementById("insp_sheet_date")?.value?.trim() || "";

    const inspModelInput = document.getElementById("inspModelInput")?.value?.trim() || "";



    let mw = document.getElementById("insp_measuring_with")?.value || "Vernier Caliper";

    if (!mw || mw.includes("Bore Gauge")) mw = "Vernier Caliper";



    activeInst.data = {

      measurements: measurements,

      currentInspRows: state.currentInspRows,

      currentInspModel: state.currentInspModel,

      currentInspPIR: state.currentInspPIR,

      inspModelInput: inspModelInput,

      brand_select: brandSelect,

      brand_custom: brandCustom,

      measuring_with: mw,

      insp_sheet_date: sheetDate,

      date: sheetDate || formatIsoToDmy(document.getElementById("sr_date")?.value) || "",

      tech_incoming_name: document.getElementById("insp_tech_incoming")?.value || "",

      tech_final_name: document.getElementById("insp_tech_final")?.value || "",

      approve_incoming_name: document.getElementById("insp_approve_incoming")?.value || "",

      approve_final_name: document.getElementById("insp_approve_final")?.value || "",

      brand: sheetBrand,

      model: sheetModel || state.currentInspModel || inspModelInput || "",

      sheet_brand: sheetBrand,

      sheet_model: sheetModel,

      sheet_serial: sheetSerial,

      sheet_code: sheetCode,

      sheet_date: sheetDate

    };

    if (sheetModel) activeInst.data.pump_model = sheetModel;

    if (sheetSerial) activeInst.data.serial_no = sheetSerial;

    if (sheetCode) activeInst.data.pump_code = sheetCode;

    if (sheetBrand) activeInst.data.pump_brand = sheetBrand;



  } else if (activeInst.code === "FM-EPS-25") {

    const sheetModel = document.getElementById("parts_sheet_model")?.value?.trim() || "";

    const sheetSerial = document.getElementById("parts_sheet_serial")?.value?.trim() || "";

    const sheetCode = document.getElementById("parts_sheet_code")?.value?.trim() || "";

    const partsBrand = document.getElementById("partsBrandSelect")?.value || "VIKING";

    const partsBrandCustom = document.getElementById("partsBrandCustomInput")?.value?.trim() || "";

    const partsModelInput = document.getElementById("partsModelInput")?.value?.trim() || "";



    const partsJobNo = document.getElementById("parts_job_no")?.value?.trim() || "";

    const partsIoNo = document.getElementById("parts_io_no")?.value?.trim() || "";

    const partsCustomer = document.getElementById("parts_customer")?.value?.trim() || "";

    const partsPlant = document.getElementById("parts_plant")?.value?.trim() || "";

    const partsContactPerson = document.getElementById("parts_contact_person")?.value?.trim() || "";

    const partsContactNo = document.getElementById("parts_contact_no")?.value?.trim() || "";

    const partsSheetDate = document.getElementById("parts_sheet_date")?.value?.trim() || "";



    activeInst.data = {

      parts: JSON.parse(JSON.stringify(state.parts)),

      sale_name: document.getElementById("parts_sale_name")?.value || "",

      receiver_name: document.getElementById("parts_receiver_name")?.value || "",

      receive_date: document.getElementById("parts_receive_date")?.value || "",

      due_date: document.getElementById("parts_due_date")?.value || "",

      delivery_date: document.getElementById("parts_delivery_date")?.value || "",

      test_pump_note: document.getElementById("parts_test_pump_note")?.value || "",

      show_prices: document.getElementById("toggleShowPrices")?.checked || false,

      sheet_model: sheetModel,

      sheet_serial: sheetSerial,

      sheet_code: sheetCode,

      parts_brand: partsBrand,

      parts_brand_custom: partsBrandCustom,

      parts_model_input: partsModelInput,

      job_no: partsJobNo,

      io_no: partsIoNo,

      customer: partsCustomer,

      plant: partsPlant,

      contact_person: partsContactPerson,

      contact_no: partsContactNo,

      sheet_date: partsSheetDate,

      parts_job_no: partsJobNo,

      parts_io_no: partsIoNo,

      parts_customer: partsCustomer,

      parts_plant: partsPlant,

      parts_contact_person: partsContactPerson,

      parts_contact_no: partsContactNo,

      parts_sheet_date: partsSheetDate,

      bom_catalog: state.bomPartsCatalog,

      current_bom_model: state.currentBomModel,

      current_bom_diagram: state.currentBomDiagram

    };

    if (sheetModel) activeInst.data.pump_model = sheetModel;

    if (sheetSerial) activeInst.data.serial_no = sheetSerial;

    if (sheetCode) activeInst.data.pump_code = sheetCode;

    if (partsBrandCustom || partsBrand) activeInst.data.pump_brand = partsBrandCustom || partsBrand;



  } else if (activeInst.code === "FM-EPS-22") {

    const sheetModel = document.getElementById("cr_sheet_model")?.value?.trim() || "";

    const sheetSerial = document.getElementById("cr_sheet_serial")?.value?.trim() || "";

    const sheetCode = document.getElementById("cr_sheet_code")?.value?.trim() || "";

    const sheetBrand = document.getElementById("cr_pump_brand")?.value || "VIKING";

    const crDate = document.getElementById("cr_date")?.value || "";

    const crServDate = document.getElementById("cr_serviced_date")?.value || "";

    const crStart = document.getElementById("cr_time_start")?.value || "";

    const crFinish = document.getElementById("cr_time_finished")?.value || "";



    const prevData = activeInst.data || {};

    activeInst.data = {

      ...prevData,

      pump_brand: sheetBrand,

      pump_model: sheetModel,

      serial_no: sheetSerial,

      pump_code: sheetCode,

      cr_date: crDate,

      date: crDate || prevData.date || formatIsoToDmy(document.getElementById("sr_date")?.value) || "",

      cr_serviced_date: crServDate,

      serviced_date: crServDate || prevData.serviced_date || formatIsoToDmy(document.getElementById("sr_serviced_date")?.value) || "",

      cr_time_start: crStart,

      time_start: crStart || prevData.time_start || document.getElementById("sr_time_start")?.value || "",

      cr_time_finished: crFinish,

      time_finished: crFinish || prevData.time_finished || document.getElementById("sr_time_finished")?.value || "",

      motor_brand: document.getElementById("cr_motor_brand")?.value || "",

      motor_kw: document.getElementById("cr_motor_kw")?.value || "",

      motor_rpm: document.getElementById("cr_motor_rpm")?.value || "",

      motor_max_amp: document.getElementById("cr_motor_max_amp")?.value || "",

      gear_brand: document.getElementById("cr_gear_brand")?.value || "",

      gear_ratio: document.getElementById("cr_gear_ratio")?.value || "",

      gear_model: document.getElementById("cr_gear_model")?.value || "",

      gear_serial: document.getElementById("cr_gear_serial")?.value || "",

      recommendation: document.getElementById("cr_recommendation")?.value || "",

      sheet_model: sheetModel,

      sheet_serial: sheetSerial,

      sheet_code: sheetCode

    };

    if (sheetModel) activeInst.data.pump_model = sheetModel;

    if (sheetSerial) activeInst.data.serial_no = sheetSerial;

    if (sheetCode) activeInst.data.pump_code = sheetCode;

    if (sheetBrand) activeInst.data.pump_brand = sheetBrand;



  } else if (activeInst.code === "FM-EPS-23") {

    const sheetModel = document.getElementById("sr_pump_model")?.value?.trim() || "";

    const sheetSerial = document.getElementById("sr_serial_no")?.value?.trim() || "";

    const sheetCode = document.getElementById("sr_pump_code")?.value?.trim() || "";

    const sheetBrand = document.getElementById("sr_pump_brand")?.value || "VIKING";



    activeInst.data = {

      pump_brand: sheetBrand,

      pump_model: sheetModel,

      serial_no: sheetSerial,

      pump_code: sheetCode,

      motor_brand: document.getElementById("sr_motor_brand")?.value || "",

      motor_kw: document.getElementById("sr_motor_kw")?.value || "",

      motor_rpm: document.getElementById("sr_motor_rpm")?.value || "",

      motor_max_amp: document.getElementById("sr_motor_max_amp")?.value || "",

      gear_brand: document.getElementById("sr_gear_brand")?.value || "",

      gear_ratio: document.getElementById("sr_gear_ratio")?.value || "",

      gear_model: document.getElementById("sr_gear_model")?.value || "",

      gear_serial: document.getElementById("sr_gear_serial")?.value || "",

      cause: document.getElementById("sr_cause")?.value || "",

      repairing: document.getElementById("sr_repairing")?.value || "",

      subject_other: document.getElementById("sr_subject_other")?.value || "",

      problem_etc: document.getElementById("sr_problem_etc")?.value || "",

      test_run_detail: document.getElementById("sr_test_run_detail")?.value || "",

      sheet_model: sheetModel,

      sheet_serial: sheetSerial,

      sheet_code: sheetCode

    };

    if (sheetModel) activeInst.data.pump_model = sheetModel;

    if (sheetSerial) activeInst.data.serial_no = sheetSerial;

    if (sheetCode) activeInst.data.pump_code = sheetCode;

    if (sheetBrand) activeInst.data.pump_brand = sheetBrand;



  } else if (activeInst.code === "PHOTO_REPORT") {

    activeInst.data = {

      customer: document.getElementById("photo_customer")?.value.trim() || "",

      plant: document.getElementById("photo_plant")?.value.trim() || "",

      job: document.getElementById("photo_job")?.value.trim() || "",

      date: document.getElementById("photo_date")?.value.trim() || "",

      date_dmy: document.getElementById("photo_date")?.value.trim() || "",

      pump_brand: document.getElementById("photo_pump")?.value.trim() || "",

      model: document.getElementById("photo_model")?.value.trim() || "",

      serial_no: document.getElementById("photo_serial")?.value.trim() || "",

      reported_by: document.getElementById("photo_reported_by")?.value.trim() || "",

      recommended: document.getElementById("photo_recommended")?.value.trim() || "",

      photos: state.activePhotoReportPhotos ? JSON.parse(JSON.stringify(state.activePhotoReportPhotos)) : []

    };

    if (activeInst.data.pump_brand) activeInst.data.brand = activeInst.data.pump_brand;

    if (activeInst.data.model) activeInst.data.pump_model = activeInst.data.model;

  } else if (activeInst.code === "FM-EPS-45") {

    const ratings = {};

    let total = 0;

    ALL_SAT_ITEMS.forEach(it => {

      const checked = document.querySelector(`input[name="sat_${it.id}"]:checked`);

      const val = checked ? parseInt(checked.value, 10) : 4;

      ratings[it.id] = val;

      total += val;

    });

    activeInst.data = {

      sat_customer: document.getElementById("sat_customer")?.value || "",

      sat_contact_person: document.getElementById("sat_contact_person")?.value || "",

      sat_contact_no: document.getElementById("sat_contact_no")?.value || "",

      sat_eval_date: document.getElementById("sat_eval_date")?.value || "",

      ratings: ratings,

      total_score: total,

      max_score: 56,

      suggestions: document.getElementById("sat_suggestions")?.value || ""

    };

  }

}



function loadInstanceDataIntoDom(inst) {

  if (!inst) return;

  if (inst.code === "FM-EPS-21") {
    const d = inst.data || {};
    const defaultCust = document.getElementById("sr_customer")?.value?.trim() || (state.currentTicket?.Customer || state.currentTicket?.["Organization Name"] || "").trim() || "-";
    const defaultPlant = document.getElementById("sr_plant")?.value?.trim() || (state.currentTicket?.Site || state.currentTicket?.["Address or Site"] || "").trim() || "-";
    const defaultContact = document.getElementById("sr_contact_person")?.value?.trim() || (state.currentTicket?.ContactPerson || state.currentTicket?.["Site Contact Person"] || "").trim() || "-";
    const defaultTel = document.getElementById("sr_contact_no")?.value?.trim() || (state.currentTicket?.ContactPhone || state.currentTicket?.["Site Contact Phone"] || "").trim() || "-";
    const defaultReq = state.currentTicket?.TicketNo || document.getElementById("sr_request_no")?.value || "";
    const defaultSales = state.currentTicket?.Sales || state.currentTicket?.AssignedBy || "";
    const defaultIo = state.currentTicket?.SalesOrders || "";
    const defaultProd = document.getElementById("sr_pump_model")?.value || state.currentTicket?.PumpModel || state.currentTicket?.ProductCode || "";
    const defaultDate = document.getElementById("sr_date")?.value || new Date().toISOString().split("T")[0];
    const defaultTech = document.getElementById("techSignerName")?.value || "";

    if (document.getElementById("exp_request_no")) document.getElementById("exp_request_no").value = d.exp_request_no !== undefined ? d.exp_request_no : defaultReq;
    if (document.getElementById("exp_date")) document.getElementById("exp_date").value = d.exp_date !== undefined ? d.exp_date : defaultDate;
    if (document.getElementById("exp_customer")) document.getElementById("exp_customer").value = d.exp_customer !== undefined ? d.exp_customer : defaultCust;
    if (document.getElementById("exp_sales")) document.getElementById("exp_sales").value = d.exp_sales !== undefined ? d.exp_sales : defaultSales;
    if (document.getElementById("exp_group")) document.getElementById("exp_group").value = d.exp_group || "";
    if (document.getElementById("exp_product")) document.getElementById("exp_product").value = d.exp_product !== undefined ? d.exp_product : defaultProd;
    if (document.getElementById("exp_io")) document.getElementById("exp_io").value = d.exp_io !== undefined ? d.exp_io : defaultIo;
    if (document.getElementById("exp_place")) document.getElementById("exp_place").value = d.exp_place !== undefined ? d.exp_place : defaultPlant;
    if (document.getElementById("exp_contact")) document.getElementById("exp_contact").value = d.exp_contact !== undefined ? d.exp_contact : defaultContact;
    if (document.getElementById("exp_tel")) document.getElementById("exp_tel").value = d.exp_tel !== undefined ? d.exp_tel : defaultTel;

    // Jobs
    const jobKeys = ["exp_job_install", "exp_job_startup", "exp_job_repair", "exp_job_alignment", "exp_job_other1", "exp_job_other2", "exp_job_other3"];
    jobKeys.forEach(k => {
      const el = document.getElementById(k);
      if (el) el.checked = !!d[k];
    });
    ["exp_job_other1_text", "exp_job_other2_text", "exp_job_other3_text"].forEach(k => {
      const el = document.getElementById(k);
      if (el) el.value = d[k] || "";
    });

    // Costs
    const costPairs = [
      ["exp_cost_labor", "exp_amt_labor"],
      ["exp_cost_toll", "exp_amt_toll"],
      ["exp_cost_gas", "exp_amt_gas"],
      ["exp_cost_equip", "exp_amt_equip"],
      ["exp_cost_allowance", "exp_amt_allowance"],
      ["exp_cost_hotel", "exp_amt_hotel"],
      ["exp_cost_other", "exp_amt_other"]
    ];
    costPairs.forEach(([ck, ak]) => {
      const cel = document.getElementById(ck);
      const ael = document.getElementById(ak);
      if (cel) cel.checked = !!d[ck];
      if (ael) ael.value = d[ak] || "";
    });
    if (document.getElementById("exp_gas_distance")) document.getElementById("exp_gas_distance").value = d.exp_gas_distance || "";

    // Work summary
    const sumFields = [
      "exp_work_start", "exp_work_end", "exp_work_total",
      "exp_travel_to_start", "exp_travel_to_end", "exp_travel_to_total",
      "exp_travel_back_start", "exp_travel_back_end", "exp_travel_back_total",
      "exp_distance", "exp_crew_tech", "exp_crew_sr_tech", "exp_crew_eng"
    ];
    sumFields.forEach(k => {
      const el = document.getElementById(k);
      if (el) el.value = d[k] || "";
    });

    // Charge to
    [["exp_charge_sales", "exp_charge_sales_amt"], ["exp_charge_service", "exp_charge_service_amt"], ["exp_charge_company", "exp_charge_company_amt"]].forEach(([ck, ak]) => {
      const cel = document.getElementById(ck);
      const ael = document.getElementById(ak);
      if (cel) cel.checked = !!d[ck];
      if (ael) ael.value = d[ak] || "";
    });

    // Results
    ["exp_res_completed", "exp_res_in_progress", "exp_res_pending_approval", "exp_res_pending_parts", "exp_res_no_repair"].forEach(k => {
      const el = document.getElementById(k);
      if (el) el.checked = !!d[k];
    });

    // Fund from
    ["exp_fund_io_job", "exp_fund_io_orderer", "exp_fund_budget", "exp_fund_other"].forEach(k => {
      const el = document.getElementById(k);
      if (el) el.checked = !!d[k];
    });

    if (document.getElementById("exp_comments")) document.getElementById("exp_comments").value = d.exp_comments || "";

    // Signatures
    if (document.getElementById("exp_tech_name")) document.getElementById("exp_tech_name").value = d.exp_tech_name !== undefined ? d.exp_tech_name : defaultTech;
    if (document.getElementById("exp_tech_date")) document.getElementById("exp_tech_date").value = d.exp_tech_date !== undefined ? d.exp_tech_date : defaultDate;
    if (document.getElementById("exp_sr_tech_name")) document.getElementById("exp_sr_tech_name").value = d.exp_sr_tech_name || "";
    if (document.getElementById("exp_sr_tech_date")) document.getElementById("exp_sr_tech_date").value = d.exp_sr_tech_date !== undefined ? d.exp_sr_tech_date : defaultDate;
    if (document.getElementById("exp_sales_name")) document.getElementById("exp_sales_name").value = d.exp_sales_name !== undefined ? d.exp_sales_name : defaultSales;
    if (document.getElementById("exp_sales_date")) document.getElementById("exp_sales_date").value = d.exp_sales_date !== undefined ? d.exp_sales_date : defaultDate;
    if (document.getElementById("exp_mgr_name")) document.getElementById("exp_mgr_name").value = d.exp_mgr_name || "";
    if (document.getElementById("exp_mgr_date")) document.getElementById("exp_mgr_date").value = d.exp_mgr_date !== undefined ? d.exp_mgr_date : defaultDate;
  } else 


  if (inst.code === "FM-EPS-31") {

    const sheetBrandInput = document.getElementById("insp_sheet_brand");

    const sheetModelInput = document.getElementById("insp_sheet_model");

    const sheetSerialInput = document.getElementById("insp_sheet_serial");

    const sheetCodeInput = document.getElementById("insp_sheet_code");

    const sheetDateInput = document.getElementById("insp_sheet_date");

    if (sheetBrandInput) sheetBrandInput.value = inst.data?.sheet_brand || inst.data?.pump_brand || inst.data?.brand || "";

    if (sheetModelInput) sheetModelInput.value = inst.data?.sheet_model || inst.data?.pump_model || "";

    if (sheetSerialInput) sheetSerialInput.value = inst.data?.sheet_serial || inst.data?.serial_no || "";

    if (sheetCodeInput) sheetCodeInput.value = inst.data?.sheet_code || inst.data?.pump_code || "";

    if (sheetDateInput) {

      sheetDateInput.value = inst.data?.insp_sheet_date || inst.data?.sheet_date || inst.data?.date || formatIsoToDmy(document.getElementById("sr_date")?.value) || "";

    }



    const brandSelect = document.getElementById("inspBrandSelect");

    const brandCustomInput = document.getElementById("inspBrandCustomInput");

    if (inst.data && inst.data.brand_select) {

      if (brandSelect) brandSelect.value = inst.data.brand_select;

      if (brandCustomInput) brandCustomInput.value = inst.data.brand_custom || "";

      onBrandChange();

    } else if (inst.data && inst.data.brand) {

      const bUpper = inst.data.brand.toUpperCase();

      if (["VIKING", "GOULDS"].includes(bUpper)) {

        if (brandSelect) brandSelect.value = bUpper;

      } else {

        if (brandSelect) brandSelect.value = "OTHER";

        if (brandCustomInput) brandCustomInput.value = inst.data.brand;

      }

      onBrandChange();

    }



    if (inst.data && inst.data.currentInspRows && inst.data.currentInspRows.length > 0) {

      state.currentInspRows = inst.data.currentInspRows;

      state.currentInspModel = inst.data.currentInspModel || "";

      state.currentInspPIR = inst.data.currentInspPIR || "";

    } else if (inst.data && inst.data.measurements && inst.data.measurements.length > 0) {

      state.currentInspRows = inst.data.measurements.map(m => ({

        part: m.part_name,

        pos: m.position,

        std_in: m.std_in || "-",

        std_mm: m.std_mm || (m.std_min ? `${m.std_min} - ${m.std_max}` : "-"),

        cmp: m.cmp || "",

        val_mm: m.val_mm || (parseFloat(m.std_min) || null),

        val_in: m.val_in || null,

        remark: m.remark || ""

      }));

      state.currentInspModel = inst.data.model || "";

      state.currentInspPIR = inst.data.currentInspPIR || "";

    } else {

      state.currentInspRows = [];

      state.currentInspModel = "";

      state.currentInspPIR = "";

    }



    const modelInput = document.getElementById("inspModelInput");

    if (modelInput) modelInput.value = inst.data?.inspModelInput || state.currentInspModel || "";



    const lblModel = document.getElementById("lblActiveInspModel");

    const lblPIR = document.getElementById("lblActiveInspPIR");

    if (lblModel) lblModel.innerText = state.currentInspModel || "-";

    if (lblPIR) lblPIR.innerText = state.currentInspPIR || "-";



    renderInspectionTable();



    if (inst.data && inst.data.measurements) {

      inst.data.measurements.forEach((row, idx) => {

        const inA = document.getElementById(`insp_in_a_${idx}`);

        const inB = document.getElementById(`insp_in_b_${idx}`);

        const fiA = document.getElementById(`insp_fi_a_${idx}`);

        const fiB = document.getElementById(`insp_fi_b_${idx}`);

        const rem = document.getElementById(`insp_rem_${idx}`);

        if (inA) inA.value = (row.in_a !== undefined && row.in_a !== "") ? row.in_a : "-";

        if (inB) inB.value = (row.in_b !== undefined && row.in_b !== "") ? row.in_b : "-";

        if (fiA) fiA.value = (row.final_a !== undefined && row.final_a !== "") ? row.final_a : "-";

        if (fiB) fiB.value = (row.final_b !== undefined && row.final_b !== "") ? row.final_b : "-";

        if (rem) rem.value = row.remark || "";

        evaluateInspectionRow(idx);

      });

      const el = document.getElementById("insp_measuring_with");

      if (el) {

        let mw = inst.data?.measuring_with || "Vernier Caliper";

        if (mw.includes("Bore Gauge")) mw = "Vernier Caliper";

        el.value = mw;

      }

      if (inst.data.tech_incoming_name) {

        const el = document.getElementById("insp_tech_incoming");

        if (el) el.value = inst.data.tech_incoming_name;

      }

      if (inst.data.tech_final_name) {

        const el = document.getElementById("insp_tech_final");

        if (el) el.value = inst.data.tech_final_name;

      }

      if (inst.data.approve_incoming_name) {

        const el = document.getElementById("insp_approve_incoming");

        if (el) el.value = inst.data.approve_incoming_name;

      }

      if (inst.data.approve_final_name) {

        const el = document.getElementById("insp_approve_final");

        if (el) el.value = inst.data.approve_final_name;

      }

    } else {

      // Clean inputs for fresh instance - default to '-' as requested by technician

      const mwEl = document.getElementById("insp_measuring_with");

      if (mwEl) mwEl.value = "Vernier Caliper";

      if (sheetDateInput && !sheetDateInput.value) {

        sheetDateInput.value = formatIsoToDmy(document.getElementById("sr_date")?.value) || "";

      }

      const rows = (state.currentInspRows && state.currentInspRows.length > 0) ? state.currentInspRows : INSP_DEFAULT_ROWS;

      rows.forEach((_, idx) => {

        const inA = document.getElementById(`insp_in_a_${idx}`);

        const inB = document.getElementById(`insp_in_b_${idx}`);

        const fiA = document.getElementById(`insp_fi_a_${idx}`);

        const fiB = document.getElementById(`insp_fi_b_${idx}`);

        const rem = document.getElementById(`insp_rem_${idx}`);

        if (inA) inA.value = "-";

        if (inB) inB.value = "-";

        if (fiA) fiA.value = "-";

        if (fiB) fiB.value = "-";

        if (rem) rem.value = "";

        evaluateInspectionRow(idx);

      });

    }

  } else if (inst.code === "FM-EPS-25") {

    const sheetModelInput = document.getElementById("parts_sheet_model");

    const sheetSerialInput = document.getElementById("parts_sheet_serial");

    const sheetCodeInput = document.getElementById("parts_sheet_code");

    if (sheetModelInput) sheetModelInput.value = inst.data?.sheet_model || inst.data?.pump_model || "";

    if (sheetSerialInput) sheetSerialInput.value = inst.data?.sheet_serial || inst.data?.serial_no || "";

    if (sheetCodeInput) sheetCodeInput.value = inst.data?.sheet_code || inst.data?.pump_code || "";



    const jobInput = document.getElementById("parts_job_no");

    const ioInput = document.getElementById("parts_io_no");

    const custInput = document.getElementById("parts_customer");

    const plantInput = document.getElementById("parts_plant");

    const contactInput = document.getElementById("parts_contact_person");

    const telInput = document.getElementById("parts_contact_no");

    const dateInput = document.getElementById("parts_sheet_date");



    const ticketCust = state.currentTicket?.Customer || state.currentTicket?.["Organization Name"] || "";

    const ticketPlant = state.currentTicket?.Site || state.currentTicket?.["Address or Site"] || "";

    const ticketContact = state.currentTicket?.ContactPerson || state.currentTicket?.["Site Contact Person"] || "";

    const ticketTel = state.currentTicket?.ContactPhone || state.currentTicket?.["Site Contact Phone"] || "";



    const defaultCust = document.getElementById("sr_customer")?.value?.trim() || ticketCust.trim() || "-";

    const defaultPlant = document.getElementById("sr_plant")?.value?.trim() || ticketPlant.trim() || "-";

    const defaultContact = document.getElementById("sr_contact_person")?.value?.trim() || ticketContact.trim() || "-";

    const defaultTel = document.getElementById("sr_contact_no")?.value?.trim() || ticketTel.trim() || "-";



    const savedCust = inst.data?.parts_customer ?? inst.data?.customer;

    const savedPlant = inst.data?.parts_plant ?? inst.data?.plant;

    const savedContact = inst.data?.parts_contact_person ?? inst.data?.contact_person;

    const savedTel = inst.data?.parts_contact_no ?? inst.data?.contact_no;



    if (jobInput) jobInput.value = inst.data?.parts_job_no || inst.data?.job_no || "";

    if (ioInput) ioInput.value = inst.data?.parts_io_no || inst.data?.io_no || "";

    if (custInput) custInput.value = (savedCust !== undefined && savedCust !== "" ? savedCust : defaultCust);

    if (plantInput) plantInput.value = (savedPlant !== undefined && savedPlant !== "" ? savedPlant : defaultPlant);

    if (contactInput) contactInput.value = (savedContact !== undefined && savedContact !== "" ? savedContact : defaultContact);

    if (telInput) telInput.value = (savedTel !== undefined && savedTel !== "" ? savedTel : defaultTel);

    if (dateInput) dateInput.value = inst.data?.parts_sheet_date || inst.data?.sheet_date || inst.data?.date || document.getElementById("sr_date")?.value || "";



    const brandSelect = document.getElementById("partsBrandSelect");

    const customInput = document.getElementById("partsBrandCustomInput");

    const modelInput = document.getElementById("partsModelInput");



    if (inst.data && inst.data.parts_brand) {

      if (brandSelect) brandSelect.value = inst.data.parts_brand;

      if (customInput) customInput.value = inst.data.parts_brand_custom || "";

      if (modelInput) modelInput.value = inst.data.parts_model_input || inst.data.sheet_model || "";

      onPartsBrandChange();

    } else {

      if (brandSelect) brandSelect.value = "VIKING";

      if (modelInput && !modelInput.value && sheetModelInput && sheetModelInput.value) {

        modelInput.value = sheetModelInput.value;

      }

      onPartsBrandChange();

    }



    if (inst.data && inst.data.bom_catalog && inst.data.bom_catalog.length > 0) {

      state.bomPartsCatalog = inst.data.bom_catalog;

      state.currentBomModel = inst.data.current_bom_model || "";

      state.currentBomDiagram = inst.data.current_bom_diagram || "";



      const card = document.getElementById("bomPartsCatalogCard");

      if (card) card.classList.remove("hidden");

      const titleEl = document.getElementById("lblBomCatalogTitle");

      if (titleEl) titleEl.innerText = `${brandSelect?.value || 'VIKING'} ${state.currentBomModel}`;

      const countEl = document.getElementById("lblBomPartsCountBadge");

      if (countEl) countEl.innerText = `${state.bomPartsCatalog.length} รายการ`;

      const btnDiag = document.getElementById("btnToggleBomDiagram");

      if (btnDiag) {

        if (state.currentBomDiagram) btnDiag.classList.remove("hidden");

        else btnDiag.classList.add("hidden");

      }

      renderBomPartsTable();

    } else {

      closeBomCatalogCard();

    }



    if (inst.data && inst.data.parts) {

      state.parts = JSON.parse(JSON.stringify(inst.data.parts));

      renderPartsTable();

      if (inst.data.sale_name) document.getElementById("parts_sale_name").value = inst.data.sale_name;

      if (inst.data.receiver_name) document.getElementById("parts_receiver_name").value = inst.data.receiver_name;

      if (inst.data.receive_date) document.getElementById("parts_receive_date").value = inst.data.receive_date;

      if (inst.data.due_date) document.getElementById("parts_due_date").value = inst.data.due_date;

      if (inst.data.delivery_date) document.getElementById("parts_delivery_date").value = inst.data.delivery_date;

      if (inst.data.test_pump_note) document.getElementById("parts_test_pump_note").value = inst.data.test_pump_note;

      if (document.getElementById("toggleShowPrices") && inst.data.show_prices !== undefined) {

        document.getElementById("toggleShowPrices").checked = inst.data.show_prices;

      }

    } else {

      if (!inst.data) {

        state.parts = [];

        renderPartsTable();

      }

    }

  } else if (inst.code === "FM-EPS-22") {

    const sheetModelInput = document.getElementById("cr_sheet_model");

    const sheetSerialInput = document.getElementById("cr_sheet_serial");

    const sheetCodeInput = document.getElementById("cr_sheet_code");

    const sheetBrandInput = document.getElementById("cr_pump_brand");

    const motorBrandInput = document.getElementById("cr_motor_brand");

    const motorKwInput = document.getElementById("cr_motor_kw");

    const motorRpmInput = document.getElementById("cr_motor_rpm");

    const motorAmpInput = document.getElementById("cr_motor_max_amp");

    const gearBrandInput = document.getElementById("cr_gear_brand");

    const gearRatioInput = document.getElementById("cr_gear_ratio");

    const gearModelInput = document.getElementById("cr_gear_model");

    const gearSerialInput = document.getElementById("cr_gear_serial");

    const crDateInput = document.getElementById("cr_date");

    const crServDateInput = document.getElementById("cr_serviced_date");

    const crStartInput = document.getElementById("cr_time_start");

    const crFinishInput = document.getElementById("cr_time_finished");



    const defaultCrDate = document.getElementById("sr_date")?.value || new Date().toISOString().split("T")[0];

    const defaultCrServDate = document.getElementById("sr_serviced_date")?.value || defaultCrDate;

    const defaultCrStart = document.getElementById("sr_time_start")?.value || "";

    const defaultCrFinish = document.getElementById("sr_time_finished")?.value || "";



    if (crDateInput) crDateInput.value = inst.data?.cr_date || inst.data?.date || defaultCrDate;

    if (crServDateInput) crServDateInput.value = inst.data?.cr_serviced_date || inst.data?.serviced_date || defaultCrServDate;

    if (crStartInput) crStartInput.value = inst.data?.cr_time_start || inst.data?.time_start || defaultCrStart;

    if (crFinishInput) crFinishInput.value = inst.data?.cr_time_finished || inst.data?.time_finished || defaultCrFinish;



    if (inst.data) {

      if (sheetBrandInput) sheetBrandInput.value = inst.data.pump_brand || "VIKING";

      if (sheetModelInput) sheetModelInput.value = inst.data.sheet_model || inst.data.pump_model || "";

      if (sheetSerialInput) sheetSerialInput.value = inst.data.sheet_serial || inst.data.serial_no || "";

      if (sheetCodeInput) sheetCodeInput.value = inst.data.sheet_code || inst.data.pump_code || "";

      if (motorBrandInput) motorBrandInput.value = inst.data.motor_brand || "";

      if (motorKwInput) motorKwInput.value = inst.data.motor_kw || "";

      if (motorRpmInput) motorRpmInput.value = inst.data.motor_rpm || "";

      if (motorAmpInput) motorAmpInput.value = inst.data.motor_max_amp || "";

      if (gearBrandInput) gearBrandInput.value = inst.data.gear_brand || "";

      if (gearRatioInput) gearRatioInput.value = inst.data.gear_ratio || "";

      if (gearModelInput) gearModelInput.value = inst.data.gear_model || "";

      if (gearSerialInput) gearSerialInput.value = inst.data.gear_serial || "";

      if (document.getElementById("cr_recommendation")) {

        document.getElementById("cr_recommendation").value = inst.data.recommendation || "";

      }

    } else {

      if (sheetBrandInput) sheetBrandInput.value = "VIKING";

      if (sheetModelInput) sheetModelInput.value = "";

      if (sheetSerialInput) sheetSerialInput.value = "";

      if (sheetCodeInput) sheetCodeInput.value = "";

      if (motorBrandInput) motorBrandInput.value = "";

      if (motorKwInput) motorKwInput.value = "";

      if (motorRpmInput) motorRpmInput.value = "";

      if (motorAmpInput) motorAmpInput.value = "";

      if (gearBrandInput) gearBrandInput.value = "";

      if (gearRatioInput) gearRatioInput.value = "";

      if (gearModelInput) gearModelInput.value = "";

      if (gearSerialInput) gearSerialInput.value = "";

      if (document.getElementById("cr_recommendation")) document.getElementById("cr_recommendation").value = "";

    }

  } else if (inst.code === "FM-EPS-23") {

    if (inst.data) {

      if (inst.data.pump_brand !== undefined && document.getElementById("sr_pump_brand")) document.getElementById("sr_pump_brand").value = inst.data.pump_brand;

      if (inst.data.pump_model !== undefined && document.getElementById("sr_pump_model")) document.getElementById("sr_pump_model").value = inst.data.pump_model;

      if (inst.data.serial_no !== undefined && document.getElementById("sr_serial_no")) document.getElementById("sr_serial_no").value = inst.data.serial_no;

      if (inst.data.pump_code !== undefined && document.getElementById("sr_pump_code")) document.getElementById("sr_pump_code").value = inst.data.pump_code;

      if (inst.data.motor_brand !== undefined && document.getElementById("sr_motor_brand")) document.getElementById("sr_motor_brand").value = inst.data.motor_brand;

      if (inst.data.motor_kw !== undefined && document.getElementById("sr_motor_kw")) document.getElementById("sr_motor_kw").value = inst.data.motor_kw;

      if (inst.data.motor_rpm !== undefined && document.getElementById("sr_motor_rpm")) document.getElementById("sr_motor_rpm").value = inst.data.motor_rpm;

      if (inst.data.motor_max_amp !== undefined && document.getElementById("sr_motor_max_amp")) document.getElementById("sr_motor_max_amp").value = inst.data.motor_max_amp;

      if (inst.data.gear_brand !== undefined && document.getElementById("sr_gear_brand")) document.getElementById("sr_gear_brand").value = inst.data.gear_brand;

      if (inst.data.gear_ratio !== undefined && document.getElementById("sr_gear_ratio")) document.getElementById("sr_gear_ratio").value = inst.data.gear_ratio;

      if (inst.data.gear_model !== undefined && document.getElementById("sr_gear_model")) document.getElementById("sr_gear_model").value = inst.data.gear_model;

      if (inst.data.gear_serial !== undefined && document.getElementById("sr_gear_serial")) document.getElementById("sr_gear_serial").value = inst.data.gear_serial;

      if (inst.data.cause !== undefined && document.getElementById("sr_cause")) document.getElementById("sr_cause").value = inst.data.cause;

      if (inst.data.repairing !== undefined && document.getElementById("sr_repairing")) document.getElementById("sr_repairing").value = inst.data.repairing;

      if (inst.data.subject_other !== undefined && document.getElementById("sr_subject_other")) document.getElementById("sr_subject_other").value = inst.data.subject_other;

      if (inst.data.problem_etc !== undefined && document.getElementById("sr_problem_etc")) document.getElementById("sr_problem_etc").value = inst.data.problem_etc;

      if (inst.data.test_run_detail !== undefined && document.getElementById("sr_test_run_detail")) document.getElementById("sr_test_run_detail").value = inst.data.test_run_detail;

    } else {

      if (document.getElementById("sr_pump_model")) document.getElementById("sr_pump_model").value = "";

      if (document.getElementById("sr_serial_no")) document.getElementById("sr_serial_no").value = "";

      if (document.getElementById("sr_pump_code")) document.getElementById("sr_pump_code").value = "";

    }

  } else if (inst.code === "PHOTO_REPORT") {

    const d = inst.data || {};

    const defaultCust = document.getElementById("sr_customer")?.value?.trim() || (state.currentTicket?.Customer || "").trim() || "-";

    const defaultPlant = document.getElementById("sr_plant")?.value?.trim() || (state.currentTicket?.Site || "").trim() || "-";

    const nowD = new Date();

    const dd = String(nowD.getDate()).padStart(2, "0");

    const mm = String(nowD.getMonth() + 1).padStart(2, "0");

    const yyyy = nowD.getFullYear();

    const defaultDate = `${dd}/${mm}/${yyyy}`;



    if (document.getElementById("photo_customer")) {

      document.getElementById("photo_customer").value = d.customer !== undefined ? d.customer : defaultCust;

    }

    if (document.getElementById("photo_plant")) {

      document.getElementById("photo_plant").value = d.plant !== undefined ? d.plant : defaultPlant;

    }

    if (document.getElementById("photo_job")) {

      document.getElementById("photo_job").value = d.job || "";

    }

    if (document.getElementById("photo_date")) {

      document.getElementById("photo_date").value = d.date || d.date_dmy || defaultDate;

    }

    if (document.getElementById("photo_pump")) {

      document.getElementById("photo_pump").value = d.pump_brand || "";

    }

    if (document.getElementById("photo_model")) {

      document.getElementById("photo_model").value = d.model || "";

    }

    if (document.getElementById("photo_serial")) {

      document.getElementById("photo_serial").value = d.serial_no || "";

    }

    if (document.getElementById("photo_reported_by")) {

      document.getElementById("photo_reported_by").value = d.reported_by || "";

    }

    if (document.getElementById("photo_recommended")) {

      document.getElementById("photo_recommended").value = d.recommended || "";

    }



    const titleDisp = document.getElementById("currentCoverTitleDisplay");

    const labelText = inst.customLabel || (inst.num > 1 ? `ปั๊มตัวที่ ${inst.num}` : "ปั๊มตัวที่ 1");

    if (titleDisp) titleDisp.innerText = labelText;

    const upDisp = document.getElementById("uploadCoverTargetDisplay");

    if (upDisp) upDisp.innerText = labelText;



    // Load photos for this specific instance

    state.activePhotoReportPhotos = d.photos ? JSON.parse(JSON.stringify(d.photos)) : [];

    renderPhotoGallery();

  } else if (inst.code === "FM-EPS-45") {

    const d = inst.data || {};

    const defaultCust = document.getElementById("sr_customer")?.value?.trim() || (state.currentTicket?.Customer || "").trim() || "-";

    const defaultContact = document.getElementById("sr_contact_person")?.value?.trim() || (state.currentTicket?.ContactPerson || "").trim() || "-";

    const defaultTel = document.getElementById("sr_contact_no")?.value?.trim() || (state.currentTicket?.ContactPhone || "").trim() || "-";

    const defaultDate = document.getElementById("sr_date")?.value || "";



    if (document.getElementById("sat_customer")) {

      document.getElementById("sat_customer").value = d.sat_customer || d.customer || defaultCust;

    }

    if (document.getElementById("sat_contact_person")) {

      document.getElementById("sat_contact_person").value = d.sat_contact_person || d.contact_person || defaultContact;

    }

    if (document.getElementById("sat_contact_no")) {

      document.getElementById("sat_contact_no").value = d.sat_contact_no || d.contact_no || defaultTel;

    }

    if (document.getElementById("sat_eval_date")) {

      document.getElementById("sat_eval_date").value = d.sat_eval_date || d.eval_date || defaultDate;

    }

    if (document.getElementById("sat_suggestions")) {

      document.getElementById("sat_suggestions").value = d.suggestions !== undefined ? d.suggestions : "";

    }

    if (d.ratings) {

      Object.keys(d.ratings).forEach(id => {

        const val = d.ratings[id];

        const rad = document.querySelector(`input[name="sat_${id}"][value="${val}"]`);

        if (rad) rad.checked = true;

      });

    }

    updateTotalSatScore();

  }

}



function syncDateTimeFromServiceReport() {

  const srDate = document.getElementById("sr_date")?.value || "";

  const srServDate = document.getElementById("sr_serviced_date")?.value || srDate;

  const srStart = document.getElementById("sr_time_start")?.value || "";

  const srFinish = document.getElementById("sr_time_finished")?.value || "";



  if (document.getElementById("cr_date")) document.getElementById("cr_date").value = srDate;

  if (document.getElementById("cr_serviced_date")) document.getElementById("cr_serviced_date").value = srServDate;

  if (document.getElementById("cr_time_start")) document.getElementById("cr_time_start").value = srStart;

  if (document.getElementById("cr_time_finished")) document.getElementById("cr_time_finished").value = srFinish;

  saveCurrentActiveInstanceData();

  showToast("คัดลอกวันที่และเวลาจาก Service Report เรียบร้อยแล้ว", "success");

}



function copyEquipmentFromServiceReport(targetFormCode) {

  const srInst = state.packageInstances.find(i => i.code === "FM-EPS-23");

  const srData = srInst?.data || {};



  const brand = srData.pump_brand || document.getElementById("sr_pump_brand")?.value || "VIKING";

  const model = srData.pump_model || document.getElementById("sr_pump_model")?.value || "";

  const serial = srData.serial_no || document.getElementById("sr_serial_no")?.value || "";

  const code = srData.pump_code || document.getElementById("sr_pump_code")?.value || "";

  const mBrand = srData.motor_brand || document.getElementById("sr_motor_brand")?.value || "";

  const mKw = srData.motor_kw || document.getElementById("sr_motor_kw")?.value || "";

  const mRpm = srData.motor_rpm || document.getElementById("sr_motor_rpm")?.value || "";

  const mAmp = srData.motor_max_amp || document.getElementById("sr_motor_max_amp")?.value || "";

  const gBrand = srData.gear_brand || document.getElementById("sr_gear_brand")?.value || "";

  const gRatio = srData.gear_ratio || document.getElementById("sr_gear_ratio")?.value || "";

  const gModel = srData.gear_model || document.getElementById("sr_gear_model")?.value || "";

  const gSerial = srData.gear_serial || document.getElementById("sr_gear_serial")?.value || "";



  if (targetFormCode === "FM-EPS-22") {

    if (document.getElementById("cr_pump_brand")) document.getElementById("cr_pump_brand").value = brand;

    if (document.getElementById("cr_sheet_model")) document.getElementById("cr_sheet_model").value = model;

    if (document.getElementById("cr_sheet_serial")) document.getElementById("cr_sheet_serial").value = serial;

    if (document.getElementById("cr_sheet_code")) document.getElementById("cr_sheet_code").value = code;

    if (document.getElementById("cr_motor_brand")) document.getElementById("cr_motor_brand").value = mBrand;

    if (document.getElementById("cr_motor_kw")) document.getElementById("cr_motor_kw").value = mKw;

    if (document.getElementById("cr_motor_rpm")) document.getElementById("cr_motor_rpm").value = mRpm;

    if (document.getElementById("cr_motor_max_amp")) document.getElementById("cr_motor_max_amp").value = mAmp;

    if (document.getElementById("cr_gear_brand")) document.getElementById("cr_gear_brand").value = gBrand;

    if (document.getElementById("cr_gear_ratio")) document.getElementById("cr_gear_ratio").value = gRatio;

    if (document.getElementById("cr_gear_model")) document.getElementById("cr_gear_model").value = gModel;

    if (document.getElementById("cr_gear_serial")) document.getElementById("cr_gear_serial").value = gSerial;



    showToast("คัดลอกข้อมูล ปั๊ม, มอเตอร์ และเกียร์ จาก Service Report เรียบร้อยแล้ว");

  }

}



function loadPackagePreset(presetName) {

  if (presetName === "all") {

    const allCodes = ["FM-EPS-23", "FM-EPS-22", "FM-EPS-31", "FM-EPS-25", "PHOTO_REPORT", "FM-EPS-45"];

    allCodes.forEach(c => {

      if (!state.packageInstances.some(i => i.code === c)) {

        addFormToPackage(c);

      }

    });

    showToast("เพิ่มฟอร์มมาตรฐานครบ 6 ใบงานเรียบร้อยแล้ว");

  } else if (presetName === "standard") {

    state.packageInstances = [

      { id: "inst_1", code: "FM-EPS-23", title: "รายงานการบริการ", num: 1, customLabel: "", data: null },

      { id: "inst_2", code: "FM-EPS-22", title: "รายงานการตรวจสภาพเครื่องจักร", num: 1, customLabel: "", data: null },

      { id: "inst_3", code: "FM-EPS-31", title: "ตารางวัดขนาดสึกหรอชิ้นส่วน", num: 1, customLabel: "ชุดที่ 1", data: null }

    ];

    state.activeInstanceId = "inst_1";

    renderPackageTabs();

    selectPackageInstance("inst_1");

    showToast("ตั้งค่าชุดใบงานมาตรฐาน (SR + Check + Insp) แล้ว");

  }

  closeAddFormModal();

}



function selectPackageFormByCode(code) {

  switchTab("tab-service-report");

  const found = state.packageInstances.find(i => i.code === code);

  if (found) {

    selectPackageInstance(found.id);

  } else {

    addFormToPackage(code);

  }

}



// =============================================================================

// SIGNATURE PADS

// =============================================================================

function initSignaturePads() {

  const techCanvas = document.getElementById("techSignPad");

  const custCanvas = document.getElementById("custSignPad");



  if (techCanvas && window.SignaturePad) {

    state.techPad = new SignaturePad(techCanvas, { backgroundColor: "rgb(255, 255, 255)", penColor: "rgb(0, 0, 140)" });

  }

  if (custCanvas && window.SignaturePad) {

    state.custPad = new SignaturePad(custCanvas, { backgroundColor: "rgb(255, 255, 255)", penColor: "rgb(0, 0, 140)" });

  }

  window.addEventListener("resize", resizeSignPads);

  window.addEventListener("orientationchange", () => setTimeout(resizeSignPads, 250));

  setTimeout(resizeSignPads, 200);

}



function resizeSignPads() {

  [state.techPad, state.custPad].forEach(pad => {

    if (!pad) return;

    const canvas = pad.canvas;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    if (canvas.offsetWidth === 0) return;

    const data = pad.toData();

    canvas.width = canvas.offsetWidth * ratio;

    canvas.height = canvas.offsetHeight * ratio;

    canvas.getContext("2d").scale(ratio, ratio);

    pad.fromData(data);

  });

}



function clearTechSignature() {

  if (state.techPad) state.techPad.clear();

}



function clearCustSignature() {

  if (state.custPad) state.custPad.clear();

}



// =============================================================================

// RENDERERS (CHECKLISTS, TABLES)

// =============================================================================

function renderVisualChecklist() {

  const tbody = document.getElementById("visualChecklistTbody");

  if (!tbody) return;

  tbody.innerHTML = VISUAL_ITEMS.map((item, idx) => `

    <tr class="hover:bg-slate-50 transition">

      <td class="p-2.5 font-medium text-slate-700">${item}</td>

      <td class="p-2.5 text-center">

        <input type="radio" name="vis_check_${idx}" value="normal" checked class="text-green-600 focus:ring-green-500">

      </td>

      <td class="p-2.5 text-center">

        <input type="radio" name="vis_check_${idx}" value="adjusted" class="text-yellow-500 focus:ring-yellow-400">

      </td>

      <td class="p-2.5 text-center">

        <input type="radio" name="vis_check_${idx}" value="service" class="text-red-600 focus:ring-red-500">

      </td>

      <td class="p-2.5">

        <input type="text" id="vis_rem_${idx}" placeholder="Remark..." class="w-full px-2 py-1 border rounded text-xs">

      </td>

      <td class="p-2.5">

        <input type="text" id="vis_note_${idx}" placeholder="Note..." class="w-full px-2 py-1 border rounded text-xs">

      </td>

    </tr>

  `).join("");

}



function renderSatisfactionTable() {

  const tbody = document.getElementById("satTableTbody");

  if (!tbody) return;



  let html = "";

  SATISFACTION_SECTIONS.forEach(sec => {

    // Category Header Row

    html += `

      <tr class="bg-slate-100/90 border-t border-b border-slate-300">

        <td colspan="6" class="p-2.5 font-bold text-slate-800 text-xs text-left tracking-wide">${sec.category}</td>

      </tr>

    `;



    sec.items.forEach(item => {

      html += `

        <tr class="hover:bg-slate-50 transition border-b border-slate-100">

          <td class="p-2.5 text-left font-medium text-slate-700 text-xs">

            <span class="font-bold text-slate-900 mr-1.5">${item.no}</span>${item.text}

          </td>

          ${[4, 3, 2, 1, 0].map(score => `

            <td class="p-2 text-center cursor-pointer" onclick="selectSatScore('${item.id}', ${score})">

              <input type="radio" name="sat_${item.id}" value="${score}" ${score === 4 ? "checked" : ""}

                onchange="updateTotalSatScore()"

                class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer">

            </td>

          `).join("")}

        </tr>

      `;

    });

  });



  tbody.innerHTML = html;

  updateTotalSatScore();

}



function selectSatScore(itemId, score) {

  const rad = document.querySelector(`input[name="sat_${itemId}"][value="${score}"]`);

  if (rad) {

    rad.checked = true;

    updateTotalSatScore();

  }

}



function setAllSatScores(score = 4) {

  ALL_SAT_ITEMS.forEach(it => {

    const rad = document.querySelector(`input[name="sat_${it.id}"][value="${score}"]`);

    if (rad) rad.checked = true;

  });

  updateTotalSatScore();

  showToast(`ตั้งค่าระดับคะแนนทุกข้อเป็น ${score} คะแนนเรียบร้อย`);

}



function updateTotalSatScore() {

  let total = 0;

  ALL_SAT_ITEMS.forEach(it => {

    const checked = document.querySelector(`input[name="sat_${it.id}"]:checked`);

    if (checked) {

      total += parseInt(checked.value, 10);

    } else {

      total += 4;

    }

  });



  const max = 56;

  const pct = Math.round((total / max) * 100);



  const lblTotal = document.getElementById("lblTotalSatScore");

  const lblPct = document.getElementById("lblPercentSatScore");

  const lblTableTotal = document.getElementById("lblTableTotalSatScore");



  if (lblTotal) lblTotal.innerText = total;

  if (lblPct) lblPct.innerText = `${pct}%`;

  if (lblTableTotal) lblTableTotal.innerText = `${total} / ${max} คะแนน (${pct}%)`;

}



function renderInspectionTable() {

  const tbody = document.getElementById("inspMeasurementsTbody");

  if (!tbody) return;



  const rows = (state.currentInspRows && state.currentInspRows.length > 0)

    ? state.currentInspRows

    : INSP_DEFAULT_ROWS.map(r => ({

        part: r.part,

        pos: r.pos,

        std_in: "-",

        std_mm: "-",

        cmp: "",

        val_min: null,

        val_max: null

      }));



  tbody.innerHTML = rows.map((row, idx) => {

    const stdInText = row.std_in || "-";

    const stdMmText = row.std_mm || "-";

    

    // Existing values in DOM if already rendered

    const existingInA = document.getElementById(`insp_in_a_${idx}`)?.value;

    const existingInB = document.getElementById(`insp_in_b_${idx}`)?.value;

    const existingFiA = document.getElementById(`insp_fi_a_${idx}`)?.value;

    const existingFiB = document.getElementById(`insp_fi_b_${idx}`)?.value;

    const existingRem = document.getElementById(`insp_rem_${idx}`)?.value;



    let defPlaceholder = "";

    if (row.val_mm && !isNaN(row.val_mm)) {

      defPlaceholder = row.val_mm.toFixed(2);

    } else if (row.min) {

      defPlaceholder = row.min;

    }



    const inA = (existingInA !== undefined && existingInA !== "") ? existingInA : (row.in_a || "-");

    const inB = (existingInB !== undefined && existingInB !== "") ? existingInB : (row.in_b || "-");

    const fiA = (existingFiA !== undefined && existingFiA !== "") ? existingFiA : (row.final_a || "-");

    const fiB = (existingFiB !== undefined && existingFiB !== "") ? existingFiB : (row.final_b || "-");

    const rem = (existingRem !== undefined && existingRem !== "") ? existingRem : (row.remark || "");



    return `

      <tr class="hover:bg-slate-50 text-center transition" id="insp_row_${idx}">

        <td class="p-2.5 text-left font-semibold text-slate-800">${row.part}</td>

        <td class="p-2 text-slate-600 font-medium">${row.pos}</td>

        <td class="p-2 text-amber-900 font-mono font-bold bg-amber-50/70 border-x text-xs whitespace-nowrap">${stdInText}</td>

        <td class="p-2 text-emerald-900 font-mono font-bold bg-emerald-50/70 border-x text-xs whitespace-nowrap">${stdMmText}</td>

        <td class="p-1 bg-blue-50/30">

          <input type="text" id="insp_in_a_${idx}" value="${inA}" placeholder="-" 

                 onfocus="if(this.value==='-')this.value=''" onblur="if(!this.value.trim())this.value='-'"

                 oninput="evaluateInspectionRow(${idx})" class="w-16 p-1 text-center border rounded font-mono text-xs focus:ring-2 focus:ring-red-500 bg-white shadow-sm">

        </td>

        <td class="p-1 bg-blue-50/30">

          <input type="text" id="insp_in_b_${idx}" value="${inB}" placeholder="-" 

                 onfocus="if(this.value==='-')this.value=''" onblur="if(!this.value.trim())this.value='-'"

                 oninput="evaluateInspectionRow(${idx})" class="w-16 p-1 text-center border rounded font-mono text-xs focus:ring-2 focus:ring-red-500 bg-white shadow-sm">

        </td>

        <td class="p-1 bg-green-50/30">

          <input type="text" id="insp_fi_a_${idx}" value="${fiA}" placeholder="-" 

                 onfocus="if(this.value==='-')this.value=''" onblur="if(!this.value.trim())this.value='-'"

                 oninput="evaluateInspectionRow(${idx})" class="w-16 p-1 text-center border rounded font-mono text-xs focus:ring-2 focus:ring-red-500 bg-white shadow-sm">

        </td>

        <td class="p-1 bg-green-50/30">

          <input type="text" id="insp_fi_b_${idx}" value="${fiB}" placeholder="-" 

                 onfocus="if(this.value==='-')this.value=''" onblur="if(!this.value.trim())this.value='-'"

                 oninput="evaluateInspectionRow(${idx})" class="w-16 p-1 text-center border rounded font-mono text-xs focus:ring-2 focus:ring-red-500 bg-white shadow-sm">

        </td>

        <td class="p-2">

          <span id="insp_badge_${idx}" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">-</span>

        </td>

        <td class="p-1">

          <input type="text" id="insp_rem_${idx}" value="${rem}" placeholder="-" class="w-24 p-1 text-center border rounded text-xs focus:ring-2 focus:ring-red-500 bg-white shadow-sm">

        </td>

      </tr>

    `;

  }).join("");



  rows.forEach((_, idx) => evaluateInspectionRow(idx));

}



function evaluateInspectionRow(idx) {

  const rows = (state.currentInspRows && state.currentInspRows.length > 0)

    ? state.currentInspRows

    : INSP_DEFAULT_ROWS;

  const row = rows[idx];

  if (!row) return;



  const badge = document.getElementById(`insp_badge_${idx}`);

  if (!badge) return;



  const fiA = parseFloat(document.getElementById(`insp_fi_a_${idx}`)?.value || "NaN");

  const fiB = parseFloat(document.getElementById(`insp_fi_b_${idx}`)?.value || "NaN");

  const inA = parseFloat(document.getElementById(`insp_in_a_${idx}`)?.value || "NaN");

  const inB = parseFloat(document.getElementById(`insp_in_b_${idx}`)?.value || "NaN");



  // Determine which measurements to evaluate: prefer Final measurements if available, else Incoming

  let testVals = [fiA, fiB].filter(v => !isNaN(v));

  if (testVals.length === 0) {

    testVals = [inA, inB].filter(v => !isNaN(v));

  }



  if (testVals.length === 0 || row.std_mm === "-" || (!row.val_mm && !row.min)) {

    badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500";

    badge.innerText = "-";

    return;

  }



  let pass = true;

  if (row.cmp === "≥" || row.cmp === ">=") {

    pass = testVals.every(v => v >= (row.val_mm - 0.05));

  } else if (row.cmp === "≤" || row.cmp === "<=") {

    pass = testVals.every(v => v <= (row.val_mm + 0.05));

  } else if (row.min !== undefined && row.max !== undefined) {

    const min = parseFloat(row.min);

    const max = parseFloat(row.max);

    pass = testVals.every(v => v >= min && v <= max);

  }



  if (pass) {

    badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700";

    badge.innerText = "PASS";

  } else {

    badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700";

    badge.innerText = "FAIL";

  }

}



function renderPartsTable() {

  const tbody = document.getElementById("partsTableTbody");

  const showPrices = document.getElementById("toggleShowPrices")?.checked;

  const thPrice = document.getElementById("thPrice");

  const thTotal = document.getElementById("thTotal");



  if (thPrice) thPrice.classList.toggle("hidden", !showPrices);

  if (thTotal) thTotal.classList.toggle("hidden", !showPrices);



  const totalPages = (!state.parts || state.parts.length === 0) ? 1 : Math.ceil(state.parts.length / 16);

  const pageBadge = document.getElementById("lblPartsTotalPagesBadge");

  if (pageBadge) {

    if (totalPages > 1) {

      pageBadge.innerHTML = `<span class="text-amber-800 font-bold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[11px] shadow-xs">รวม ${state.parts.length} รายการ (พิมพ์ ${totalPages} หน้าอัตโนมัติ)</span>`;

    } else {

      pageBadge.innerHTML = `<span class="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px]">รวม ${state.parts.length} รายการ (1 หน้า)</span>`;

    }

  }



  if (!tbody) return;

  tbody.innerHTML = state.parts.map((p, idx) => `

    <tr class="hover:bg-slate-50">

      <td class="p-1.5 text-center text-slate-500 font-mono text-xs">${idx + 1}</td>

      <td class="p-1"><input type="text" value="${p.part_no || ''}" placeholder="Part No." onchange="updatePart(${idx}, 'part_no', this.value)" class="w-full p-1 border rounded text-xs font-mono"></td>

      <td class="p-1"><input type="text" value="${p.description || ''}" placeholder="ชื่อชิ้นส่วน" onchange="updatePart(${idx}, 'description', this.value)" class="w-full p-1 border rounded text-xs"></td>

      <td class="p-1 text-center"><input type="number" value="${p.qty || 1}" min="1" onchange="updatePart(${idx}, 'qty', this.value)" class="w-12 p-1 text-center border rounded text-xs font-mono"></td>

      ${showPrices ? `

        <td class="p-1 text-right"><input type="text" value="${(p.price !== undefined && p.price !== null && p.price !== 0 && p.price !== '0') ? p.price : ''}" placeholder="ระบุราคา" onchange="updatePart(${idx}, 'price', this.value)" class="w-20 p-1 text-right border rounded text-xs font-mono"></td>

        <td class="p-1 text-right font-mono font-semibold text-slate-800 text-xs">${(p.price && Number(p.price) > 0) ? (Number(p.price) * Number(p.qty || 1)).toLocaleString() + ' ฿' : '-'}</td>

      ` : ""}

      <td class="p-1"><input type="text" value="${p.supplier || '-'}" placeholder="สั่งทำที่" onchange="updatePart(${idx}, 'supplier', this.value)" class="w-full p-1 border rounded text-xs"></td>

      <td class="p-1"><input type="text" value="${p.sent_date || '-'}" placeholder="วว/ดด/ปป" onchange="updatePart(${idx}, 'sent_date', this.value)" class="w-full p-1 border rounded text-xs text-center font-mono"></td>

      <td class="p-1"><input type="text" value="${p.finished_date || '-'}" placeholder="วว/ดด/ปป" onchange="updatePart(${idx}, 'finished_date', this.value)" class="w-full p-1 border rounded text-xs text-center font-mono"></td>

      <td class="p-1 text-center">

        <button onclick="removePartRow(${idx})" class="text-red-500 hover:text-red-700 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>

      </td>

    </tr>

  `).join("");



  initIcons();

}



function addPartRow() {

  state.parts.push({

    part_no: "",

    description: "",

    qty: 1,

    price: "",

    supplier: "-",

    sent_date: "-",

    finished_date: "-"

  });

  renderPartsTable();

}



function removePartRow(idx) {

  state.parts.splice(idx, 1);

  renderPartsTable();

  const searchInput = document.getElementById("bomSearchInput");

  renderBomPartsTable(searchInput ? searchInput.value : "");

}



function updatePart(idx, key, val) {

  if (state.parts[idx]) {

    state.parts[idx][key] = val;

    if (key === "qty" || key === "price") {

      renderPartsTable();

    }

  }

}



// =============================================================================

// STEP 1 & 2: HERO REQUEST SEARCH & AUTO-POPULATE

// =============================================================================

function setupHeroSearch() {

  const heroInput = document.getElementById("heroRequestInput");

  const heroSuggestions = document.getElementById("heroSuggestions");

  if (!heroInput || !heroSuggestions) return;



  let timer = null;

  heroInput.addEventListener("input", () => {

    clearTimeout(timer);

    const q = heroInput.value.trim();

    if (q.length < 2) {

      heroSuggestions.classList.add("hidden");

      return;

    }

    timer = setTimeout(async () => {

      try {

        const res = await fetch(`/api/tickets?q=${encodeURIComponent(q)}&limit=8`);

        const data = await res.json();

        if (data.items && data.items.length > 0) {

          heroSuggestions.innerHTML = data.items.map(t => {
            const reqNo = t.RequestNo || t.TicketNo || "";
            const vtiger = t.VtigerTicket && t.VtigerTicket !== reqNo ? `(${t.VtigerTicket})` : "";
            return `
            <div onclick="selectTicket('${reqNo}')" class="p-3 hover:bg-red-50 cursor-pointer transition flex items-center justify-between">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-red-700 font-mono text-sm">${reqNo}</span>
                  ${vtiger ? `<span class="text-xs text-slate-400 font-mono">${vtiger}</span>` : ""}
                  <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${t.Product || ""}</span>
                </div>
                <div class="text-xs font-semibold text-slate-800 mt-0.5">${t.Customer || "-"}</div>
                <div class="text-[11px] text-slate-500">${t.Model || "-"} ${t.Site ? '| ' + t.Site : ''}</div>
              </div>
              <div class="text-right text-[11px] text-slate-400 shrink-0 ml-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-medium ${t.Status === 'Closed' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'}">${t.Status || 'Open'}</span>
                <div class="mt-0.5">${t.AppointmentDate || ''}</div>
              </div>
            </div>`;
          }).join("");

          heroSuggestions.classList.remove("hidden");

        } else {

          heroSuggestions.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center">ไม่พบเลขงานที่ค้นหา</div>`;

          heroSuggestions.classList.remove("hidden");

        }

      } catch (e) {

        console.error(e);

      }

    }, 200);

  });



  document.addEventListener("click", (e) => {

    if (!heroInput.contains(e.target) && !heroSuggestions.contains(e.target)) {

      heroSuggestions.classList.add("hidden");

    }

  });

}



async function loadRecentJobsPills() {

  const container = document.getElementById("heroRecentPills");

  if (!container) return;

  try {

    const res = await fetch("/api/tickets?limit=5&sort=desc");

    if (!res.ok) return;

    const data = await res.json();

    if (data.items && data.items.length > 0) {

      container.innerHTML = data.items.map(t => {

        const shortCust = (t.Customer || "").length > 18 ? (t.Customer || "").slice(0, 18) + "..." : (t.Customer || "-");

        return `

          <button type="button" onclick="quickSelectRequest('${t.RequestNo || t.TicketNo}')" 
                  class="shrink-0 whitespace-nowrap bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer">
            <span class="font-bold font-mono text-yellow-300">${t.RequestNo || t.TicketNo}</span>

            <span class="text-slate-300 text-[11px]">(${shortCust})</span>

          </button>

        `;

      }).join("");

    }

  } catch (e) {

    console.error("Error loading recent jobs:", e);

  }

}



function submitHeroSearch() {

  const input = document.getElementById("heroRequestInput");

  if (!input) return;

  const val = input.value.trim();

  if (!val) {

    input.focus();

    showToast("กรุณาระบุเลข Request No. หรือชื่อลูกค้า");

    return;

  }

  lookupRequestNo(val);

}



function quickSelectRequest(ticketNo) {

  const heroInput = document.getElementById("heroRequestInput");

  if (heroInput) heroInput.value = ticketNo;

  lookupRequestNo(ticketNo);

}



function showTicketSelector() {

  const hero = document.getElementById("step1RequestHero");

  if (hero) {

    hero.classList.remove("hidden");

    hero.scrollIntoView({ behavior: "smooth", block: "start" });

  }

  const input = document.getElementById("heroRequestInput");

  if (input) {

    input.focus();

    input.select();

  }

}



function skipToManualForm() {

  const hero = document.getElementById("step1RequestHero");

  if (hero) hero.classList.add("hidden");

  const banner = document.getElementById("activeTicketBanner");

  if (banner) banner.classList.remove("hidden");

  document.getElementById("bannerTicketNo").innerText = "MANUAL";

  document.getElementById("bannerCustomer").innerText = "งานสร้างใหม่แบบกำหนดเอง (Manual Draft)";

  document.getElementById("sr_request_no").focus();

  showToast("เข้าสู่โหมดกรอกข้อมูลด้วยตนเอง");

}



async function lookupRequestNo(query) {

  if (!query) return;

  const q = String(query).trim();

  if (!q) return;



  showToast(`กำลังค้นหาข้อมูลงาน ${q}...`);

  try {

    // 1. Direct match by TicketNo / Title

    const directRes = await fetch(`/api/tickets/${encodeURIComponent(q)}`);

    if (directRes.ok) {

      const t = await directRes.json();

      selectTicket(t.RequestNo || t.TicketNo);

      return;

    }



    // 2. Search query match

    const searchRes = await fetch(`/api/tickets?q=${encodeURIComponent(q)}&limit=1`);

    if (searchRes.ok) {

      const data = await searchRes.json();

      if (data.items && data.items.length > 0) {

        selectTicket(data.items[0].RequestNo || data.items[0].TicketNo);

        return;

      }

    }



    showToast(`ไม่พบข้อมูลงานสำหรับ "${q}" ในระบบ Google Drive`);

  } catch (e) {

    showToast("เกิดข้อผิดพลาดในการค้นหา: " + e.message);

  }

}



function setupQuickSearch() {

  const input = document.getElementById("quickTicketInput");

  const suggestions = document.getElementById("ticketSuggestions");

  if (!input || !suggestions) return;



  input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      lookupRequestNo(input.value);

    }

  });



  let timer = null;

  input.addEventListener("input", () => {

    clearTimeout(timer);

    const q = input.value.trim();

    if (q.length < 2) {

      suggestions.classList.add("hidden");

      return;

    }

    timer = setTimeout(async () => {

      try {

        const res = await fetch(`/api/tickets?q=${encodeURIComponent(q)}&limit=8`);

        const data = await res.json();

        if (data.items && data.items.length > 0) {

          suggestions.innerHTML = data.items.map(t => {
            const reqNo = t.RequestNo || t.TicketNo || "";
            const vtiger = t.VtigerTicket && t.VtigerTicket !== reqNo ? `(${t.VtigerTicket})` : "";
            return `
            <div onclick="selectTicket('${reqNo}')" class="p-2.5 hover:bg-red-50 cursor-pointer border-b last:border-none transition">
              <div class="flex items-center justify-between">
                <span class="font-bold text-red-700 text-xs">${reqNo} ${vtiger}</span>
                <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${t.Product || ""}</span>
              </div>
              <div class="text-xs text-slate-800 font-medium truncate mt-0.5">${t.Customer || "-"}</div>
              <div class="text-[11px] text-slate-500 truncate">${t.Model || "-"} | S/N: ${t.SerialNo || "-"}</div>
            </div>`;
          }).join("");

          suggestions.classList.remove("hidden");

        } else {

          suggestions.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center">ไม่พบเลขงานที่ค้นหา</div>`;

          suggestions.classList.remove("hidden");

        }

      } catch (e) {

        console.error(e);

      }

    }, 250);

  });



  document.addEventListener("click", (e) => {

    if (!input.contains(e.target) && !suggestions.contains(e.target)) {

      suggestions.classList.add("hidden");

    }

  });

}



async function selectTicket(ticketNo) {

  showToast("กำลังดึงข้อมูลงาน...");

  try {

    const res = await fetch(`/api/tickets/${encodeURIComponent(ticketNo)}`);

    if (!res.ok) throw new Error("Ticket not found");

    const t = await res.json();

    state.currentTicket = t;



    // Transition from Step 1 to Step 2

    const hero = document.getElementById("step1RequestHero");

    if (hero) hero.classList.add("hidden");

    const banner = document.getElementById("activeTicketBanner");

    if (banner) banner.classList.remove("hidden");

    const heroSuggestions = document.getElementById("heroSuggestions");

    if (heroSuggestions) heroSuggestions.classList.add("hidden");

    const topSuggestions = document.getElementById("ticketSuggestions");

    if (topSuggestions) topSuggestions.classList.add("hidden");



    // Populate Fields on Header (Customer, Plant, Contact Person, Tel - default to '-' if empty)

    const custVal = String(t.Customer || t["Organization Name"] || "").trim() || "";

    const siteVal = String(t.Site || t["Address or Site"] || "").trim() || "";

    const contactPersonVal = String(t.ContactPerson || t["Site Contact Person"] || "").trim() || "";

    const contactPhoneVal = String(t.ContactPhone || t["Site Contact Phone"] || "").trim() || "";



    const activeReqNo = t.RequestNo || t.TicketNo || ticketNo;
    document.getElementById("sr_request_no").value = activeReqNo;

    document.getElementById("sr_customer").value = custVal;

    document.getElementById("sr_plant").value = siteVal;

    document.getElementById("sr_contact_person").value = contactPersonVal;

    document.getElementById("sr_contact_no").value = contactPhoneVal;



    if (document.getElementById("parts_customer")) document.getElementById("parts_customer").value = custVal;

    if (document.getElementById("parts_plant")) document.getElementById("parts_plant").value = siteVal;

    if (document.getElementById("parts_contact_person")) document.getElementById("parts_contact_person").value = contactPersonVal;

    if (document.getElementById("parts_contact_no")) document.getElementById("parts_contact_no").value = contactPhoneVal;



    if (document.getElementById("sat_customer")) document.getElementById("sat_customer").value = custVal;

    if (document.getElementById("sat_contact_person")) document.getElementById("sat_contact_person").value = contactPersonVal;

    if (document.getElementById("sat_contact_no")) document.getElementById("sat_contact_no").value = contactPhoneVal;



    // Auto-populate Photo Report fields

    if (document.getElementById("photo_customer")) document.getElementById("photo_customer").value = custVal;

    if (document.getElementById("photo_plant")) document.getElementById("photo_plant").value = siteVal;

    if (document.getElementById("photo_job")) document.getElementById("photo_job").value = "";

    if (document.getElementById("photo_date")) {

      const nowD = new Date();

      const dd = String(nowD.getDate()).padStart(2, "0");

      const mm = String(nowD.getMonth() + 1).padStart(2, "0");

      const yyyy = nowD.getFullYear();

      document.getElementById("photo_date").value = `${dd}/${mm}/${yyyy}`;

    }

    if (document.getElementById("photo_pump")) document.getElementById("photo_pump").value = t.ProductCode || t.PumpBrand || "";

    if (document.getElementById("photo_model")) document.getElementById("photo_model").value = t.PumpModel || "";

    if (document.getElementById("photo_serial")) document.getElementById("photo_serial").value = t.SerialNo || "";

    if (document.getElementById("photo_reported_by")) document.getElementById("photo_reported_by").value = "";



    // Sync into package instances so newly switched tabs already contain these values

    if (state.packageInstances && state.packageInstances.length > 0) {

      state.packageInstances.forEach(inst => {

        if (!inst.data) inst.data = {};

        if (!inst.data.parts_customer || inst.data.parts_customer === "-") inst.data.parts_customer = custVal;

        if (!inst.data.parts_plant || inst.data.parts_plant === "-") inst.data.parts_plant = siteVal;

        if (!inst.data.parts_contact_person || inst.data.parts_contact_person === "-") inst.data.parts_contact_person = contactPersonVal;

        if (!inst.data.parts_contact_no || inst.data.parts_contact_no === "-") inst.data.parts_contact_no = contactPhoneVal;

        if (!inst.data.customer || inst.data.customer === "-") inst.data.customer = custVal;

        if (!inst.data.plant || inst.data.plant === "-") inst.data.plant = siteVal;

        if (!inst.data.contact_person || inst.data.contact_person === "-") inst.data.contact_person = contactPersonVal;

        if (!inst.data.contact_no || inst.data.contact_no === "-") inst.data.contact_no = contactPhoneVal;

      });

    }



    // Clear Pump & Equipment fields for manual input per pump

    document.getElementById("sr_pump_model").value = "";

    document.getElementById("sr_serial_no").value = "";

    document.getElementById("sr_pump_code").value = "";

    document.getElementById("sr_motor_brand").value = "";

    document.getElementById("sr_motor_kw").value = "";

    document.getElementById("sr_motor_rpm").value = "";

    document.getElementById("sr_motor_max_amp").value = "";

    document.getElementById("sr_gear_brand").value = "";

    document.getElementById("sr_gear_ratio").value = "";

    document.getElementById("sr_gear_model").value = "";

    document.getElementById("sr_gear_serial").value = "";



    // Sync input boxes

    const quickInput = document.getElementById("quickTicketInput");

    if (quickInput) quickInput.value = t.TicketNo;

    const heroInput = document.getElementById("heroRequestInput");

    if (heroInput) heroInput.value = t.TicketNo;



    // Service Date

    if (t.AppointmentDate) {

      const d = t.AppointmentDate.split(" ")[0].split("T")[0];

      if (d && d !== "nan" && d !== "-") {

        document.getElementById("sr_date").value = d;

      }

    } else {

      const today = new Date().toISOString().split("T")[0];

      if (!document.getElementById("sr_date").value) {

        document.getElementById("sr_date").value = today;

      }

    }



    // Technician fields: leave completely blank for user to enter manually

    if (document.getElementById("techSignerName")) document.getElementById("techSignerName").value = "";

    if (document.getElementById("insp_tech_incoming")) document.getElementById("insp_tech_incoming").value = "";

    if (document.getElementById("insp_tech_final")) document.getElementById("insp_tech_final").value = "";

    if (document.getElementById("parts_receiver_name")) document.getElementById("parts_receiver_name").value = "";



    const today = new Date().toISOString().split("T")[0];

    if (document.getElementById("parts_receive_date") && !document.getElementById("parts_receive_date").value) {

      document.getElementById("parts_receive_date").value = today;

    }



    // Update Top Banner

    document.getElementById("bannerTicketNo").innerText = activeReqNo;

    document.getElementById("bannerCustomer").innerText = custVal;

    if (document.getElementById("bannerSite")) {

      document.getElementById("bannerSite").innerText = siteVal;

    }

    const bannerModelEl = document.getElementById("bannerModel");

    if (bannerModelEl) {

      bannerModelEl.innerHTML = `<span class="text-amber-700 font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">กรอกเองตามปั๊มแต่ละตัว</span>`;

    }

    const bannerTechEl = document.getElementById("bannerTech");

    if (bannerTechEl) {

      bannerTechEl.innerHTML = `<span class="text-amber-700 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">กรอกเอง</span>`;

    }

    if (document.getElementById("bannerStatus")) {

      document.getElementById("bannerStatus").innerText = t.Status || "Open";

    }



    // Ensure icons updated

    initIcons();



    // Load existing draft if present

    await loadTicketDraft(ticketNo);

    loadTicketPhotos(ticketNo);

    showToast(`ดึงข้อมูลลูกค้า Request No: ${activeReqNo} เรียบร้อยแล้ว (ข้อมูลปั๊มและชื่อช่างกรอกด้วยตนเอง)`);

  } catch (e) {

    showToast("เกิดข้อผิดพลาดในการโหลดงาน: " + e.message);

  }

}



async function loadTicketDraft(ticketNo) {

  try {

    const res = await fetch(`/api/reports/load-draft/${ticketNo}`);

    if (res.ok) {

      const draft = await res.json();

      applyDraftData(draft);

      showToast(`โหลดร่างงานที่บันทึกไว้ของ ${ticketNo} แล้ว`);

    }

  } catch (e) {

    // Draft doesn't exist, fine

  }

}



function applyDraftData(d) {
  if (d.form_instances && Array.isArray(d.form_instances) && d.form_instances.length > 0) {
    state.packageInstances = d.form_instances;
    state.activeInstanceId = d.active_instance_id || d.activeInstanceId || state.packageInstances[0].id;
    renderPackageTabs();
    selectPackageInstance(state.activeInstanceId);
  }

  const isValidDraftVal = (v) => v && v !== "-" && !String(v).includes("should not") && !String(v).includes("from web");

  if (isValidDraftVal(d.customer) && document.getElementById("sr_customer")) document.getElementById("sr_customer").value = d.customer;
  if (isValidDraftVal(d.plant) && document.getElementById("sr_plant")) document.getElementById("sr_plant").value = d.plant;
  if (isValidDraftVal(d.contact_person) && document.getElementById("sr_contact_person")) document.getElementById("sr_contact_person").value = d.contact_person;
  if (isValidDraftVal(d.contact_no) && document.getElementById("sr_contact_no")) document.getElementById("sr_contact_no").value = d.contact_no;




  if (d.cause) document.getElementById("sr_cause").value = d.cause;

  if (d.repairing) document.getElementById("sr_repairing").value = d.repairing;

  if (d.recommendation) document.getElementById("cr_recommendation").value = d.recommendation;

  if (d.tech_name || d.serviced_by) {

    const val = d.tech_name || d.serviced_by;

    document.getElementById("techSignerName").value = val;

    const bannerTechEl = document.getElementById("bannerTech");

    if (bannerTechEl && val && val !== "-") {

      bannerTechEl.innerHTML = `<span class="text-slate-800 font-bold">${val}</span>`;

    }

  }

  if (d.cust_name || d.customer_signer_name) document.getElementById("custSignerName").value = d.cust_name || d.customer_signer_name;

  if (d.cust_position || d.customer_signer_position) document.getElementById("custSignerPosition").value = d.cust_position || d.customer_signer_position;



  // Equipment & Motor & Gear

  if (d.pump_brand) {

    if (document.getElementById("sr_pump_brand")) document.getElementById("sr_pump_brand").value = d.pump_brand;

    if (document.getElementById("cr_pump_brand")) document.getElementById("cr_pump_brand").value = d.pump_brand;

  }

  if (d.pump_model) {

    if (document.getElementById("sr_pump_model")) document.getElementById("sr_pump_model").value = d.pump_model;

    if (document.getElementById("cr_sheet_model")) document.getElementById("cr_sheet_model").value = d.pump_model;

  }

  if (d.serial_no) {

    if (document.getElementById("sr_serial_no")) document.getElementById("sr_serial_no").value = d.serial_no;

    if (document.getElementById("cr_sheet_serial")) document.getElementById("cr_sheet_serial").value = d.serial_no;

  }

  if (d.pump_code) {

    if (document.getElementById("sr_pump_code")) document.getElementById("sr_pump_code").value = d.pump_code;

    if (document.getElementById("cr_sheet_code")) document.getElementById("cr_sheet_code").value = d.pump_code;

  }

  if (d.motor_brand) {

    if (document.getElementById("sr_motor_brand")) document.getElementById("sr_motor_brand").value = d.motor_brand;

    if (document.getElementById("cr_motor_brand")) document.getElementById("cr_motor_brand").value = d.motor_brand;

  }

  if (d.motor_kw) {

    if (document.getElementById("sr_motor_kw")) document.getElementById("sr_motor_kw").value = d.motor_kw;

    if (document.getElementById("cr_motor_kw")) document.getElementById("cr_motor_kw").value = d.motor_kw;

  }

  if (d.motor_rpm) {

    if (document.getElementById("sr_motor_rpm")) document.getElementById("sr_motor_rpm").value = d.motor_rpm;

    if (document.getElementById("cr_motor_rpm")) document.getElementById("cr_motor_rpm").value = d.motor_rpm;

  }

  if (d.motor_max_amp) {

    if (document.getElementById("sr_motor_max_amp")) document.getElementById("sr_motor_max_amp").value = d.motor_max_amp;

    if (document.getElementById("cr_motor_max_amp")) document.getElementById("cr_motor_max_amp").value = d.motor_max_amp;

  }

  if (d.gear_brand) {

    if (document.getElementById("sr_gear_brand")) document.getElementById("sr_gear_brand").value = d.gear_brand;

    if (document.getElementById("cr_gear_brand")) document.getElementById("cr_gear_brand").value = d.gear_brand;

  }

  if (d.gear_ratio) {

    if (document.getElementById("sr_gear_ratio")) document.getElementById("sr_gear_ratio").value = d.gear_ratio;

    if (document.getElementById("cr_gear_ratio")) document.getElementById("cr_gear_ratio").value = d.gear_ratio;

  }

  if (d.gear_model) {

    if (document.getElementById("sr_gear_model")) document.getElementById("sr_gear_model").value = d.gear_model;

    if (document.getElementById("cr_gear_model")) document.getElementById("cr_gear_model").value = d.gear_model;

  }

  if (d.gear_serial) {

    if (document.getElementById("sr_gear_serial")) document.getElementById("sr_gear_serial").value = d.gear_serial;

    if (document.getElementById("cr_gear_serial")) document.getElementById("cr_gear_serial").value = d.gear_serial;

  }



  // FM-EPS-23: Service Subjects

  if (d.service_subjects && Array.isArray(d.service_subjects)) {

    document.querySelectorAll('input[name="sr_subject"]').forEach(el => {

      el.checked = d.service_subjects.includes(el.value);

    });

  }

  if (d.subject_other) document.getElementById("sr_subject_other").value = d.subject_other;



  // FM-EPS-23: Problems & Symptoms

  if (d.problem_ticks && Array.isArray(d.problem_ticks)) {

    document.querySelectorAll('input[name="sr_problem"]').forEach(el => {

      el.checked = d.problem_ticks.includes(el.value);

    });

  }

  if (d.problem_etc) document.getElementById("sr_problem_etc").value = d.problem_etc;



  // FM-EPS-23: Cause & Ref

  if (d.cause) document.getElementById("sr_cause").value = d.cause;

  if (d.cause_ref_check !== undefined) document.getElementById("sr_cause_ref_check").checked = d.cause_ref_check;

  if (d.cause_ref) document.getElementById("sr_cause_ref").value = d.cause_ref;



  // FM-EPS-23: Repairing & Ref

  if (d.repairing) document.getElementById("sr_repairing").value = d.repairing;

  if (d.repairing_ref_check !== undefined) document.getElementById("sr_repairing_ref_check").checked = d.repairing_ref_check;

  if (d.repairing_ref) document.getElementById("sr_repairing_ref").value = d.repairing_ref;



  // FM-EPS-23: Prevention & Ref

  if (d.prevention_ticks && Array.isArray(d.prevention_ticks)) {

    document.querySelectorAll('input[name="sr_prev"]').forEach(el => {

      el.checked = d.prevention_ticks.includes(el.value);

    });

  }

  if (d.prevention_other) document.getElementById("sr_prevention_other").value = d.prevention_other;

  if (d.prev_ref_check !== undefined) document.getElementById("sr_prev_ref_check").checked = d.prev_ref_check;

  if (d.prev_ref) document.getElementById("sr_prev_ref").value = d.prev_ref;



  // FM-EPS-23: Test Result & Ref

  if (d.test_result) {

    const r = document.querySelector(`input[name="sr_test_result"][value="${d.test_result}"]`);

    if (r) r.checked = true;

  }

  if (d.test_run_detail) document.getElementById("sr_test_run_detail").value = d.test_run_detail;

  if (d.no_test_run_detail) document.getElementById("sr_no_test_run_detail").value = d.no_test_run_detail;

  if (d.service_again_detail) document.getElementById("sr_service_again_detail").value = d.service_again_detail;

  if (d.return_shop_detail) document.getElementById("sr_return_shop_detail").value = d.return_shop_detail;

  if (d.test_other_detail) document.getElementById("sr_test_other_detail").value = d.test_other_detail;

  if (d.test_ref_check !== undefined) document.getElementById("sr_test_ref_check").checked = d.test_ref_check;

  if (d.test_ref) document.getElementById("sr_test_ref").value = d.test_ref;



  // FM-EPS-23: Signatures & Timing

  if (d.serviced_date) document.getElementById("sr_serviced_date").value = d.serviced_date;

  if (d.time_start) document.getElementById("sr_time_start").value = d.time_start;

  if (d.time_finished) document.getElementById("sr_time_finished").value = d.time_finished;

  if (d.customer_sign_date) document.getElementById("cust_sign_date").value = d.customer_sign_date;



  // Visual Checklist

  if (d.visual_checklist && Array.isArray(d.visual_checklist)) {

    d.visual_checklist.forEach((item, idx) => {

      const rad = document.querySelector(`input[name="vis_check_${idx}"][value="${item.status}"]`);

      if (rad) rad.checked = true;

      if (item.remark) {

        const remEl = document.getElementById(`vis_rem_${idx}`);

        if (remEl) remEl.value = item.remark;

      }

      if (item.note) {

        const noteEl = document.getElementById(`vis_note_${idx}`);

        if (noteEl) noteEl.value = item.note;

      }

    });

  }



  // Alignment

  if (d.alignment) {

    const al = d.alignment;

    if (al.sv_gauge) document.getElementById("al_sv_gauge").value = al.sv_gauge;

    if (al.note) document.getElementById("al_note").value = al.note;

    ['0', '90', '180', '270'].forEach(deg => {

      if (al.check_radial && al.check_radial[deg]) document.getElementById(`al_c_r_${deg}`).value = al.check_radial[deg];

      if (al.check_x && al.check_x[deg]) document.getElementById(`al_c_x_${deg}`).value = al.check_x[deg];

      if (al.reset_radial && al.reset_radial[deg]) document.getElementById(`al_r_r_${deg}`).value = al.reset_radial[deg];

      if (al.reset_x && al.reset_x[deg]) document.getElementById(`al_r_x_${deg}`).value = al.reset_x[deg];

    });

  }



  // Vibration

  if (d.vibration) {

    const vb = d.vibration;

    if (vb.meter_sv) document.getElementById("vb_meter_sv").value = vb.meter_sv;

    if (vb.thermometer_sv) document.getElementById("vb_thermometer_sv").value = vb.thermometer_sv;

    ['pump', 'motor', 'gear'].forEach(m => {

      const pfx = m[0];

      const mData = vb[m] || {};

      ['dh', 'dv', 'da', 'nh', 'nv', 'na', 't_de', 't_nde'].forEach(k => {

        const el = document.getElementById(`vb_${pfx}_${k.replace('_', '')}`);

        if (el && mData[k]) el.value = mData[k];

      });

    });

  }



  // Operation

  if (d.operation) {

    const op = d.operation;

    if (op.ins_u) document.getElementById("op_ins_u").value = op.ins_u;

    if (op.ins_v) document.getElementById("op_ins_v").value = op.ins_v;

    if (op.ins_w) document.getElementById("op_ins_w").value = op.ins_w;

    if (op.cur_u) document.getElementById("op_cur_u").value = op.cur_u;

    if (op.cur_v) document.getElementById("op_cur_v").value = op.cur_v;

    if (op.cur_w) document.getElementById("op_cur_w").value = op.cur_w;

    if (op.vol_uv) document.getElementById("op_vol_uv").value = op.vol_uv;

    if (op.vol_uw) document.getElementById("op_vol_uw").value = op.vol_uw;

    if (op.vol_vw) document.getElementById("op_vol_vw").value = op.vol_vw;

    if (op.speed) document.getElementById("op_speed").value = op.speed;

  }



  if (d.parts && Array.isArray(d.parts)) {

    state.parts = d.parts;

    renderPartsTable();

  }



  // FM-EPS-31: Inspection Report

  if (d.measuring_with && document.getElementById("insp_measuring_with")) document.getElementById("insp_measuring_with").value = d.measuring_with;

  if (d.tech_incoming_name && document.getElementById("insp_tech_incoming")) document.getElementById("insp_tech_incoming").value = d.tech_incoming_name;

  if (d.tech_final_name && document.getElementById("insp_tech_final")) document.getElementById("insp_tech_final").value = d.tech_final_name;

  if (d.approve_incoming_name && document.getElementById("insp_approve_incoming")) document.getElementById("insp_approve_incoming").value = d.approve_incoming_name;

  if (d.approve_final_name && document.getElementById("insp_approve_final")) document.getElementById("insp_approve_final").value = d.approve_final_name;



  if (d.measurements && Array.isArray(d.measurements)) {

    d.measurements.forEach((m, idx) => {

      if (document.getElementById(`insp_in_a_${idx}`)) document.getElementById(`insp_in_a_${idx}`).value = m.in_a || "";

      if (document.getElementById(`insp_in_b_${idx}`)) document.getElementById(`insp_in_b_${idx}`).value = m.in_b || "";

      if (document.getElementById(`insp_fi_a_${idx}`)) document.getElementById(`insp_fi_a_${idx}`).value = (m.final_a !== undefined && m.final_a !== "-") ? m.final_a : (m.fi_a || "");

      if (document.getElementById(`insp_fi_b_${idx}`)) document.getElementById(`insp_fi_b_${idx}`).value = (m.final_b !== undefined && m.final_b !== "-") ? m.final_b : (m.fi_b || "");

      if (document.getElementById(`insp_rem_${idx}`)) document.getElementById(`insp_rem_${idx}`).value = m.remark || "";

      evaluateInspectionRow(idx);

    });

  }



  // FM-EPS-25: Spare Parts Fields

  if (d.parts_job_no && document.getElementById("parts_job_no")) document.getElementById("parts_job_no").value = d.parts_job_no;

  if (d.parts_io_no && document.getElementById("parts_io_no")) document.getElementById("parts_io_no").value = d.parts_io_no;

  if (d.parts_customer && document.getElementById("parts_customer")) document.getElementById("parts_customer").value = d.parts_customer;

  if (d.parts_plant && document.getElementById("parts_plant")) document.getElementById("parts_plant").value = d.parts_plant;

  if (d.parts_contact_person && document.getElementById("parts_contact_person")) document.getElementById("parts_contact_person").value = d.parts_contact_person;

  if (d.parts_contact_no && document.getElementById("parts_contact_no")) document.getElementById("parts_contact_no").value = d.parts_contact_no;

  if (d.parts_sheet_date && document.getElementById("parts_sheet_date")) document.getElementById("parts_sheet_date").value = d.parts_sheet_date;

  if (d.parts_sheet_model && document.getElementById("parts_sheet_model")) document.getElementById("parts_sheet_model").value = d.parts_sheet_model;

  if (d.parts_sheet_serial && document.getElementById("parts_sheet_serial")) document.getElementById("parts_sheet_serial").value = d.parts_sheet_serial;

  if (d.parts_sheet_code && document.getElementById("parts_sheet_code")) document.getElementById("parts_sheet_code").value = d.parts_sheet_code;

  if (d.sale_name && document.getElementById("parts_sale_name")) document.getElementById("parts_sale_name").value = d.sale_name;

  if (d.receiver_name && document.getElementById("parts_receiver_name")) document.getElementById("parts_receiver_name").value = d.receiver_name;

  if (d.receive_date && document.getElementById("parts_receive_date")) document.getElementById("parts_receive_date").value = d.receive_date;

  if (d.due_date && document.getElementById("parts_due_date")) document.getElementById("parts_due_date").value = d.due_date;

  if (d.delivery_date && document.getElementById("parts_delivery_date")) document.getElementById("parts_delivery_date").value = d.delivery_date;

  if (d.test_pump_note && document.getElementById("parts_test_pump_note")) document.getElementById("parts_test_pump_note").value = d.test_pump_note;

}



// =============================================================================

// PHOTO DROPZONE & GALLERY

// =============================================================================

function setupPhotoDropzone() {

  const dropZone = document.getElementById("dropZone");

  const fileInput = document.getElementById("filePhotoInput");

  if (!dropZone || !fileInput) return;



  dropZone.addEventListener("click", () => fileInput.click());



  fileInput.addEventListener("change", () => {

    if (fileInput.files.length > 0) {

      handlePhotoUpload(fileInput.files);

    }

  });



  dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.classList.add("border-red-600", "bg-red-100/50");

  });



  dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("border-red-600", "bg-red-100/50");

  });



  dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("border-red-600", "bg-red-100/50");

    if (e.dataTransfer.files.length > 0) {

      handlePhotoUpload(e.dataTransfer.files);

    }

  });

}



async function handlePhotoUpload(files) {

  const ticketNo = document.getElementById("sr_request_no")?.value.trim();

  if (!ticketNo) {

    alert("กรุณาระบุเลขที่งาน (Ticket No.) ก่อนอัปโหลดภาพ");

    return;

  }

  const category = document.getElementById("photoCategory")?.value || "ทั่วไป / ก่อนทำ";

  const caption = document.getElementById("photoCaption")?.value || "";



  showToast(`กำลังอัปโหลดรูปภาพ ${files.length} รูป...`);



  if (!state.activePhotoReportPhotos) {

    state.activePhotoReportPhotos = [];

  }



  for (let file of files) {

    const formData = new FormData();

    formData.append("ticket_no", ticketNo);

    formData.append("category", category);

    formData.append("caption", caption);

    formData.append("file", file);



    try {

      const res = await fetch("/api/photos/upload", {

        method: "POST",

        body: formData

      });

      if (res.ok) {

        const data = await res.json();

        if (data.photo) {

          state.activePhotoReportPhotos.push(data.photo);

        }

      }

    } catch (e) {

      console.error(e);

    }

  }



  // Sync into active instance data

  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  if (activeInst && activeInst.code === "PHOTO_REPORT") {

    if (!activeInst.data) activeInst.data = {};

    activeInst.data.photos = JSON.parse(JSON.stringify(state.activePhotoReportPhotos));

  }



  renderPhotoGallery();

  showToast("อัปโหลดรูปภาพเข้าใบงานนี้เรียบร้อยแล้ว");

}



async function loadTicketPhotos(ticketNo) {

  if (!ticketNo) return;

  try {

    const res = await fetch(`/api/photos/${ticketNo}`);

    let serverPhotos = [];

    if (res.ok) {

      serverPhotos = await res.json();

    }



    // If active instance is PHOTO_REPORT and has no photos yet, assign server photos to it

    const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

    if (activeInst && activeInst.code === "PHOTO_REPORT") {

      if (!activeInst.data) activeInst.data = {};

      if ((!activeInst.data.photos || activeInst.data.photos.length === 0) && serverPhotos.length > 0) {

        activeInst.data.photos = serverPhotos;

      }

      state.activePhotoReportPhotos = activeInst.data.photos || [];

    } else {

      // Find first PHOTO_REPORT instance

      const photoInst = state.packageInstances.find(i => i.code === "PHOTO_REPORT");

      if (photoInst) {

        if (!photoInst.data) photoInst.data = {};

        if ((!photoInst.data.photos || photoInst.data.photos.length === 0) && serverPhotos.length > 0) {

          photoInst.data.photos = serverPhotos;

        }

      }

    }

    renderPhotoGallery();

  } catch (e) {

    console.error(e);

  }

}



function renderPhotoGallery() {

  const gallery = document.getElementById("photoGallery");

  if (!gallery) return;



  const photos = state.activePhotoReportPhotos || [];

  const countEl = document.getElementById("photoCount");

  if (countEl) countEl.innerText = photos.length;



  if (photos.length === 0) {

    gallery.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-slate-400">ยังไม่มีรูปภาพในใบงานนี้ (ถ่ายภาพหรือลากรูปภาพใส่กล่องด้านบนเพื่ออัปโหลด)</div>`;

    return;

  }



  gallery.innerHTML = photos.map((p, idx) => `

    <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col group hover:border-purple-400 transition">

      <div class="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">

        <img src="${p.url}" alt="${p.caption || ''}" class="w-full h-full object-cover">

        <span class="absolute top-2 left-2 bg-slate-900/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">

          ${p.category || 'ทั่วไป'}

        </span>

        <button type="button" onclick="deletePhoto('${p.id}')" title="ลบภาพนี้" class="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow cursor-pointer">

          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>

        </button>

      </div>

      <div class="p-3 flex-1 flex flex-col justify-between space-y-2 bg-slate-50/50">

        <div class="flex items-center space-x-1.5">

          <span class="text-[11px] font-bold text-slate-700 whitespace-nowrap">Figure :</span>

          <input type="text" id="photo_fig_${p.id}" value="${p.figure || (idx + 1)}" onchange="updatePhotoField('${p.id}', 'figure', this.value)" class="w-16 p-1 border rounded text-xs font-bold text-center bg-white border-slate-300 focus:border-purple-500">

        </div>

        <div>

          <label class="block text-[10px] font-medium text-slate-500 mb-0.5">Description :</label>

          <textarea id="photo_caption_${p.id}" rows="2" onchange="updatePhotoField('${p.id}', 'caption', this.value)" placeholder="คำอธิบายภาพ..." class="w-full p-1.5 border rounded text-xs bg-white border-slate-300 focus:border-purple-500 resize-none leading-tight">${p.caption || ""}</textarea>

        </div>

      </div>

    </div>

  `).join("");



  initIcons();

}



function updatePhotoField(photoId, field, val) {

  if (!state.activePhotoReportPhotos) return;

  const p = state.activePhotoReportPhotos.find(item => item.id === photoId);

  if (p) {

    p[field] = val;

  }

  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  if (activeInst && activeInst.data) {

    activeInst.data.photos = JSON.parse(JSON.stringify(state.activePhotoReportPhotos));

  }

}



async function deletePhoto(photoId) {

  if (!confirm("ยืนยันลบรูปภาพนี้ใช่หรือไม่?")) return;

  state.activePhotoReportPhotos = (state.activePhotoReportPhotos || []).filter(p => p.id !== photoId);

  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  if (activeInst && activeInst.data) {

    activeInst.data.photos = JSON.parse(JSON.stringify(state.activePhotoReportPhotos));

  }

  renderPhotoGallery();

  showToast("ลบรูปภาพออกจากใบงานนี้แล้ว");

}



// =============================================================================

// BOM & INSPECTION SPEC SELECTION

// =============================================================================

async function loadBOMOptions() {

  try {

    const inspRes = await fetch("/api/bom/inspection/models");

    if (inspRes.ok) {

      const inspData = await inspRes.json();

      state.vikingModels = inspData.all_models || [];

      const datalist = document.getElementById("vikingModelDatalist");

      if (datalist) {

        const uniqueModels = Array.from(new Set([...(inspData.popular_models || []), ...(inspData.all_models || [])]));

        datalist.innerHTML = uniqueModels.map(m => `<option value="${m}">`).join("");

      }

      const partsDatalist = document.getElementById("partsModelDatalist");

      if (partsDatalist) {

        const uniqueModels = Array.from(new Set([...(inspData.popular_models || []), ...(inspData.all_models || [])]));

        partsDatalist.innerHTML = uniqueModels.map(m => `<option value="${m}">`).join("");

      }

    }

  } catch (e) {

    console.error("Error loading inspection models:", e);

  }



  try {

    const res = await fetch("/api/bom/goulds/groups");

    if (res.ok) {

      state.gouldsGroups = await res.json();

    }

  } catch (e) {

    console.error("Error loading Goulds groups:", e);

  }



  onPartsBrandChange();

}



function onBrandChange() {

  const brand = document.getElementById("inspBrandSelect")?.value || "VIKING";

  const customContainer = document.getElementById("inspCustomBrandContainer");

  const customInput = document.getElementById("inspBrandCustomInput");

  const modelInput = document.getElementById("inspModelInput");

  const helpText = document.getElementById("inspModelHelpText");

  const sheetBrandInput = document.getElementById("insp_sheet_brand");

  const btnText = document.getElementById("btnLoadInspText");



  if (brand === "OTHER") {

    if (customContainer) customContainer.classList.remove("hidden");

    if (modelInput) {

      modelInput.placeholder = "กรอกรุ่นปั๊มเอง (Model / Type)...";

      modelInput.removeAttribute("list");

    }

    if (helpText) helpText.innerText = "ปั๊มไม่มีข้อมูลในระบบ สามารถกรอกยี่ห้อ รุ่น และลงขนาดวัดเองได้ตามต้องการ";

    if (sheetBrandInput && customInput) sheetBrandInput.value = customInput.value.trim() || "";

    if (btnText) btnText.innerText = "เปิดฟอร์มลงขนาดเอง";

  } else if (brand === "VIKING") {

    if (customContainer) customContainer.classList.add("hidden");

    if (modelInput) {

      modelInput.placeholder = "พิมพ์หรือเลือกรุ่น เช่น H4124A, LL124A, KS157B...";

      modelInput.setAttribute("list", "vikingModelDatalist");

    }

    if (helpText) helpText.innerText = "พิมพ์เลือกรุ่นจากฐานข้อมูล 260+ PIR Models";

    if (sheetBrandInput) sheetBrandInput.value = "VIKING";

    if (btnText) btnText.innerText = "ดึงเกณฑ์มาตรฐาน";

  } else if (brand === "GOULDS") {

    if (customContainer) customContainer.classList.add("hidden");

    if (modelInput) {

      modelInput.placeholder = "เช่น 3196 Small, 3196 Medium...";

      modelInput.removeAttribute("list");

    }

    if (helpText) helpText.innerText = "Goulds 3196 i-FRAME";

    if (sheetBrandInput) sheetBrandInput.value = "GOULDS";

    if (btnText) btnText.innerText = "ดึงเกณฑ์มาตรฐาน";

  }

}



function onCustomBrandInput(val) {

  const sheetBrandInput = document.getElementById("insp_sheet_brand");

  if (sheetBrandInput) {

    sheetBrandInput.value = val.trim();

  }

}



function onInspSheetBrandChange(val) {

  const brandSelect = document.getElementById("inspBrandSelect");

  const customInput = document.getElementById("inspBrandCustomInput");

  if (!val) return;

  const upper = val.trim().toUpperCase();

  if (upper === "VIKING") {

    if (brandSelect) { brandSelect.value = "VIKING"; onBrandChange(); }

  } else if (upper === "GOULDS") {

    if (brandSelect) { brandSelect.value = "GOULDS"; onBrandChange(); }

  } else {

    if (brandSelect) { brandSelect.value = "OTHER"; onBrandChange(); }

    if (customInput) customInput.value = val.trim();

  }

}



function onModelInputChange(val) {

  const brand = document.getElementById("inspBrandSelect")?.value || "VIKING";

  if (val && val.trim() && brand !== "OTHER") {

    loadInspectionSpecsForCurrentModel(val.trim());

  }

}



function onInspSheetModelChange(val) {

  if (val && val.trim()) {

    const modelInput = document.getElementById("inspModelInput");

    if (modelInput && !modelInput.value) {

      modelInput.value = val.trim();

    }

  }

}



async function loadInspectionSpecsForCurrentModel(modelName) {

  const brand = document.getElementById("inspBrandSelect")?.value || "VIKING";

  const customBrand = document.getElementById("inspBrandCustomInput")?.value?.trim() || "";

  let m = modelName;

  if (!m) {

    m = document.getElementById("inspModelInput")?.value?.trim() || 

        document.getElementById("insp_sheet_model")?.value?.trim() || 

        "";

  }



  // If brand is OTHER or user has a custom pump without DB

  if (brand === "OTHER") {

    const dispBrand = customBrand || "ปั๊มระบุเอง";

    const dispModel = m || "-";

    state.currentInspRows = INSP_DEFAULT_ROWS.map(r => ({

      part: r.part,

      pos: r.pos,

      std_in: "-",

      std_mm: "-",

      cmp: "",

      val_mm: null,

      val_in: null,

      in_a: "-",

      in_b: "-",

      final_a: "-",

      final_b: "-",

      remark: ""

    }));

    state.currentInspModel = dispModel;

    state.currentInspPIR = `ปั๊ม ${dispBrand} (ไม่มีในฐานข้อมูล - บันทึกขนาดเอง)`;



    const lblModel = document.getElementById("lblActiveInspModel");

    const lblPIR = document.getElementById("lblActiveInspPIR");

    if (lblModel) lblModel.innerText = state.currentInspModel;

    if (lblPIR) lblPIR.innerText = state.currentInspPIR;



    const sheetBrandInput = document.getElementById("insp_sheet_brand");

    if (sheetBrandInput && !sheetBrandInput.value) sheetBrandInput.value = dispBrand;

    const sheetModelInput = document.getElementById("insp_sheet_model");

    if (sheetModelInput && m && !sheetModelInput.value) sheetModelInput.value = m;



    renderInspectionTable();

    showToast(`เปิดฟอร์มสำหรับ ${dispBrand} เรียบร้อย (ลงขนาดวัดเอง)`, "info");

    return;

  }



  if (!m) {

    showToast("กรุณาระบุหรือเลือกรุ่นปั๊มก่อนดึงเกณฑ์มาตรฐาน", "error");

    return;

  }



  try {

    showToast("กำลังดึงเกณฑ์มาตรฐาน...", "info");

    const res = await fetch(`/api/bom/inspection/specs?model=${encodeURIComponent(m)}`);

    const data = await res.json();

    if (!data.ok || !data.rows || data.rows.length === 0) {

      // Pump not found in Viking DB: fallback cleanly to manual measurement

      state.currentInspRows = INSP_DEFAULT_ROWS.map(r => ({

        part: r.part,

        pos: r.pos,

        std_in: "-",

        std_mm: "-",

        cmp: "",

        val_mm: null,

        val_in: null,

        in_a: "-",

        in_b: "-",

        final_a: "-",

        final_b: "-",

        remark: ""

      }));

      state.currentInspModel = m;

      state.currentInspPIR = "ไม่มีข้อมูลในระบบ (บันทึกขนาดวัดเอง)";



      const lblModel = document.getElementById("lblActiveInspModel");

      const lblPIR = document.getElementById("lblActiveInspPIR");

      if (lblModel) lblModel.innerText = state.currentInspModel;

      if (lblPIR) lblPIR.innerText = state.currentInspPIR;



      const modelInput = document.getElementById("inspModelInput");

      if (modelInput) modelInput.value = m;

      const sheetModelInput = document.getElementById("insp_sheet_model");

      if (sheetModelInput && !sheetModelInput.value) sheetModelInput.value = m;



      renderInspectionTable();

      showToast(`ไม่พบข้อมูลมาตรฐานของ '${m}' — เปิดตารางให้ลงขนาดวัดเอง`, "info");

      return;

    }



    state.currentInspRows = data.rows;

    state.currentInspModel = data.model || m;

    state.currentInspPIR = data.pir_file || "-";



    // Update UI status banner

    const lblModel = document.getElementById("lblActiveInspModel");

    const lblPIR = document.getElementById("lblActiveInspPIR");

    if (lblModel) lblModel.innerText = state.currentInspModel;

    if (lblPIR) lblPIR.innerText = state.currentInspPIR;



    const modelInput = document.getElementById("inspModelInput");

    if (modelInput) modelInput.value = state.currentInspModel;



    const sheetModelInput = document.getElementById("insp_sheet_model");

    if (sheetModelInput && !sheetModelInput.value) {

      sheetModelInput.value = state.currentInspModel;

    }



    renderInspectionTable();

    showToast(`ดึงเกณฑ์มาตรฐานรุ่น ${state.currentInspModel} (${state.currentInspPIR}) สำเร็จแล้ว`);

  } catch (e) {

    console.error("Error fetching inspection specs:", e);

    showToast("เกิดข้อผิดพลาดในการดึงข้อมูลมาตรฐาน", "error");

  }

}



function syncModelFromServiceReport() {

  const srModel = document.getElementById("sr_pump_model")?.value?.trim();

  const crModel = document.getElementById("cr_sheet_model")?.value?.trim();

  const srBrand = document.getElementById("sr_pump_brand")?.value?.trim();

  const crBrand = document.getElementById("cr_pump_brand")?.value?.trim();



  const targetModel = srModel || crModel || "";

  const targetBrand = srBrand || crBrand || "";



  if (targetBrand) {

    const brandSelect = document.getElementById("inspBrandSelect");

    const customInput = document.getElementById("inspBrandCustomInput");

    const sheetBrandInput = document.getElementById("insp_sheet_brand");

    if (sheetBrandInput) sheetBrandInput.value = targetBrand;



    const upper = targetBrand.toUpperCase();

    if (upper === "VIKING") {

      if (brandSelect) { brandSelect.value = "VIKING"; onBrandChange(); }

    } else if (upper === "GOULDS") {

      if (brandSelect) { brandSelect.value = "GOULDS"; onBrandChange(); }

    } else {

      if (brandSelect) { brandSelect.value = "OTHER"; onBrandChange(); }

      if (customInput) customInput.value = targetBrand;

    }

  }



  if (!targetModel) {

    showToast(targetBrand ? `ดึงยี่ห้อ ${targetBrand} เรียบร้อย (ยังไม่มีการระบุรุ่นปั๊ม)` : "ยังไม่มีการระบุรุ่นปั๊มใน Service Report หรือ Check Report", "info");

    return;

  }

  const modelInput = document.getElementById("inspModelInput");

  if (modelInput) modelInput.value = targetModel;

  const sheetModel = document.getElementById("insp_sheet_model");

  if (sheetModel) sheetModel.value = targetModel;

  loadInspectionSpecsForCurrentModel(targetModel);

}



function loadDefaultSpecs() {

  renderInspectionTable();

  showToast("โหลดเกณฑ์มาตรฐานเรียบร้อย");

}



// =============================================================================

// FM-EPS-25: BOM PARTS CATALOG & INTERACTIVE PICKER

// =============================================================================

function onPartsBrandChange() {

  const brand = document.getElementById("partsBrandSelect")?.value || "VIKING";

  const customContainer = document.getElementById("partsCustomBrandContainer");

  const customInput = document.getElementById("partsBrandCustomInput");

  const modelInput = document.getElementById("partsModelInput");

  const helpText = document.getElementById("partsModelHelpText");

  const btnText = document.getElementById("btnLoadPartsBomText");

  const datalist = document.getElementById("partsModelDatalist");



  if (brand === "OTHER") {

    if (customContainer) customContainer.classList.remove("hidden");

    if (modelInput) {

      modelInput.placeholder = "กรอกรุ่นปั๊มเอง (Model / Type)...";

      modelInput.removeAttribute("list");

    }

    if (helpText) helpText.innerText = "ปั๊มไม่มีในฐานข้อมูล BOM สามารถระบุรายการอะไหล่ในตารางด้านล่างได้เองโดยตรง";

    if (btnText) btnText.innerText = "เปิดตารางลงรายการเอง";

  } else if (brand === "VIKING") {

    if (customContainer) customContainer.classList.add("hidden");

    if (modelInput) {

      modelInput.placeholder = "พิมพ์หรือเลือกรุ่น เช่น H4124A, KK124A, L125...";

      modelInput.setAttribute("list", "partsModelDatalist");

    }

    if (datalist && state.vikingModels && state.vikingModels.length > 0) {

      datalist.innerHTML = state.vikingModels.map(m => `<option value="${m}">`).join("");

    }

    if (helpText) helpText.innerText = "มีฐานข้อมูลอะไหล่แท้ 500+ Viking Models พร้อม Exploded View Diagram";

    if (btnText) btnText.innerText = "ดึงรายการอะไหล่ BOM";

  } else if (brand === "GOULDS") {

    if (customContainer) customContainer.classList.add("hidden");

    if (modelInput) {

      modelInput.placeholder = "เช่น 3196 STi, 3196 MTi, 3196 LTi...";

      modelInput.setAttribute("list", "partsModelDatalist");

    }

    const gouldsModels = ["3196 STi", "3196 MTi", "3196 LTi", "3196 XLT-i", "3196 i-17"];

    if (datalist) {

      datalist.innerHTML = gouldsModels.map(m => `<option value="${m}">`).join("");

    }

    if (helpText) helpText.innerText = "ฐานข้อมูลชิ้นส่วน Goulds Pumps 3196 Series";

    if (btnText) btnText.innerText = "ดึงรายการอะไหล่ BOM";

  }

}



function onPartsModelInputChange(val) {

  const sheetModel = document.getElementById("parts_sheet_model");

  if (sheetModel && !sheetModel.value && val) {

    sheetModel.value = val.trim();

  }

}



function copyHeaderToPartsFromSR() {

  const srJob = document.getElementById("sr_job_no")?.value?.trim() || "";

  const srIo = document.getElementById("sr_io_no")?.value?.trim() || "";

  const srCust = document.getElementById("sr_customer")?.value?.trim() || "-";

  const srPlant = document.getElementById("sr_plant")?.value?.trim() || "-";

  const srContact = document.getElementById("sr_contact_person")?.value?.trim() || "-";

  const srTel = document.getElementById("sr_contact_no")?.value?.trim() || "-";

  const srDate = formatIsoToDmy(document.getElementById("sr_date")?.value) || "";

  const srModel = document.getElementById("sr_pump_model")?.value?.trim() || "";

  const srSerial = document.getElementById("sr_serial_no")?.value?.trim() || "";

  const srCode = document.getElementById("sr_pump_code")?.value?.trim() || "";



  if (srJob && document.getElementById("parts_job_no") && !document.getElementById("parts_job_no").value) {

    document.getElementById("parts_job_no").value = srJob;

  }

  if (srIo && document.getElementById("parts_io_no") && !document.getElementById("parts_io_no").value) {

    document.getElementById("parts_io_no").value = srIo;

  }

  if (document.getElementById("parts_customer")) document.getElementById("parts_customer").value = srCust || "-";

  if (document.getElementById("parts_plant")) document.getElementById("parts_plant").value = srPlant || "-";

  if (document.getElementById("parts_contact_person")) document.getElementById("parts_contact_person").value = srContact || "-";

  if (document.getElementById("parts_contact_no")) document.getElementById("parts_contact_no").value = srTel || "-";



  if (document.getElementById("sat_customer") && !document.getElementById("sat_customer").value) document.getElementById("sat_customer").value = srCust || "-";

  if (document.getElementById("sat_contact_person") && !document.getElementById("sat_contact_person").value) document.getElementById("sat_contact_person").value = srContact || "-";

  if (document.getElementById("sat_contact_no") && !document.getElementById("sat_contact_no").value) document.getElementById("sat_contact_no").value = srTel || "-";

  if (document.getElementById("sat_eval_date") && !document.getElementById("sat_eval_date").value) document.getElementById("sat_eval_date").value = document.getElementById("sr_date")?.value || "";

  if (srDate && document.getElementById("parts_sheet_date") && !document.getElementById("parts_sheet_date").value) {

    document.getElementById("parts_sheet_date").value = srDate;

  }

  if (srModel && document.getElementById("parts_sheet_model") && !document.getElementById("parts_sheet_model").value) {

    document.getElementById("parts_sheet_model").value = srModel;

  }

  if (srSerial && document.getElementById("parts_sheet_serial") && !document.getElementById("parts_sheet_serial").value) {

    document.getElementById("parts_sheet_serial").value = srSerial;

  }

  if (srCode && document.getElementById("parts_sheet_code") && !document.getElementById("parts_sheet_code").value) {

    document.getElementById("parts_sheet_code").value = srCode;

  }

  showToast("คัดลอกข้อมูลหัวกระดาษจาก Service Report เรียบร้อยแล้ว (สามารถแก้ไขได้ตามต้องการ)");

}



function syncModelToPartsFromSR() {

  const srModel = document.getElementById("sr_pump_model")?.value?.trim() || "";

  const crModel = document.getElementById("cr_sheet_model")?.value?.trim() || "";

  const inspModel = document.getElementById("insp_sheet_model")?.value?.trim() || "";



  const srBrand = document.getElementById("sr_pump_brand")?.value?.trim() || "";

  const crBrand = document.getElementById("cr_pump_brand")?.value?.trim() || "";

  const inspBrand = document.getElementById("insp_sheet_brand")?.value?.trim() || "";



  const srSerial = document.getElementById("sr_serial_no")?.value?.trim() || "";

  const crSerial = document.getElementById("cr_sheet_serial")?.value?.trim() || "";

  const inspSerial = document.getElementById("insp_sheet_serial")?.value?.trim() || "";



  const srCode = document.getElementById("sr_pump_code")?.value?.trim() || "";

  const crCode = document.getElementById("cr_sheet_code")?.value?.trim() || "";

  const inspCode = document.getElementById("insp_sheet_code")?.value?.trim() || "";



  const targetModel = srModel || crModel || inspModel || "";

  const targetBrand = srBrand || crBrand || inspBrand || "";

  const targetSerial = srSerial || crSerial || inspSerial || "";

  const targetCode = srCode || crCode || inspCode || "";



  if (targetSerial && document.getElementById("parts_sheet_serial")) {

    document.getElementById("parts_sheet_serial").value = targetSerial;

  }

  if (targetCode && document.getElementById("parts_sheet_code")) {

    document.getElementById("parts_sheet_code").value = targetCode;

  }

  if (targetModel && document.getElementById("parts_sheet_model")) {

    document.getElementById("parts_sheet_model").value = targetModel;

  }



  if (targetBrand) {

    const brandSelect = document.getElementById("partsBrandSelect");

    const customInput = document.getElementById("partsBrandCustomInput");

    const upper = targetBrand.toUpperCase();

    if (upper === "VIKING") {

      if (brandSelect) { brandSelect.value = "VIKING"; onPartsBrandChange(); }

    } else if (upper === "GOULDS") {

      if (brandSelect) { brandSelect.value = "GOULDS"; onPartsBrandChange(); }

    } else {

      if (brandSelect) { brandSelect.value = "OTHER"; onPartsBrandChange(); }

      if (customInput) customInput.value = targetBrand;

    }

  }



  if (targetModel) {

    const modelInput = document.getElementById("partsModelInput");

    if (modelInput) modelInput.value = targetModel;

    loadBomPartsForCurrentModel(targetModel);

  } else {

    showToast(targetBrand ? `ดึงข้อมูลยี่ห้อ ${targetBrand} เรียบร้อย (กรุณาระบุรุ่นปั๊ม)` : "ยังไม่มีข้อมูลปั๊มในรายงานหน้าหลัก", "info");

  }

}



async function loadBomPartsForCurrentModel(modelName) {

  const brand = document.getElementById("partsBrandSelect")?.value || "VIKING";

  const customBrand = document.getElementById("partsBrandCustomInput")?.value?.trim() || "";

  let m = modelName;

  if (!m) {

    m = document.getElementById("partsModelInput")?.value?.trim() || 

        document.getElementById("parts_sheet_model")?.value?.trim() || 

        "";

  }



  if (brand === "OTHER") {

    closeBomCatalogCard();

    const sheetModelInput = document.getElementById("parts_sheet_model");

    if (sheetModelInput && m && !sheetModelInput.value) sheetModelInput.value = m;

    showToast(`โหมดระบุเอง: ท่านสามารถพิมพ์รายการอะไหล่ในตารางด้านล่างได้ทันที`, "info");

    return;

  }



  if (!m) {

    showToast("กรุณาระบุหรือเลือกรุ่นปั๊มก่อนดึงรายการอะไหล่ BOM", "error");

    return;

  }



  try {

    showToast(`กำลังดึงรายการอะไหล่ BOM สำหรับ ${m}...`, "info");

    const res = await fetch(`/api/bom/parts?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(m)}`);

    const data = await res.json();



    if (!data.ok || !data.parts || data.parts.length === 0) {

      showToast(`ไม่พบข้อมูล BOM ของรุ่น '${m}' สามารถพิมพ์รายการอะไหล่ในตารางเองได้`, "error");

      closeBomCatalogCard();

      return;

    }



    state.bomPartsCatalog = data.parts || [];

    state.currentBomModel = data.model || m;

    state.currentBomDiagram = data.diagram || "";



    const card = document.getElementById("bomPartsCatalogCard");

    if (card) card.classList.remove("hidden");



    const titleEl = document.getElementById("lblBomCatalogTitle");

    if (titleEl) titleEl.innerText = `${brand} ${state.currentBomModel}` + (data.source ? ` (${data.source})` : "");



    const countEl = document.getElementById("lblBomPartsCountBadge");

    if (countEl) countEl.innerText = `${state.bomPartsCatalog.length} รายการ`;



    const btnDiag = document.getElementById("btnToggleBomDiagram");

    if (btnDiag) {

      if (state.currentBomDiagram) {

        btnDiag.classList.remove("hidden");

      } else {

        btnDiag.classList.add("hidden");

      }

    }



    const sheetModelInput = document.getElementById("parts_sheet_model");

    if (sheetModelInput && !sheetModelInput.value) {

      sheetModelInput.value = state.currentBomModel;

    }



    const searchInput = document.getElementById("bomSearchInput");

    if (searchInput) searchInput.value = "";



    renderBomPartsTable();

    initIcons();

    showToast(`ดึงรายการ BOM สำเร็จ (${state.bomPartsCatalog.length} รายการ)`, "success");



  } catch (e) {

    console.error("Error loading BOM parts:", e);

    showToast("เกิดข้อผิดพลาดในการโหลดรายการ BOM", "error");

  }

}



function closeBomCatalogCard() {

  const card = document.getElementById("bomPartsCatalogCard");

  if (card) card.classList.add("hidden");

}



function filterBomPartsList(filterText) {

  renderBomPartsTable(filterText);

}



function renderBomPartsTable(filterText = "") {

  const tbody = document.getElementById("bomPartsTbody");

  if (!tbody) return;



  const q = (filterText || "").trim().toLowerCase();

  const filtered = state.bomPartsCatalog.filter(p => {

    if (!q) return true;

    const itemNo = String(p.item || p.item_no || "").toLowerCase();

    const partNo = String(p.part_no || "").toLowerCase();

    const desc = String(p.desc || p.description || "").toLowerCase();

    const mat = String(p.material || "").toLowerCase();

    return itemNo.includes(q) || partNo.includes(q) || desc.includes(q) || mat.includes(q);

  });



  if (filtered.length === 0) {

    tbody.innerHTML = `

      <tr>

        <td colspan="7" class="p-6 text-center text-slate-400 italic">

          ไม่พบรายการชิ้นส่วนที่ตรงกับ "${filterText}"

        </td>

      </tr>

    `;

    return;

  }



  tbody.innerHTML = filtered.map(item => {

    const realIndex = state.bomPartsCatalog.indexOf(item);

    const itemNo = item.item || item.item_no || "-";

    const partNo = item.part_no || "-";

    const desc = item.desc || item.description || "-";

    const mat = item.material || "";

    const qty = item.qty || 1;

    const price = item.price || 0;



    const fullDesc = mat ? `${desc} (${mat})` : desc;

    const isAdded = state.parts.some(p => {

      if (partNo && partNo !== "-" && p.part_no) {

        return p.part_no.trim() === partNo.trim();

      }

      return p.description && p.description.trim() === fullDesc.trim();

    });



    const matBadge = mat ? `<span class="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">${mat}</span>` : "-";

    const priceDisplay = (price && Number(price) > 0) ? `${Number(price).toLocaleString()} ฿` : "";



    return `

      <tr class="hover:bg-red-50/30 transition border-b border-slate-100">

        <td class="p-2 text-center font-mono font-bold text-slate-600 text-xs">${itemNo}</td>

        <td class="p-2 font-mono font-semibold text-slate-800 text-xs">${partNo}</td>

        <td class="p-2 text-slate-800 font-medium text-xs">${desc}</td>

        <td class="p-2 text-center text-xs">${matBadge}</td>

        <td class="p-2 text-center font-mono text-xs">${qty}</td>

        <td class="p-2 text-right font-mono text-xs">${priceDisplay}</td>

        <td class="p-2 text-center">

          ${isAdded ? `

            <button type="button" onclick="addPartFromBom(${realIndex})" class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded font-semibold text-[11px] transition shadow-xs cursor-pointer flex items-center justify-center space-x-1 mx-auto" title="คลิกเพื่อเพิ่มจำนวน">

              <span>✔ เลือกแล้ว</span>

              <span class="text-[9px] text-emerald-600 font-bold">+</span>

            </button>

          ` : `

            <button type="button" onclick="addPartFromBom(${realIndex})" class="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[11px] transition shadow-sm cursor-pointer mx-auto flex items-center justify-center space-x-1">

              <i data-lucide="plus" class="w-3.5 h-3.5"></i>

              <span>+ เลือก</span>

            </button>

          `}

        </td>

      </tr>

    `;

  }).join("");



  initIcons();

}



function addPartFromBom(bomIndex) {

  const item = state.bomPartsCatalog[bomIndex];

  if (!item) return;



  const itemNo = item.item || item.item_no || "";

  const partNo = (item.part_no && item.part_no !== "-") ? item.part_no : (itemNo ? `ITEM-${itemNo}` : "");

  const desc = item.desc || item.description || "";

  const mat = item.material || "";

  const fullDesc = mat ? `${desc} (${mat})` : desc;



  // Check if item already exists in state.parts; if so, increase qty

  const existingIdx = state.parts.findIndex(p => {

    if (partNo && p.part_no && p.part_no === partNo) return true;

    return p.description === fullDesc;

  });



  if (existingIdx >= 0) {

    state.parts[existingIdx].qty = (Number(state.parts[existingIdx].qty) || 1) + 1;

    showToast(`เพิ่มจำนวน "${desc}" เป็น ${state.parts[existingIdx].qty} ชิ้น`, "info");

  } else {

    state.parts.push({

      part_no: partNo,

      description: fullDesc,

      qty: item.qty || 1,

      price: (item.price && Number(item.price) > 0) ? item.price : "",

      supplier: "-",

      sent_date: "-",

      finished_date: "-"

    });

    showToast(`เพิ่ม "${desc}" ลงในรายการเปลี่ยนชิ้นส่วนแล้ว`, "success");

  }



  renderPartsTable();

  const searchInput = document.getElementById("bomSearchInput");

  renderBomPartsTable(searchInput ? searchInput.value : "");

}



function toggleBomDiagramModal() {

  const modal = document.getElementById("bomDiagramModal");

  if (!modal) return;



  if (modal.classList.contains("hidden")) {

    if (!state.currentBomDiagram) {

      showToast("ไม่มีรูป Diagram ผังประกอบสำหรับรุ่นนี้", "info");

      return;

    }

    const img = document.getElementById("bomDiagramModalImg");

    const title = document.getElementById("bomDiagramModalTitle");

    const diagramUrl = state.currentBomDiagram.startsWith("/") ? state.currentBomDiagram : `/api/bom/diagram/${state.currentBomDiagram}`;

    if (img) img.src = diagramUrl;

    if (title) title.innerText = `ผังประกอบอะไหล่ (Exploded View): ${state.currentBomModel}`;

    modal.classList.remove("hidden");

    initIcons();

  } else {

    modal.classList.add("hidden");

  }

}



// =============================================================================

// COLLECT FORM PAYLOAD

// =============================================================================

function collectReportData() {

  saveCurrentActiveInstanceData();

  const ticketNo = document.getElementById("sr_request_no")?.value.trim() || "DRAFT";



  // Visual Checklist

  const visualChecklist = VISUAL_ITEMS.map((item, idx) => {

    const selected = document.querySelector(`input[name="vis_check_${idx}"]:checked`)?.value || "normal";

    const remark = document.getElementById(`vis_rem_${idx}`)?.value || "";

    const note = document.getElementById(`vis_note_${idx}`)?.value || "";

    return { item, status: selected, remark, note };

  });



  // Alignment

  const alignment = {

    check_radial: {

      "0": document.getElementById("al_c_r_0")?.value || "",

      "90": document.getElementById("al_c_r_90")?.value || "",

      "180": document.getElementById("al_c_r_180")?.value || "",

      "270": document.getElementById("al_c_r_270")?.value || ""

    },

    check_x: {

      "0": document.getElementById("al_c_x_0")?.value || "",

      "90": document.getElementById("al_c_x_90")?.value || "",

      "180": document.getElementById("al_c_x_180")?.value || "",

      "270": document.getElementById("al_c_x_270")?.value || ""

    },

    reset_radial: {

      "0": document.getElementById("al_r_r_0")?.value || "",

      "90": document.getElementById("al_r_r_90")?.value || "",

      "180": document.getElementById("al_r_r_180")?.value || "",

      "270": document.getElementById("al_r_r_270")?.value || ""

    },

    reset_x: {

      "0": document.getElementById("al_r_x_0")?.value || "",

      "90": document.getElementById("al_r_x_90")?.value || "",

      "180": document.getElementById("al_r_x_180")?.value || "",

      "270": document.getElementById("al_r_x_270")?.value || ""

    },

    sv_gauge: document.getElementById("al_sv_gauge")?.value || "",

    note: document.getElementById("al_note")?.value || ""

  };



  // Vibration

  const vibration = {

    meter_sv: document.getElementById("vb_meter_sv")?.value || "",

    thermometer_sv: document.getElementById("vb_thermometer_sv")?.value || "",

    pump: {

      dh: document.getElementById("vb_p_dh")?.value || "",

      dv: document.getElementById("vb_p_dv")?.value || "",

      da: document.getElementById("vb_p_da")?.value || "",

      nh: document.getElementById("vb_p_nh")?.value || "",

      nv: document.getElementById("vb_p_nv")?.value || "",

      na: document.getElementById("vb_p_na")?.value || "",

      t_de: document.getElementById("vb_p_tde")?.value || "",

      t_nde: document.getElementById("vb_p_tnde")?.value || ""

    },

    motor: {

      dh: document.getElementById("vb_m_dh")?.value || "",

      dv: document.getElementById("vb_m_dv")?.value || "",

      da: document.getElementById("vb_m_da")?.value || "",

      nh: document.getElementById("vb_m_nh")?.value || "",

      nv: document.getElementById("vb_m_nv")?.value || "",

      na: document.getElementById("vb_m_na")?.value || "",

      t_de: document.getElementById("vb_m_tde")?.value || "",

      t_nde: document.getElementById("vb_m_tnde")?.value || ""

    },

    gear: {

      dh: document.getElementById("vb_g_dh")?.value || "",

      dv: document.getElementById("vb_g_dv")?.value || "",

      da: document.getElementById("vb_g_da")?.value || "",

      nh: document.getElementById("vb_g_nh")?.value || "",

      nv: document.getElementById("vb_g_nv")?.value || "",

      na: document.getElementById("vb_g_na")?.value || "",

      t_de: document.getElementById("vb_g_tde")?.value || "",

      t_nde: document.getElementById("vb_g_tnde")?.value || ""

    }

  };



  // Operation

  const operation = {

    ins_u: document.getElementById("op_ins_u")?.value || "",

    ins_v: document.getElementById("op_ins_v")?.value || "",

    ins_w: document.getElementById("op_ins_w")?.value || "",

    cur_u: document.getElementById("op_cur_u")?.value || "",

    cur_v: document.getElementById("op_cur_v")?.value || "",

    cur_w: document.getElementById("op_cur_w")?.value || "",

    vol_uv: document.getElementById("op_vol_uv")?.value || "",

    vol_uw: document.getElementById("op_vol_uw")?.value || "",

    vol_vw: document.getElementById("op_vol_vw")?.value || "",

    speed: document.getElementById("op_speed")?.value || ""

  };



  // FM-EPS-45 Satisfaction Ratings

  const ratings = {};

  let satTotal = 0;

  ALL_SAT_ITEMS.forEach(it => {

    const checked = document.querySelector(`input[name="sat_${it.id}"]:checked`);

    const val = checked ? parseInt(checked.value, 10) : 4;

    ratings[it.id] = val;

    satTotal += val;

  });



  // Inspection measurements

  const rows = (state.currentInspRows && state.currentInspRows.length > 0) ? state.currentInspRows : INSP_DEFAULT_ROWS;

  const measurements = rows.map((row, idx) => ({

    part_name: row.part,

    position: row.pos,

    std_in: row.std_in || "",

    std_mm: row.std_mm || "",

    std_min: row.min || (row.val_mm ? row.val_mm.toString() : "-"),

    std_max: row.max || (row.val_mm ? row.val_mm.toString() : "-"),

    cmp: row.cmp || "",

    val_mm: row.val_mm || null,

    val_in: row.val_in || null,

    in_a: document.getElementById(`insp_in_a_${idx}`)?.value || "",

    in_b: document.getElementById(`insp_in_b_${idx}`)?.value || "",

    final_a: document.getElementById(`insp_fi_a_${idx}`)?.value || "",

    final_b: document.getElementById(`insp_fi_b_${idx}`)?.value || "",

    result: document.getElementById(`insp_badge_${idx}`)?.innerText || "PASS",

    remark: document.getElementById(`insp_rem_${idx}`)?.value || ""

  }));



  // Signatures

  let techSignB64 = "";

  let custSignB64 = "";

  if (state.techPad && !state.techPad.isEmpty()) techSignB64 = state.techPad.toDataURL();

  if (state.custPad && !state.custPad.isEmpty()) custSignB64 = state.custPad.toDataURL();



  return {

    request_no: ticketNo,

    date: document.getElementById("sr_date")?.value || "",

    customer: document.getElementById("sr_customer")?.value?.trim() || "-",

    plant: document.getElementById("sr_plant")?.value?.trim() || "-",

    contact_person: document.getElementById("sr_contact_person")?.value?.trim() || "-",

    contact_no: document.getElementById("sr_contact_no")?.value?.trim() || "-",

    pump_brand: document.getElementById("sr_pump_brand")?.value || document.getElementById("cr_pump_brand")?.value || "VIKING",

    pump_model: document.getElementById("sr_pump_model")?.value || document.getElementById("cr_sheet_model")?.value || "",

    serial_no: document.getElementById("sr_serial_no")?.value || document.getElementById("cr_sheet_serial")?.value || "",

    pump_code: document.getElementById("sr_pump_code")?.value || document.getElementById("cr_sheet_code")?.value || "",

    motor_brand: document.getElementById("sr_motor_brand")?.value || document.getElementById("cr_motor_brand")?.value || "",

    motor_kw: document.getElementById("sr_motor_kw")?.value || document.getElementById("cr_motor_kw")?.value || "",

    motor_rpm: document.getElementById("sr_motor_rpm")?.value || document.getElementById("cr_motor_rpm")?.value || "",

    motor_max_amp: document.getElementById("sr_motor_max_amp")?.value || document.getElementById("cr_motor_max_amp")?.value || "",

    gear_brand: document.getElementById("sr_gear_brand")?.value || document.getElementById("cr_gear_brand")?.value || "",

    gear_ratio: document.getElementById("sr_gear_ratio")?.value || document.getElementById("cr_gear_ratio")?.value || "",

    gear_model: document.getElementById("sr_gear_model")?.value || document.getElementById("cr_gear_model")?.value || "",

    gear_serial: document.getElementById("sr_gear_serial")?.value || document.getElementById("cr_gear_serial")?.value || "",

    

    // FM-EPS-23 Service Report

    service_subjects: Array.from(document.querySelectorAll('input[name="sr_subject"]:checked')).map(el => el.value),

    subject_other: document.getElementById("sr_subject_other")?.value || "",

    problem_ticks: Array.from(document.querySelectorAll('input[name="sr_problem"]:checked')).map(el => el.value),

    problem_etc: document.getElementById("sr_problem_etc")?.value || "",

    cause: document.getElementById("sr_cause")?.value || "",

    cause_ref_check: document.getElementById("sr_cause_ref_check")?.checked || false,

    cause_ref: document.getElementById("sr_cause_ref")?.value || "",

    repairing: document.getElementById("sr_repairing")?.value || "",

    repairing_ref_check: document.getElementById("sr_repairing_ref_check")?.checked || false,

    repairing_ref: document.getElementById("sr_repairing_ref")?.value || "",

    prevention_ticks: Array.from(document.querySelectorAll('input[name="sr_prev"]:checked')).map(el => el.value),

    prevention_other: document.getElementById("sr_prevention_other")?.value || "",

    prev_ref_check: document.getElementById("sr_prev_ref_check")?.checked || false,

    prev_ref: document.getElementById("sr_prev_ref")?.value || "",

    test_result: document.querySelector('input[name="sr_test_result"]:checked')?.value || "test_run",

    test_run_detail: document.getElementById("sr_test_run_detail")?.value || "",

    no_test_run_detail: document.getElementById("sr_no_test_run_detail")?.value || "",

    service_again_detail: document.getElementById("sr_service_again_detail")?.value || "",

    return_shop_detail: document.getElementById("sr_return_shop_detail")?.value || "",

    test_other_detail: document.getElementById("sr_test_other_detail")?.value || "",

    test_ref_check: document.getElementById("sr_test_ref_check")?.checked || false,

    test_ref: document.getElementById("sr_test_ref")?.value || "",



    // Signatures & Timing

    cr_date: document.getElementById("cr_date")?.value || "",

    cr_serviced_date: document.getElementById("cr_serviced_date")?.value || "",

    cr_time_start: document.getElementById("cr_time_start")?.value || "",

    cr_time_finished: document.getElementById("cr_time_finished")?.value || "",

    recommendation: document.getElementById("cr_recommendation")?.value || "",

    serviced_by: document.getElementById("techSignerName")?.value || "-",

    serviced_date: document.getElementById("sr_serviced_date")?.value || formatIsoToDmy(document.getElementById("sr_date")?.value) || "",

    time_start: document.getElementById("sr_time_start")?.value || "",

    time_finished: document.getElementById("sr_time_finished")?.value || "",

    customer_signer_name: document.getElementById("custSignerName")?.value || "",

    customer_signer_position: document.getElementById("custSignerPosition")?.value || "",

    customer_sign_date: document.getElementById("cust_sign_date")?.value || "",

    sign_tech: techSignB64,

    sign_customer: custSignB64,

    visual_checklist: visualChecklist,

    alignment: alignment,

    vibration: vibration,

    operation: operation,

    ratings: ratings,

    sat_total_score: satTotal,

    sat_max_score: 56,

    sat_customer: document.getElementById("sat_customer")?.value?.trim() || document.getElementById("sr_customer")?.value?.trim() || "-",

    sat_contact_person: document.getElementById("sat_contact_person")?.value?.trim() || document.getElementById("sr_contact_person")?.value?.trim() || "-",

    sat_contact_no: document.getElementById("sat_contact_no")?.value?.trim() || document.getElementById("sr_contact_no")?.value?.trim() || "-",

    sat_eval_date: document.getElementById("sat_eval_date")?.value?.trim() || document.getElementById("sr_date")?.value?.trim() || "",

    suggestions: document.getElementById("sat_suggestions")?.value || "",

    measurements: measurements,

    measuring_with: (() => {

      let mw = document.getElementById("insp_measuring_with")?.value || "Vernier Caliper";

      if (!mw || mw.includes("Bore Gauge")) mw = "Vernier Caliper";

      return mw;

    })(),

    tech_incoming_name: document.getElementById("insp_tech_incoming")?.value || "",

    tech_final_name: document.getElementById("insp_tech_final")?.value || "",

    approve_incoming_name: document.getElementById("insp_approve_incoming")?.value || "",

    approve_final_name: document.getElementById("insp_approve_final")?.value || "",

    parts: state.parts,

    parts_job_no: document.getElementById("parts_job_no")?.value?.trim() || "",

    parts_io_no: document.getElementById("parts_io_no")?.value?.trim() || "",

    parts_customer: document.getElementById("parts_customer")?.value?.trim() || document.getElementById("sr_customer")?.value?.trim() || "-",

    parts_plant: document.getElementById("parts_plant")?.value?.trim() || document.getElementById("sr_plant")?.value?.trim() || "-",

    parts_contact_person: document.getElementById("parts_contact_person")?.value?.trim() || document.getElementById("sr_contact_person")?.value?.trim() || "-",

    parts_contact_no: document.getElementById("parts_contact_no")?.value?.trim() || document.getElementById("sr_contact_no")?.value?.trim() || "-",

    parts_sheet_date: document.getElementById("parts_sheet_date")?.value?.trim() || "",

    parts_sheet_model: document.getElementById("parts_sheet_model")?.value?.trim() || "",

    parts_sheet_serial: document.getElementById("parts_sheet_serial")?.value?.trim() || "",

    parts_sheet_code: document.getElementById("parts_sheet_code")?.value?.trim() || "",

    sale_name: document.getElementById("parts_sale_name")?.value || "",

    receiver_name: document.getElementById("parts_receiver_name")?.value || "",

    receive_date: document.getElementById("parts_receive_date")?.value || "",

    due_date: document.getElementById("parts_due_date")?.value || "",

    delivery_date: document.getElementById("parts_delivery_date")?.value || "",

    test_pump_note: document.getElementById("parts_test_pump_note")?.value || "",

    show_prices: document.getElementById("toggleShowPrices")?.checked || false,

    photos: state.photos,

    form_instances: state.packageInstances,

    active_instance_id: state.activeInstanceId

  };

}



// =============================================================================

// SAVE DRAFT & SUBMIT & PREVIEWS

// =============================================================================

async function previewCurrentActiveForm() {

  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  if (!activeInst) {

    alert("กรุณาเลือกใบงานที่ต้องการพรีวิว");

    return;

  }

  saveCurrentActiveInstanceData();

  const ticketNo = document.getElementById("sr_request_no")?.value.trim() || state.currentTicket?.TicketNo;

  if (!ticketNo) {

    alert("กรุณาระบุเลขที่ใบงาน (Ticket No.)");

    return;

  }



  if (activeInst.code === "PHOTO_REPORT") {

    await previewPhotoReportPdf();

    return;

  }



  showToast(`กำลังสร้างพรีวิว ${activeInst.title || activeInst.code}...`);



  try {

    const data = collectReportData();

    const res = await fetch("/api/reports/submit", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        ticket_no: ticketNo,

        data: data,

        generate_forms: [activeInst.code],

        form_instances: [activeInst]

      })

    });

    const result = await res.json();

    if (result.ok && result.generated_files) {

      const formKey = Object.keys(result.generated_files).find(k => k.startsWith(activeInst.code));

      const url = result.generated_files[formKey] || Object.values(result.generated_files)[0];

      if (url) {

        openPdfModal(`พรีวิว: ${activeInst.title || activeInst.code} - ${ticketNo}`, url + `?t=${Date.now()}`);

      } else {

        showToast("ไม่พบไฟล์พรีวิว");

      }

    }

  } catch (e) {

    showToast("เกิดข้อผิดพลาดในการพรีวิว: " + e.message);

  }

}



async function previewFullPackagePdf() {

  if (!state.packageInstances || state.packageInstances.length === 0) {

    alert("กรุณาเพิ่มใบงานอย่างน้อย 1 ใบก่อนพรีวิวรวมชุด");

    return;

  }

  saveCurrentActiveInstanceData();

  const data = collectReportData();

  const ticketNo = data.request_no;

  if (!ticketNo || ticketNo === "DRAFT") {

    alert("กรุณาระบุเลขที่งาน (Ticket No.)");

    return;

  }



  showToast("กำลังรวมเอกสารทุกใบงานเป็น Full Package PDF...");

  try {

    const res = await fetch("/api/reports/submit", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        ticket_no: ticketNo,

        data: data,

        generate_forms: state.packageInstances.map(i => i.code),

        form_instances: state.packageInstances

      })

    });

    const result = await res.json();

    if (result.ok && result.generated_files) {

      const fullUrl = result.generated_files["ALL_MERGED"] || `/api/download/${ticketNo}/ALL_${ticketNo}.pdf`;

      openPdfModal(`รายงานรวมฉบับเต็ม (Full Package) - ${ticketNo}`, fullUrl + `?t=${Date.now()}`);

    } else {

      showToast("สร้างรายงานรวมไม่สำเร็จ");

    }

  } catch (e) {

    showToast("เกิดข้อผิดพลาด: " + e.message);

  }

}



async function saveDraft() {

  saveCurrentActiveInstanceData();

  const data = collectReportData();

  const ticketNo = data.request_no;

  if (!ticketNo || ticketNo === "DRAFT") {

    alert("กรุณาระบุเลขที่งาน (Ticket No.) ก่อนบันทึก");

    return;

  }

  showToast("กำลังบันทึกข้อมูลใบงาน...");

  try {

    const res = await fetch("/api/reports/save-draft", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ ticket_no: ticketNo, data })

    });

    const result = await res.json();

    if (result.ok) {

      showToast(`บันทึกข้อมูลใบงาน ${ticketNo} เรียบร้อยแล้ว`);

      loadReportsList();

      showSaveSuccessModal(ticketNo);

    }

  } catch (e) {

    showToast("บันทึกไม่สำเร็จ: " + e.message);

  }

}



async function savePhotoReportData() {

  await saveDraft();

}



function showSaveSuccessModal(ticketNo) {

  const modal = document.getElementById("modalSaveSuccess");

  const txt = document.getElementById("saveSuccessTicketText");

  if (txt) {

    txt.innerText = `ระบบบันทึกข้อมูลทุกใบงานของเลขที่ ${ticketNo} เรียบร้อยแล้ว ท่านสามารถกดดูรายงานรวมฉบับเต็มได้ทันที หรือปิดเพื่อกลับมาแก้ไขต่อได้ตลอดเวลา`;

  }

  if (modal) modal.classList.remove("hidden");

  initIcons();

}



function closeSaveSuccessModal() {

  const modal = document.getElementById("modalSaveSuccess");

  if (modal) modal.classList.add("hidden");

}



async function submitAndGenerate() {

  if (!state.packageInstances || state.packageInstances.length === 0) {

    alert("กรุณาเลือกใบงานอย่างน้อย 1 ใบก่อนส่งออกเอกสาร PDF");

    return;

  }

  saveCurrentActiveInstanceData();

  const data = collectReportData();

  const ticketNo = data.request_no;

  if (!ticketNo || ticketNo === "DRAFT") {

    alert("กรุณาระบุเลขที่งาน (Ticket No.)");

    return;

  }



  showToast("กำลังสร้างเอกสาร PDF ตามแบบฟอร์ม ISO ครบทุกใบ...");

  try {

    const res = await fetch("/api/reports/submit", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        ticket_no: ticketNo,

        data: data,

        generate_forms: state.packageInstances.map(i => i.code),

        form_instances: state.packageInstances

      })

    });

    const result = await res.json();

    if (result.ok && result.generated_files) {

      showToast("สร้างเอกสาร ISO เรียบร้อยแล้ว!");

      loadReportsList();

      const mergedUrl = result.generated_files["ALL_MERGED"] || result.generated_files["FM-EPS-23"];

      if (mergedUrl) {

        openPdfModal(`เอกสารส่งมอบงาน ${ticketNo}`, mergedUrl + `?t=${Date.now()}`);

      }

    }

  } catch (e) {

    showToast("เกิดข้อผิดพลาดในการออก PDF: " + e.message);

  }

}



// =============================================================================

// DASHBOARD & REPORTS HISTORY

// =============================================================================

async function loadReportsList() {

  const tbody = document.getElementById("reportsHistoryTbody");

  if (!tbody) return;

  try {

    const res = await fetch("/api/reports");

    const reports = await res.json();



    const draftsCount = reports.filter(r => r.status === "draft").length;

    const readyCount = reports.filter(r => r.status === "ready" || r.status === "submitted").length;



    const draftEl = document.getElementById("metricDrafts");

    const readyEl = document.getElementById("metricReady");

    if (draftEl) draftEl.innerText = draftsCount;

    if (readyEl) readyEl.innerText = readyCount;



    if (reports.length === 0) {

      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-400">ยังไม่มีประวัติการส่งรายงาน</td></tr>`;

      return;

    }



    tbody.innerHTML = reports.map(r => `

      <tr class="hover:bg-slate-50">

        <td class="p-3 font-bold text-red-700">${r.ticket_no}</td>

        <td class="p-3 font-medium text-slate-800">${r.customer}</td>

        <td class="p-3 text-slate-600">${r.serviced_by}</td>

        <td class="p-3 text-slate-400">${r.updated_at?.slice(0, 16).replace("T", " ") || "-"}</td>

        <td class="p-3 text-center">

          <span class="px-2 py-0.5 rounded-full font-semibold ${r.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">

            ${r.status === 'draft' ? 'ร่าง' : 'พร้อมส่ง'}

          </span>

        </td>

        <td class="p-3 text-center">

          <div class="flex items-center justify-center space-x-1">

            ${renderPdfLinks(r.ticket_no, r.generated_files)}

          </div>

        </td>

        <td class="p-3 text-center">

          <button onclick="selectTicket('${r.ticket_no}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs">

            เปิดดู/แก้ไข

          </button>

        </td>

      </tr>

    `).join("");



    initIcons();

  } catch (e) {

    console.error(e);

  }

}



function renderPdfLinks(ticketNo, files) {

  if (!files || Object.keys(files).length === 0) {

    return `<span class="text-slate-400 text-[11px]">-</span>`;

  }

  return Object.entries(files).map(([key, url]) => `

    <button onclick="openPdfModal('${key} - ${ticketNo}', '${url}')" class="px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-bold">

      ${key}

    </button>

  `).join("");

}



// =============================================================================

// MODAL & TOAST

// =============================================================================

function openPdfModal(title, url) {

  document.getElementById("pdfModalTitle").innerText = title;

  document.getElementById("pdfModalIframe").src = url;

  const dlBtn = document.getElementById("pdfModalDownloadBtn");
  dlBtn.href = url;

  // Set suggested download filename with Customer name for full packages
  if (url && (url.includes("ALL_") || url.includes("FULL_PACKAGE_") || url.includes("SERVICE_REPORT_"))) {
    const customer = (window.state && window.state.data && (window.state.data.customer || window.state.data.Customer || window.state.data.exp_customer)) || "";
    const cleanCust = String(customer).replace(/[\\/:*?"<>|]/g, '').trim();
    const ticketNo = (window.state && window.state.currentTicket) || "";
    const suggestedName = cleanCust ? `SERVICE_REPORT_${ticketNo}_${cleanCust}.pdf` : `SERVICE_REPORT_${ticketNo}.pdf`;
    dlBtn.setAttribute("download", suggestedName);
  } else {
    dlBtn.removeAttribute("download");
  }

  document.getElementById("pdfModal").classList.remove("hidden");

  initIcons();

}



function closePdfModal() {

  document.getElementById("pdfModal").classList.add("hidden");

  document.getElementById("pdfModalIframe").src = "";

}



async function previewPhotoReportPdf() {

  const ticketNo = document.getElementById("sr_request_no")?.value.trim();

  if (!ticketNo) {

    alert("กรุณาระบุเลขที่ใบงาน (Ticket No.)");

    return;

  }

  saveCurrentActiveInstanceData();



  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  const instData = (activeInst && activeInst.code === "PHOTO_REPORT" && activeInst.data) ? activeInst.data : {

    customer: document.getElementById("photo_customer")?.value.trim(),

    plant: document.getElementById("photo_plant")?.value.trim(),

    job: document.getElementById("photo_job")?.value.trim() || "",

    date_dmy: document.getElementById("photo_date")?.value.trim(),

    pump_brand: document.getElementById("photo_pump")?.value.trim(),

    model: document.getElementById("photo_model")?.value.trim(),

    serial_no: document.getElementById("photo_serial")?.value.trim(),

    reported_by: document.getElementById("photo_reported_by")?.value.trim() || "",

    recommended: document.getElementById("photo_recommended")?.value.trim() || "",

    photos: state.activePhotoReportPhotos || []

  };



  showToast("กำลังสร้างเอกสาร Photo Report (PDF)...");



  const payload = {

    ...instData,

    ticket_no: ticketNo,

    photos: instData.photos || state.activePhotoReportPhotos || []

  };



  try {

    const res = await fetch(`/api/photos/${ticketNo}/generate`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(payload)

    });

    const result = await res.json();

    if (result.ok && result.pdf_url) {

      const label = activeInst?.customLabel ? ` (${activeInst.customLabel})` : "";

      openPdfModal(`Photo Report${label} - ${ticketNo}`, result.pdf_url + `?t=${Date.now()}`);

    } else {

      showToast("สร้างรายงานไม่สำเร็จ");

    }

  } catch (e) {

    console.error(e);

    showToast("เกิดข้อผิดพลาด: " + e.message);

  }

}



async function downloadPhotoReportExcel() {

  const ticketNo = document.getElementById("sr_request_no")?.value.trim();

  if (!ticketNo) {

    alert("กรุณาระบุเลขที่ใบงาน (Ticket No.)");

    return;

  }

  saveCurrentActiveInstanceData();



  const activeInst = state.packageInstances.find(i => i.id === state.activeInstanceId);

  const instData = (activeInst && activeInst.code === "PHOTO_REPORT" && activeInst.data) ? activeInst.data : {

    customer: document.getElementById("photo_customer")?.value.trim(),

    plant: document.getElementById("photo_plant")?.value.trim(),

    job: document.getElementById("photo_job")?.value.trim() || "",

    date_dmy: document.getElementById("photo_date")?.value.trim(),

    pump_brand: document.getElementById("photo_pump")?.value.trim(),

    model: document.getElementById("photo_model")?.value.trim(),

    serial_no: document.getElementById("photo_serial")?.value.trim(),

    reported_by: document.getElementById("photo_reported_by")?.value.trim() || "",

    recommended: document.getElementById("photo_recommended")?.value.trim() || "",

    photos: state.activePhotoReportPhotos || []

  };



  showToast("กำลังส่งออกไฟล์ Excel (.xlsx)...");



  const payload = {

    ...instData,

    ticket_no: ticketNo,

    photos: instData.photos || state.activePhotoReportPhotos || []

  };



  try {

    const res = await fetch(`/api/photos/${ticketNo}/generate`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(payload)

    });

    const result = await res.json();

    if (result.ok && result.excel_url) {

      const a = document.createElement("a");

      a.href = result.excel_url + `?t=${Date.now()}`;

      const suffix = activeInst?.customLabel ? `_${activeInst.customLabel}` : (activeInst?.num > 1 ? `_${activeInst.num}` : "");

      a.download = `PHOTO_${ticketNo}${suffix}.xlsx`;

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      showToast("ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว!");

    } else {

      showToast("ส่งออก Excel ไม่สำเร็จ");

    }

  } catch (e) {

    console.error(e);

    showToast("เกิดข้อผิดพลาด: " + e.message);

  }

}



function showToast(text, duration = 3000) {

  const toast = document.getElementById("loadingToast");

  const toastText = document.getElementById("loadingToastText");

  if (!toast || !toastText) return;

  toastText.innerText = text;

  toast.classList.remove("hidden");

  setTimeout(() => {

    toast.classList.add("hidden");

  }, duration);

}



function calcExpGas() {
  const dist = parseFloat(document.getElementById("exp_gas_distance")?.value || 0);
  if (dist > 0) {
    const cost = dist * 5;
    const gasAmt = document.getElementById("exp_amt_gas");
    if (gasAmt && (!gasAmt.value || gasAmt.dataset.auto === "1")) {
      gasAmt.value = cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      gasAmt.dataset.auto = "1";
    }
    const chk = document.getElementById("exp_cost_gas");
    if (chk) chk.checked = true;
  }
}

// =============================================================================
// GOOGLE SHEETS & APPS SCRIPT SETTINGS (HYBRID DATABASE)
// =============================================================================

async function openGasModal() {
  const modal = document.getElementById("modalGasSettings");
  if (modal) modal.classList.remove("hidden");
  await loadGasConfig();
  initIcons();
}

function closeGasModal() {
  const modal = document.getElementById("modalGasSettings");
  if (modal) modal.classList.add("hidden");
}

async function loadGasConfig() {
  try {
    const res = await fetch("/api/gas/config");
    if (!res.ok) return;
    const cfg = await res.json();
    const input = document.getElementById("inputGasWebappUrl");
    const chk = document.getElementById("chkGasEnabled");
    const dot = document.getElementById("gasStatusDot");
    const text = document.getElementById("gasStatusText");
    const last = document.getElementById("gasLastSyncText");
    
    if (input) input.value = cfg.webapp_url || "";
    if (chk) chk.checked = !!cfg.enabled;
    
    if (cfg.enabled && cfg.webapp_url) {
      if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
      if (text) {
        text.innerText = "เชื่อมต่อ Google Sheets แล้ว (พร้อมซิงค์อัตโนมัติ)";
        text.className = "font-semibold text-emerald-700";
      }
    } else {
      if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-slate-400";
      if (text) {
        text.innerText = "ยังไม่ได้เชื่อมต่อ (วาง Web App URL ด้านล่าง)";
        text.className = "font-semibold text-slate-600";
      }
    }
    
    if (last && cfg.last_synced) {
      const d = new Date(cfg.last_synced);
      last.innerText = "ซิงค์ล่าสุด: " + d.toLocaleTimeString('th-TH');
    }
  } catch (e) {
    console.error("loadGasConfig error:", e);
  }
}

async function testGasUrl() {
  const input = document.getElementById("inputGasWebappUrl");
  const url = input ? input.value.trim() : "";
  if (!url) {
    alert("กรุณากรอก Google Apps Script Web App URL ก่อนกดทดสอบครับ");
    return;
  }
  const btn = document.getElementById("btnGasTest");
  if (btn) btn.innerText = "กำลังทดสอบ...";
  try {
    const res = await fetch("/api/gas/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webapp_url: url })
    });
    const result = await res.json();
    if (result.ok) {
      alert("เชื่อมต่อสำเร็จ! Google Apps Script ตอบรับเป็นปกติ\nจำนวนข้อมูลในแผ่นงาน: " + (result.response?.total_records || 0) + " รายการ");
      const dot = document.getElementById("gasStatusDot");
      const text = document.getElementById("gasStatusText");
      if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
      if (text) text.innerText = "เชื่อมต่อสำเร็จ (ออนไลน์)";
    } else {
      alert("ไม่สามารถเชื่อมต่อได้: " + (result.error || result.text || "Status " + result.status_code) + "\n\nคำแนะนำ: กรุณาตรวจสอบว่าเลือก Who has access เป็น Anyone ในขั้นตอน Deploy หรือยังครับ");
    }
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการทดสอบ: " + err);
  } finally {
    if (btn) btn.innerText = "🔍 ทดสอบการเชื่อมต่อ (Test)";
  }
}

async function saveGasSettings() {
  const input = document.getElementById("inputGasWebappUrl");
  const chk = document.getElementById("chkGasEnabled");
  const url = input ? input.value.trim() : "";
  const enabled = chk ? chk.checked : true;
  
  const btn = document.getElementById("btnGasSave");
  if (btn) btn.innerText = "กำลังบันทึก...";
  try {
    const res = await fetch("/api/gas/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webapp_url: url, enabled: enabled })
    });
    const result = await res.json();
    if (result.ok) {
      showToast("บันทึกการตั้งค่า Google Sheets เรียบร้อยแล้ว", 3000);
      closeGasModal();
    } else {
      alert("บันทึกไม่สำเร็จ: " + (result.detail || "Error"));
    }
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err);
  } finally {
    if (btn) btn.innerText = "บันทึกการตั้งค่า";
  }
}
