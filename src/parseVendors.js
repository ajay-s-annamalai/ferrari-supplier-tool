import * as XLSX from "xlsx";

/**
 * Multi-sheet Ferrari vendor database parser.
 *
 * Sheet layout per data sheet:
 *   Row 0: sheet title
 *   Row 1: focus blurb
 *   Row 2: baseline requirements note
 *   Row 3: empty
 *   Row 4: column headers  ← actual header row
 *   Row 5+: category separator rows (first cell starts with "Category") or data rows
 *
 * Unverified-Pending sheet:
 *   Row 0: title
 *   Row 1: explanation
 *   Row 2: empty
 *   Row 3: column headers
 *   Row 4+: data rows
 */

const DATA_SHEETS = ["ADAS", "Electrification", "Battery", "Materials", "Mobility"];
const PENDING_SHEET = "Unverified-Pending";
const LABS_SHEET = "Research Labs";
const VC_SHEET = "VC — Automotive Tech";

function claimed(val) {
  if (!val && val !== 0) return false;
  const s = String(val).trim().toLowerCase();
  return s.startsWith("claimed") || s === "yes" || s === "true" || s === "1";
}

function parseTolNum(val) {
  if (!val) return null;
  const m = String(val).match(/([0-9]*\.?[0-9]+)/);
  return m ? parseFloat(m[1]) : null;
}

function splitProcs(primary, secondary) {
  const parts = [];
  if (primary) parts.push(...String(primary).split(";").map(s => s.trim()).filter(Boolean));
  if (secondary) parts.push(...String(secondary).split(";").map(s => s.trim()).filter(Boolean));
  return parts;
}

function parseDataSheet(ws, sheetName) {
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "", header: 1 });
  // Row 4 is the header row
  const headerRow = rawRows[4];
  if (!headerRow) return [];

  const headers = headerRow.map(h => String(h).trim());

  const vendors = [];
  for (let i = 5; i < rawRows.length; i++) {
    const row = rawRows[i];

    const get = (label) => {
      const idx = headers.indexOf(label);
      return idx >= 0 ? row[idx] : "";
    };

    const name = String(get("Company Name") || row[0] || "").trim();
    if (!name) continue;
    // Skip category separator rows
    if (name.startsWith("Category")) continue;

    const tolStr = String(get("Tightest Tolerance") || "—").trim();
    const compRaw = String(get("Profile Completeness") || "Low").trim();

    vendors.push({
      name,
      city:   String(get("City") || "").trim(),
      tol:    tolStr,
      tn:     parseTolNum(tolStr),
      lead:   String(get("Typical Lead Time") || "—").trim(),
      moq:    String(get("Min Batch Size") || "—").trim(),
      iso:    claimed(get("ISO 9001 Status")),
      as9100: claimed(get("AS9100 Status")),
      itar:   claimed(get("ITAR Status")),
      iatf:   claimed(get("IATF 16949 Status")),
      comp:   compRaw || "Low",
      subs:   [sheetName],
      procs:  splitProcs(get("Primary Processes"), get("Secondary Processes")),
      materials:  String(get("Materials Worked") || "").trim(),
      cadFormats: String(get("CAD Formats Accepted") || "").trim(),
      url:    String(get("Website") || "").trim(),
      phone:  String(get("Phone") || "").trim(),
      notes:  String(get("Notes") || "").trim(),
    });
  }
  return vendors;
}

function parsePendingSheet(ws) {
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "", header: 1 });
  // Row 3 is the header row
  const headerRow = rawRows[3];
  if (!headerRow) return [];

  const headers = headerRow.map(h => String(h).trim());

  const vendors = [];
  for (let i = 4; i < rawRows.length; i++) {
    const row = rawRows[i];

    const get = (label) => {
      const idx = headers.findIndex(h => h.toLowerCase().startsWith(label.toLowerCase()));
      return idx >= 0 ? row[idx] : "";
    };

    const name = String(get("Company Name") || row[0] || "").trim();
    if (!name) continue;

    vendors.push({
      name,
      city:   String(get("City") || "").trim(),
      tol:    "—",
      tn:     null,
      lead:   "—",
      moq:    "—",
      iso:    false,
      as9100: false,
      itar:   false,
      iatf:   false,
      comp:   "Low",
      subs:   ["Pending"],
      procs:  [],
      materials:  "",
      cadFormats: "",
      url:    String(get("Website") || "").trim(),
      phone:  "",
      notes:  String(get("Reason") || get("Reason Verification Incomplete") || "").trim(),
    });
  }
  return vendors;
}

