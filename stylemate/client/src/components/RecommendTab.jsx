import { useState } from "react";
import { outfitAPI } from "../services/api";

const OCCASIONS = [
  { id: "Office",     label: "Office",    icon: "ðŸ’¼" },
  { id: "Casual",     label: "Casual",    icon: "â˜€" },
  { id: "Party",      label: "Party",     icon: "âœ¨" },
  { id: "Date Night", label: "Date",      icon: "ðŸŒ™" },
  { id: "Wedding",    label: "Wedding",   icon: "â—†" },
  { id: "Interview",  label: "Interview", icon: "â—‰" },
  { id: "Gym",        label: "Gym",       icon: "â—ˆ" },
  { id: "Travel",     label: "Travel",    icon: "â—Ž" },
  { id: "Brunch",     label: "Brunch",    icon: "â—»" },
  { id: "Hiking",     label: "Hiking",    icon: "â–²" },
];

const PERSONAS = [
  { id: "classic",    label: "Classic",    icon: "â—‰", colors: ["#1a1a1a", "#f0ede8", "#c4956a"] },
  { id: "minimalist", label: "Minimal",    icon: "â—»", colors: ["#2e2e2e", "#e0e0e0", "#888"]    },
  { id: "streetwear", label: "Street",     icon: "â—ˆ", colors: ["#111", "#c4956a", "#ddd"]       },
  { id: "bohemian",   label: "Boho",       icon: "â—†", colors: ["#6b4c3b", "#d4a578", "#9a8060"] },
  { id: "chic",       label: "Chic",       icon: "â—Ž", colors: ["#1a1a1a", "#f5f0ea", "#d4b896"] },
  { id: "preppy",     label: "Preppy",     icon: "â–²", colors: ["#1e2d5a", "#c8b273", "#f0ede8"] },
];

const WEATHERS = [
  { id: "Hot",   icon: "â˜€",  label: "Hot"   },
  { id: "Warm",  icon: "â—‘",  label: "Warm"  },
  { id: "Mild",  icon: "â—",  label: "Mild"  },
  { id: "Cool",  icon: "â„",  label: "Cool"  },
  { id: "Cold",  icon: "â—†",  label: "Cold"  },
  { id: "Rainy", icon: "â—Ž",  label: "Rain"  },
];

