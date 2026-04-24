import * as XLSX from "xlsx";

/**
 * Expected Excel columns (case-insensitive, order doesn't matter):
 *
 * Name          | Vendor name
 * City          | e.g. "San Jose, CA"
 * Tolerance     | Display string e.g. '±0.0005"'
 * Tolerance_Num | Numeric value e.g. 0.0005 (optional — derived if omitted)
 * Lead_Time     | e.g. "2–4 weeks"
 * MOQ           | e.g. "1 pc"
 * ISO_9001      | TRUE / FALSE / Yes / No / 1 / 0
 * AS9100        | TRUE / FALSE / Yes / No / 1 / 0
 * ITAR          | TRUE / FALSE / Yes / No / 1 / 0
 * Profile       | High / Medium / Low
 * Subsystems    | Comma-separated: "ADAS, Battery, Mobility"
 * Processes     | Comma-separated: "CNC milling, CMM, EDM"
 * URL           | https://... (optional)
 */

function bool(val) {
  if (val === null || val === undefined || val === "") return false;
  if (typeof val === "boolean") return val;
  const s = String(val).trim().toLowerCase();
  return s === "true" || s === "yes" || s === "1";
}

function list(val) {
  if (!val) return [];
  return String(val).split(",").map(s => s.trim()).filter(Boolean);
}

function normalizeKey(k) {
  return k.toLowerCase().replace(/[\s_-]+/g, "_");
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

async function parseBuffer(buf) {
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  return rows
    .map(row => {
      // normalize keys so column header casing doesn't matter
      const r = {};
      Object.entries(row).forEach(([k, v]) => { r[normalizeKey(k)] = v; });

      const name = String(r.name || "").trim();
      if (!name) return null;

      const tnRaw = r.tolerance_num ?? r.tolerancenum ?? r.tol_num ?? null;
      const tn = tnRaw !== "" && tnRaw !== null ? parseFloat(tnRaw) || null : null;

      return {
        name,
        city:    String(r.city || "").trim(),
        tol:     String(r.tolerance || r.tol || "—").trim(),
        tn,
        lead:    String(r.lead_time || r.leadtime || r.lead || "—").trim(),
        moq:     String(r.moq || "—").trim(),
        iso:     bool(r.iso_9001 ?? r.iso9001 ?? r.iso),
        as9100:  bool(r.as9100),
        itar:    bool(r.itar),
        comp:    String(r.profile || r.comp || "Low").trim(),
        subs:    list(r.subsystems || r.subs),
        procs:   list(r.processes || r.procs),
        url:     String(r.url || "").trim(),
      };
    })
    .filter(Boolean);
}