function parseLabsSheet(ws) {
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "", header: 1 });
  const headerRow = rawRows[2];
  if (!headerRow) return [];

  const headers = headerRow.map(h => String(h).trim());

  const get = (label) => {
    const idx = headers.indexOf(label);
    return idx >= 0 ? row[idx] : "";
  };

  const labs = [];
  for (let i = 3; i < rawRows.length; i++) {
    const row = rawRows[i];
    const name = String(row[0] || "").trim();
    if (!name) continue;
    if (name.startsWith("SECTION")) continue;

    labs.push({
      name,
      institution: String(get("Parent Institution") || "").trim(),
      city:        String(get("City") || "").trim(),
      address:     String(get("Address / Campus") || "").trim(),
      url:         String(get("Website") || "").trim(),
      director:    String(get("Lab Director / PI") || "").trim(),
      email:       String(get("Contact Email") || "").trim(),
      phone:       String(get("Phone") || "").trim(),
      focus:       String(get("Primary Research Focus") || "").trim(),
      relevance:   String(get("Automotive / Mobility Relevance") || "").trim(),
      budget:      String(get("Annual Research Budget (USD)") || "").trim(),
      funding:     String(get("Funding Sources") || "").trim(),
      partners:    String(get("Active Industry Partners") || "").trim(),
      ipPolicy:    String(get("IP / Licensing Policy") || "").trim(),
      techTransfer: String(get("Tech Transfer Office Contact") || "").trim(),
      partnerModels: String(get("Partnership Model Options") || "").trim(),
      score:       parseInt(String(get("Ferrari Relevance Score (1-5)") || "").trim()) || null,
      notes:       String(get("Notes / Next Steps") || "").trim(),
    });
  }
  return labs;
}

function parseVCSheet(ws) {
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "", header: 1 });
  const headerRow = rawRows[2];
  if (!headerRow) return [];

  const headers = headerRow.map(h => String(h).trim());

  const get = (label) => {
    const idx = headers.indexOf(label);
    return idx >= 0 ? row[idx] : "";
  };

  const vcs = [];
  for (let i = 3; i < rawRows.length; i++) {
    const row = rawRows[i];
    const name = String(row[0] || "").trim();
    if (!name) continue;
    if (name.startsWith("SECTION")) continue;

    vcs.push({
      name,
      city:         String(get("City / HQ") || "").trim(),
      address:      String(get("Address") || "").trim(),
      url:          String(get("Website") || "").trim(),
      partners:     String(get("Key Partner(s) — Automotive Focus") || "").trim(),
      email:        String(get("Contact / BD Email") || "").trim(),
      stagesFocus:  String(get("Fund Stage Focus") || "").trim(),
      aum:          String(get("AUM / Fund Size (USD, est.)") || "").trim(),
      portfolio:    String(get("Current / Recent Automotive Portfolio Companies") || "").trim(),
      thesis:       String(get("Investment Thesis (Automotive)") || "").trim(),
      checkSize:    String(get("Typical Check Size") || "").trim(),
      coInvestors:  String(get("Co-investors / LP Network") || "").trim(),
      ferOverlap:   String(get("Ferrari Synergy — Portfolio Overlap") || "").trim(),
      partnerAngle: String(get("Partnership Angle for Ferrari") || "").trim(),
      score:        parseInt(String(get("Relevance Score (1-5)") || "").trim()) || null,
      notes:        String(get("Notes / Next Steps") || "").trim(),
    });
  }
  return vcs;
}

function parseBuffer(buf) {
  const wb = XLSX.read(buf, { type: "array" });

  const allVendors = [];

  // Parse each data sheet
  DATA_SHEETS.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;
    allVendors.push(...parseDataSheet(ws, sheetName));
  });

  // Parse pending sheet
  const pendingWs = wb.Sheets[PENDING_SHEET];
  if (pendingWs) allVendors.push(...parsePendingSheet(pendingWs));

  // Parse labs sheet
  const labs = [];
  const labsWs = wb.Sheets[LABS_SHEET];
  if (labsWs) labs.push(...parseLabsSheet(labsWs));

  // Parse VC sheet
  const vcs = [];
  const vcWs = wb.Sheets[VC_SHEET];
  if (vcWs) vcs.push(...parseVCSheet(vcWs));

  return { vendors: allVendors, labs, vcs };
}

export async function parseExcelUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  return parseBuffer(buf);
}

export async function parseExcelFile(file) {
  const buf = await file.arrayBuffer();
  return parseBuffer(buf);
}
