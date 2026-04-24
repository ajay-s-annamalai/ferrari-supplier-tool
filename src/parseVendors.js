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
    const name = String(row[0] || "").trim();
    if (!name) continue;
    // Skip category separator rows
    if (name.startsWith("Category")) continue;

    const get = (label) => {
      const idx = headers.indexOf(label);
      return idx >= 0 ? row[idx] : "";
    };

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
      comp:   compRaw || "Low",
      subs:   [sheetName],
      procs:  splitProcs(get("Primary Processes"), get("Secondary Processes")),
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
    const name = String(row[0] || "").trim();
    if (!name) continue;

    const get = (label) => {
      const idx = headers.findIndex(h => h.toLowerCase().startsWith(label.toLowerCase()));
      return idx >= 0 ? row[idx] : "";
    };

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
      comp:   "Low",
      subs:   ["Pending"],
      procs:  [],
      url:    String(get("Website") || "").trim(),
      phone:  "",
      notes:  String(get("Reason") || "").trim(),
    });
  }
  return vendors;
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

  return allVendors;
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