export default function RecommendTab({ wardrobe }) {
  const [occasion,     setOccasion]     = useState("Office");
  const [stylePersona, setStylePersona] = useState("classic");
  const [weather,      setWeather]      = useState("Mild");
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [confAnim,     setConfAnim]     = useState(0);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setConfAnim(0);
    try {
      const res = await outfitAPI.recommend({ occasion, stylePersona, weather });
      const data = res.data.data;
      setResult(data);
      setTimeout(() => setConfAnim(data.confidence ?? 0), 80);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate outfit. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.layout}>
      {/* â”€â”€ Left panel â”€â”€ */}
      <div style={s.panel}>
        <div style={s.panelHead}>
          <span style={s.panelIcon}>âœ¦</span>
          <span style={s.panelTitle}>Build your outfit</span>
        </div>

        {/* Occasion */}
        <div style={s.field}>
          <span className="section-label">Occasion</span>
          <div style={s.occGrid}>
            {OCCASIONS.map(o => (
              <button key={o.id} className={`occ-card${occasion === o.id ? " active" : ""}`} onClick={() => setOccasion(o.id)}>
                <span className="occ-icon">{o.icon}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Persona */}
        <div style={s.field}>
          <span className="section-label">Style persona</span>
          <div style={s.personaGrid}>
            {PERSONAS.map(p => (
              <button key={p.id} className={`persona-card${stylePersona === p.id ? " active" : ""}`} onClick={() => setStylePersona(p.id)}>
                <div style={{ display: "flex", gap: "3px", marginBottom: "3px" }}>
                  {p.colors.map((c, i) => (
                    <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
                  ))}
                </div>
                <span className="persona-icon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div style={s.field}>
          <span className="section-label">Weather</span>
          <div style={s.weatherRow}>
            {WEATHERS.map(w => (
              <button key={w.id} className={`weather-btn${weather === w.id ? " active" : ""}`} onClick={() => setWeather(w.id)}>
                <span className="weather-icon">{w.icon}</span>
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={generate} disabled={loading || wardrobe.length === 0}>
          {loading
            ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><span className="spinner" style={{ width: "13px", height: "13px" }} />Stylingâ€¦</span>
            : "Get outfit â†’"}
        </button>

        {wardrobe.length === 0 && (
          <div style={s.warn}>Add wardrobe items first</div>
        )}
      </div>

      {/* â”€â”€ Right panel â”€â”€ */}
      <div style={s.resultArea}>
        {!loading && !result && !error && (
          <div className="empty-state">
            <div className="empty-icon">âœ¦</div>
            <div className="empty-text">Configure and generate</div>
            <div style={{ fontSize: "11px", color: "var(--text-faint)", maxWidth: "200px", textAlign: "center", lineHeight: 1.7, marginTop: "4px" }}>
              Select your occasion, persona &amp; weather then get your look
            </div>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <div className="spinner" style={{ width: "30px", height: "30px" }} />
            <div className="empty-text" style={{ color: "var(--gold)" }}>Curating your look</div>
          </div>
        )}

        {error && (
          <div style={s.errorBox}>{error}</div>
        )}

        {!loading && result && (
          <div className="anim-result" style={s.resultCard}>
            {/* Vibe + confidence */}
            <div style={s.resultTop}>
              <div>
                <div style={s.vibeLabel}>vibe</div>
                <div style={s.vibe}>{result.vibe}</div>
                <div style={s.occasion}>{occasion} Â· {weather} Â· {stylePersona}</div>
              </div>
              {result.confidence != null && (
                <ConfidenceRing value={result.confidence} animated={confAnim} />
              )}
            </div>

            {/* Outfit items */}
            <div style={{ marginBottom: "20px" }}>
              {result.outfit.map((item, i) => (
                <OutfitItem key={i} index={i} item={item} score={result.scores?.[i]?.score} delay={i * 70} />
              ))}
            </div>

            <div style={s.divider} />

            <p style={s.why}>{result.why}</p>

            <div style={s.tipBox}>
              <div style={s.tipLabel}>Styling tip</div>
              <div style={s.tipText}>{result.tip}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfidenceRing({ value, animated }) {
  const deg = Math.round((animated / 100) * 360);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: "60px", height: "60px", borderRadius: "50%",
        background: `conic-gradient(var(--gold) ${deg}deg, rgba(255,255,255,0.06) 0deg)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.9s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>
          {value}%
        </div>
      </div>
      <div style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "5px" }}>Match</div>
    </div>
  );
}

function OutfitItem({ index, item, score, delay }) {
  return (
    <div className="anim-fade-up" style={{ ...s.outfitItem, animationDelay: `${delay}ms` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
        <span style={s.num}>{index + 1}</span>
        <span style={s.itemName}>{item}</span>
      </div>
      {score != null && (
        <div style={{ width: "80px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "9px", color: "var(--text-faint)", letterSpacing: "0.3px" }}>match</span>
            <span style={{ fontSize: "9px", color: "var(--gold)", opacity: 0.75 }}>{score}%</span>
          </div>
          <div className="conf-bar-track">
            <div className="score-bar-fill" style={{ width: `${score}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  layout:     { display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px", alignItems: "start" },
  panel:      { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "26px", position: "sticky", top: "20px" },
  panelHead:  { display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" },
  panelIcon:  { color: "var(--gold)", fontSize: "16px" },
  panelTitle: { fontFamily: "var(--font-serif)", fontSize: "17px", fontWeight: 600, color: "var(--text-primary)" },
  field:      { marginBottom: "22px" },
  occGrid:    { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" },
  personaGrid:{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" },
  weatherRow: { display: "flex", gap: "5px" },
  warn:       { fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "12px", letterSpacing: "0.5px" },
  resultArea: { minHeight: "460px" },
  errorBox:   { background: "rgba(220,100,100,0.07)", border: "1px solid rgba(220,100,100,0.18)", borderRadius: "var(--radius)", padding: "20px", fontSize: "13px", color: "#e8a0a0", animation: "fadeUp 0.3s ease" },
  resultCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px" },
  resultTop:  { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" },
  vibeLabel:  { fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "6px" },
  vibe:       { fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: 600, letterSpacing: "-0.3px", color: "var(--text-primary)", marginBottom: "4px" },
  occasion:   { fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.3px" },
  outfitItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "8px" },
  num:        { width: "22px", height: "22px", borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--gold)", flexShrink: 0, fontWeight: 500 },
  itemName:   { fontSize: "13px", color: "#d0ccC4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  divider:    { height: "1px", background: "var(--border)", margin: "20px 0" },
  why:        { fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "18px" },
  tipBox:     { background: "rgba(196,149,106,0.05)", border: "1px solid rgba(196,149,106,0.14)", borderRadius: "8px", padding: "14px 16px" },
  tipLabel:   { fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "6px", opacity: 0.8 },
  tipText:    { fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 },
};
