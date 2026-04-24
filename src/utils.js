export function tolPct(t) {
  if (!t) return 0;
  const mn = Math.log10(0.00004), mx = Math.log10(0.020);
  return Math.max(4, Math.round(100 - ((Math.log10(t) - mn) / (mx - mn)) * 88));
}

export function region(city) {
  const c = city.toLowerCase();
  if (c.includes("san jose") || c.includes("milpitas") || c.includes("santa clara") || c.includes("sunnyvale") || c.includes("morgan hill")) return "South Bay";
  if (c.includes("fremont") || c.includes("hayward") || c.includes("union city") || c.includes("san leandro") || c.includes("livermore")) return "East Bay";
  if (c.includes("mountain view") || c.includes("redwood")) return "Peninsula";
  return "Bay Area";
}

export function matchFilter(v, f) {
  if (f === "high")   return v.comp === "High";
  if (f === "as9100") return v.as9100;
  if (f === "itar")   return v.itar;
  if (f === "multi")  return v.subs.filter(s => s !== "Pending").length >= 3;
  if (f === "fast")   return v.lead.includes("day") || v.lead === "1–2 weeks" || v.lead === "1–3 weeks";
  return true;
}
