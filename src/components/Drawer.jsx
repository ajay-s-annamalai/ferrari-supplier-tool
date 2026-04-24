import { region } from "../utils";

const CHECKLIST = [
  "Request current ISO / AS9100 certificate PDF from vendor",
  "Verify cert number via IATF or IQNet public registry",
  "Confirm issuing registrar name and scope statement",
  "Check expiry date and site-specific coverage",
  "Schedule site visit or video call before first PO",
];

export default function Drawer({ v, multi, onClose }) {
  const otherSubs = v.subs.filter(s => s !== "Pending");
  const certs = [
    { name: "ISO 9001",   t: v.iso    ? "y" : "n" },
    { name: "IATF 16949", t: "n" },
    { name: "AS9100",     t: v.as9100 ? "y" : "n" },
    { name: "ITAR",       t: v.itar   ? "a" : "n" },
  ];

  return (
    <div className="drawer">
      <div className="d-hdr">
        <button className="d-close" onClick={onClose}>✕ CLOSE</button>
        <div className="d-name">{v.name}</div>
        <div className="d-loc">{v.city} · {region(v.city)}</div>
        <div className={"d-comp dc" + v.comp[0]}>{v.comp} Profile</div>
      </div>

      <div className="d-body">
        <div className="d-warn">
          <span>⚠</span>
          <span>Cert status is claimed, not verified. Request certificate PDFs and confirm with the issuing registrar before placing any PO.</span>
        </div>

        <div className="d-sec">
          <div className="d-stitle">Details</div>
          <div className="d-grid">
            {[["Tolerance", v.tol], ["Lead Time", v.lead], ["Min Order", v.moq], ["Region", region(v.city)],
              ...(v.phone ? [["Phone", v.phone]] : [])
            ].map(([k, val]) => (
              <div className="d-item" key={k}>
                <div className="dk">{k}</div>
                <div className="dv">{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="d-sec">
          <div className="d-stitle">Certifications</div>
          <div className="cert-grid">
            {certs.map(c => (
              <div key={c.name} className={"cert" + (c.t === "y" ? " yes" : c.t === "a" ? " amb" : "")}>
                <div className={"ci-dot " + c.t}>{c.t === "n" ? "–" : "✓"}</div>
                <div className={"ci-name " + c.t}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="d-sec">
          <div className="d-stitle">Capabilities</div>
          <div className="proc-list">
            {v.procs.map((p, i) => (
              <div className="proc" key={i}>
                <div className="proc-dot" />{p}
              </div>
            ))}
          </div>
        </div>

        {multi && (
          <div className="d-sec">
            <div className="d-stitle">Active Subsystems ({otherSubs.length})</div>
            <div className="sub-pills">
              {otherSubs.map(s => <div key={s} className="sub-pill">{s}</div>)}
            </div>
          </div>
        )}

        <div className="d-sec">
          <div className="d-stitle">Verification Checklist</div>
          <div className="checklist">
            {CHECKLIST.map((s, i) => (
              <div className="c-row" key={i}>
                <div className="c-num">{i + 1}</div>
                <div className="c-txt">{s}</div>
              </div>
            ))}
          </div>
        </div>

        {v.notes && (
          <div className="d-sec">
            <div className="d-stitle">Notes</div>
            <div className="d-note">{v.notes}</div>
          </div>
        )}

        {v.url
          ? <a href={v.url} target="_blank" rel="noopener noreferrer" className="visit-btn">Visit Website →</a>
          : <div className="visit-btn dis">No website on file</div>}
      </div>
    </div>
  );
}
