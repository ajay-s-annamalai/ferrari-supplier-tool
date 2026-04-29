import { useState } from "react";

function ScorePill({ score }) {
  if (score === null || score === undefined) return <span style={{ color: "var(--lt)" }}>—</span>;
  const cls = score >= 4 ? "score-h" : score === 3 ? "score-m" : "score-l";
  return <span className={"score-pill " + cls}>{score}</span>;
}

export default function LabTable({ labs }) {
  const [openRow, setOpenRow] = useState(null);

  if (labs.length === 0) {
    return (
      <div className="empty">
        <div className="e-ico">○</div>
        <div className="e-t">No research labs match</div>
        <div className="e-s">Try adjusting your search.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 28px 40px" }}>
      <table className="lt-table">
        <thead>
          <tr className="lt-head">
            <th className="lt-th" style={{ width: 60 }}>Score</th>
            <th className="lt-th">Lab / Center</th>
            <th className="lt-th" style={{ width: 130 }}>City</th>
            <th className="lt-th">Primary Focus</th>
            <th className="lt-th">Partnership Models</th>
            <th className="lt-th" style={{ width: 80 }}>Website</th>
          </tr>
        </thead>
        <tbody>
          {labs.map((l, i) => (
            <>
              <tr
                key={i}
                className={"lt-row" + (openRow === i ? " open" : "")}
                onClick={() => setOpenRow(openRow === i ? null : i)}
              >
                <td className="lt-td"><ScorePill score={l.score} /></td>
                <td className="lt-td">
                  <div className="lt-name">{l.name}</div>
                  <div className="lt-sub">{l.institution}</div>
                </td>
                <td className="lt-td lt-city">{l.city}</td>
                <td className="lt-td lt-trunc">{l.focus}</td>
                <td className="lt-td lt-trunc">{l.partnerModels}</td>
                <td className="lt-td">
                  {l.url
                    ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="lt-link"
                         onClick={e => e.stopPropagation()}>↗</a>
                    : "—"}
                </td>
              </tr>
              {openRow === i && (
                <tr key={i + "-expand"}>
                  <td colSpan={6} className="lt-expand">
                    <div className="lt-expand-grid">
                      <div className="lt-expand-item">
                        <div className="lek">Director / PI</div>
                        <div className="lev">{l.director || "—"}</div>
                      </div>
                      <div className="lt-expand-item">
                        <div className="lek">Contact Email</div>
                        <div className="lev">
                          {l.email
                            ? <a href={`mailto:${l.email}`} style={{ color: "var(--red)", textDecoration: "none", fontWeight: 600 }}>
                              {l.email}
                            </a>
                            : "—"}
                        </div>
                      </div>
                      <div className="lt-expand-item">
                        <div className="lek">Phone</div>
                        <div className="lev">{l.phone || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Research Focus</div>
                        <div className="lev">{l.focus || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Automotive / Mobility Relevance</div>
                        <div className="lev">{l.relevance || "—"}</div>
                      </div>
                      <div className="lt-expand-item">
                        <div className="lek">Annual Budget</div>
                        <div className="lev">{l.budget || "—"}</div>
                      </div>
                      <div className="lt-expand-item">
                        <div className="lek">Funding Sources</div>
                        <div className="lev">{l.funding || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Active Industry Partners</div>
                        <div className="lev">{l.partners || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">IP / Licensing Policy</div>
                        <div className="lev">{l.ipPolicy || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Tech Transfer Office Contact</div>
                        <div className="lev">{l.techTransfer || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Partnership Model Options</div>
                        <div className="lev">{l.partnerModels || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Notes / Next Steps</div>
                        <div className="lev">{l.notes || "—"}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
