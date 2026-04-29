import { useState, useMemo, useRef, useEffect } from "react";
import { matchFilter } from "./utils";
import { parseExcelFile, parseExcelUrl } from "./parseVendors";
import Card from "./components/Card";
import Drawer from "./components/Drawer";
import LabTable from "./components/LabTable";
import VCTable from "./components/VCTable";

const FILTER_DEFS = [
  { id: "high",   label: "High Profile" },
  { id: "as9100", label: "AS9100" },
  { id: "itar",   label: "ITAR Registered" },
  { id: "multi",  label: "Multi-Role" },
  { id: "fast",   label: "Fast Lead Time" },
];

export default function App() {
  const [vendors, setVendors] = useState([]);
  const [labs, setLabs] = useState([]);
  const [vcs, setVcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-load the bundled Excel file on first render
  useEffect(() => {
    parseExcelUrl("/data/vendors_ferrari_innovation_lab.xlsx")
      .then(({ vendors, labs, vcs }) => { setVendors(vendors); setLabs(labs); setVcs(vcs); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);
  const [tab, setTab] = useState(null);
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const fileInputRef = useRef();

  const LABS_TAB = "Research Labs";
  const VC_TAB = "VC — Automotive Tech";
  const isVendorTab = tab => tab !== LABS_TAB && tab !== VC_TAB;

  // Derive tabs dynamically from the data
  const SUBS = useMemo(() => {
    const seen = new Set();
    vendors.forEach(v => v.subs.forEach(s => seen.add(s)));
    const order = ["ADAS", "Electrification", "Battery", "Materials", "Mobility", "Pending"];
    const sorted = [...seen].sort((a, b) => {
      const ai = order.indexOf(a), bi = order.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    if (labs.length > 0) sorted.push(LABS_TAB);
    if (vcs.length > 0) sorted.push(VC_TAB);
    return sorted;
  }, [vendors, labs, vcs]);

  const activeTab = tab ?? SUBS[0] ?? null;

  const deduped = useMemo(() => {
    const seen = new Map();
    vendors.forEach(v => { if (!seen.has(v.name)) seen.set(v.name, v); });
    return Array.from(seen.values());
  }, [vendors]);

  const tabVendors = useMemo(() => {
    if (!activeTab) return [];
    const seen = new Set();
    return vendors.filter(v => {
      if (!v.subs.includes(activeTab) || seen.has(v.name)) return false;
      seen.add(v.name);
      return true;
    });
  }, [vendors, activeTab]);

  const filteredLabs = useMemo(() => {
    if (!search.trim()) return labs;
    const q = search.toLowerCase();
    return labs.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.institution.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.focus.toLowerCase().includes(q)
    );
  }, [labs, search]);

  const filteredVcs = useMemo(() => {
    if (!search.trim()) return vcs;
    const q = search.toLowerCase();
    return vcs.filter(vc =>
      vc.name.toLowerCase().includes(q) ||
      vc.city.toLowerCase().includes(q) ||
      vc.thesis.toLowerCase().includes(q) ||
      vc.portfolio.toLowerCase().includes(q)
    );
  }, [vcs, search]);

  const filtered = useMemo(() => {
    let list = tabVendors;
    if (filters.length) list = list.filter(v => filters.every(f => matchFilter(v, f)));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.procs.some(p => p.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tabVendors, filters, search]);

  const counts = useMemo(() => {
    const m = {};
    SUBS.forEach(s => {
      if (s === LABS_TAB) {
        m[s] = labs.length;
      } else if (s === VC_TAB) {
        m[s] = vcs.length;
      } else {
        const seen = new Set();
        m[s] = vendors.filter(v => {
          if (!v.subs.includes(s) || seen.has(v.name)) return false;
          seen.add(v.name);
          return true;
        }).length;
      }
    });
    return m;
  }, [vendors, labs, vcs, SUBS]);

  const multiCount = deduped.filter(v => v.subs.filter(s => s !== "Pending").length >= 3).length;
  const highCount  = deduped.filter(v => v.comp === "High").length;
  const isMulti    = v => v.subs.filter(s => s !== "Pending").length >= 3;
  const togFilter  = id => setFilters(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  async function handleFile(file) {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { vendors: data, labs: labData, vcs: vcData } = await parseExcelFile(file);
      if (data.length === 0 && labData.length === 0 && vcData.length === 0) throw new Error("No data rows found. Check that your sheet has a header row and at least one data row.");
      setVendors(data);
      setLabs(labData);
      setVcs(vcData);
      setTab(null);
      setFilters([]);
      setSearch("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onFileInput(e) { handleFile(e.target.files[0]); }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--lt)", letterSpacing: 1 }}>
          LOADING VENDOR DATA…
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="empty">
        <div className="e-ico">⚠</div>
        <div className="e-t">Could not load vendors.xlsx</div>
        <div className="e-s" style={{ color: "var(--red)", marginBottom: 16 }}>{error}</div>
        <div className="e-s">Make sure <code>public/vendors.xlsx</code> exists in the repo.</div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <>
      <div className="hdr">
        <div className="hdr-l">
          <div className="shield" />
          <div>
            <div className="brand">Ferrari Innovation Lab</div>
            <div className="brand-sub">Bay Area Supplier Intelligence · Apr 2026</div>
          </div>
        </div>
        <div className="warn-pill">⚠ All certs pending verification</div>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={onFileInput} />
      </div>

      <div className="metrics">
        {[
          { val: deduped.length, lbl: "Total vendors" },
          { val: multiCount,     lbl: "Multi-role champions" },
          { val: highCount,      lbl: "High profile" },
          { val: "75 mi",        lbl: "Radius from San Jose" },
        ].map(m => (
          <div className="met" key={m.lbl}>
            <div className="mval">{m.val}</div>
            <div className="mlbl">{m.lbl}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {SUBS.map(s => (
          <div
            key={s}
            className={"tab" + (activeTab === s ? " on" : "")}
            onClick={() => { setTab(s); setFilters([]); setSearch(""); }}
          >
            <div className="tab-n">{s}</div>
            <div className="tab-c">{counts[s]}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        {isVendorTab(activeTab) && (
          <>
            <span className="t-lbl">Filter:</span>
            {FILTER_DEFS.map(f => (
              <button key={f.id} className={"chip" + (filters.includes(f.id) ? " on" : "")} onClick={() => togFilter(f.id)}>
                {filters.includes(f.id) ? "✓ " : ""}{f.label}
              </button>
            ))}
          </>
        )}
        <div className="srch-wrap" style={{ marginLeft: isVendorTab(activeTab) ? "auto" : 0 }}>
          <span className="sico">⌕</span>
          <input
            className="srch"
            placeholder={isVendorTab(activeTab) ? "Search vendors, processes…" : "Search…"}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isVendorTab(activeTab) && (
        <div className="rbar">
          <div className="rinfo">
            Showing <strong>{filtered.length}</strong> of {tabVendors.length} vendors in <strong>{activeTab}</strong>
            {filters.length > 0 && <span style={{ color: "var(--red)" }}> · {filters.length} filter{filters.length > 1 ? "s" : ""} active</span>}
          </div>
        </div>
      )}

      {activeTab === LABS_TAB ? (
        <LabTable labs={filteredLabs} />
      ) : activeTab === VC_TAB ? (
        <VCTable vcs={filteredVcs} />
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="e-ico">○</div>
          <div className="e-t">No vendors match</div>
          <div className="e-s">Try removing a filter or clearing the search.</div>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((v, i) => (
            <Card key={v.name + activeTab} v={v} multi={isMulti(v)} delay={i * 18} onClick={() => setSel(v)} />
          ))}
        </div>
      )}

      {sel && (
        <div className="overlay" onClick={e => { if (e.target.className === "overlay") setSel(null); }}>
          <Drawer v={sel} multi={isMulti(sel)} onClose={() => setSel(null)} />
        </div>
      )}
    </>
  );
}
