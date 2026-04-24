import { tolPct, region } from "../utils";

export default function Card({ v, multi, delay, onClick }) {
  const p = tolPct(v.tn);
  return (
    <div className={"card" + (multi ? " mr" : "")} style={{ animationDelay: delay + "ms" }} onClick={onClick}>
      {multi && <div className="mr-flag">MULTI-ROLE</div>}
      <div className="c-head">
        <div className="c-name">{v.name}</div>
        <div className={"badge b" + v.comp[0]}>{v.comp.toUpperCase()}</div>
      </div>
      <div className="c-loc">📍 {v.city} · {region(v.city)}</div>
      <div className="c-procs">{v.procs.join(" · ")}</div>
      <div className="c-tags">
        {v.iso    && <span className="tag tg">ISO 9001</span>}
        {v.as9100 && <span className="tag tg">AS9100</span>}
        {v.itar   && <span className="tag ta">ITAR</span>}
        {multi    && <span className="tag tm">{v.subs.filter(s => s !== "Pending").length} subsystems</span>}
      </div>
      <div className="tol-h">
        <span className="tol-k">Tolerance</span>
        <span className="tol-v">{v.tol}</span>
      </div>
      <div className="tol-track">
        {v.tn && <div className={"tol-fill" + (p < 50 ? " lt" : "")} style={{ width: p + "%" }} />}
      </div>
      <div className="c-foot">
        <div className="fi"><span className="fk">Lead Time</span><span className="fv">{v.lead}</span></div>
        <div className="fi"><span className="fk">MOQ</span><span className="fv">{v.moq}</span></div>
      </div>
    </div>
  );
}
