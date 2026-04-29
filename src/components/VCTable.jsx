import { useState } from "react";

function ScorePill({ score }) {
  if (score === null || score === undefined) return <span style={{ color: "var(--lt)" }}>—</span>;
  const cls = score >= 4 ? "score-h" : score === 3 ? "score-m" : "score-l";
  return <span className={"score-pill " + cls}>{score}</span>;
}

export default function VCTable({ vcs }) {
  const [openRow, setOpenRow] = useState(null);

  if (vcs.length === 0) {
    return (
      <div className="empty">
        <div className="e-ico">○</div>
        <div className="e-t">No VC firms match</div>
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
            <th className="lt-th">Firm</th>
            <th className="lt-th" style={{ width: 140 }}>Stage Focus</th>
            <th className="lt-th" style={{ width: 150 }}>AUM</th>
            <th className="lt-th" style={{ width: 130 }}>Check Size</th>
            <th className="lt-th" style={{ width: 80 }}>Website</th>
          </tr>
        </thead>
        <tbody>
          {vcs.map((vc, i) => (
            <>
              <tr
                key={i}
                className={"lt-row" + (openRow === i ? " open" : "")}
                onClick={() => setOpenRow(openRow === i ? null : i)}
              >
                <td className="lt-td"><ScorePill score={vc.score} /></td>
                <td className="lt-td">
                  <div className="lt-name">{vc.name}</div>
                  <div className="lt-sub">{vc.city}</div>
                </td>
                <td className="lt-td lt-trunc">{vc.stagesFocus}</td>
                <td className="lt-td lt-trunc">{vc.aum}</td>
                <td className="lt-td lt-trunc">{vc.checkSize}</td>
                <td className="lt-td">
                  {vc.url
                    ? <a href={vc.url} target="_blank" rel="noopener noreferrer" className="lt-link"
                         onClick={e => e.stopPropagation()}>↗</a>
                    : "—"}
                </td>
              </tr>
              {openRow === i && (
                <tr key={i + "-expand"}>
                  <td colSpan={6} className="lt-expand">
                    <div className="lt-expand-grid">
                      <div className="lt-expand-item">
                        <div className="lek">Address</div>
                        <div className="lev">{vc.address || "—"}</div>
                      </div>
                      <div className="lt-expand-item">
                        <div className="lek">Contact / BD Email</div>
                        <div className="lev">
                          {vc.email
                            ? <a href={`mailto:${vc.email}`} style={{ color: "var(--red)", textDecoration: "none", fontWeight: 600 }}>
                              {vc.email}
                            </a>
                            : "—"}
                        </div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Key Partner(s) — Automotive Focus</div>
                        <div className="lev">{vc.partners || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Current / Recent Portfolio Companies</div>
                        <div className="lev">{vc.portfolio || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Investment Thesis (Automotive)</div>
                        <div className="lev">{vc.thesis || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Co-investors / LP Network</div>
                        <div className="lev">{vc.coInvestors || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Ferrari Synergy — Portfolio Overlap</div>
                        <div className="lev">{vc.ferOverlap || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Partnership Angle for Ferrari</div>
                        <div className="lev">{vc.partnerAngle || "—"}</div>
                      </div>
                      <div className="lt-expand-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="lek">Notes / Next Steps</div>
                        <div className="lev">{vc.notes || "—"}</div>
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
