import { useState } from "react";
import { outfitAPI } from "../services/api";

const OCCASIONS    = ["Office", "Casual", "Party", "Date Night", "Workout", "Travel"];
const PERSONAS     = [
  { id: "minimal",    label: "Minimal",  icon: "◻" },
  { id: "bold",       label: "Bold",     icon: "◆" },
  { id: "classic",    label: "Classic",  icon: "◉" },
  { id: "streetwear", label: "Street",   icon: "◈" },
];
const WEATHERS     = ["Hot", "Mild", "Cool", "Cold", "Rainy"];

export default function RecommendTab({ wardrobe }) {
  const [occasion,     setOccasion]     = useState("Office");
  const [stylePersona, setStylePersona] = useState("classic");
  const [weather,      setWeather]      = useState("Mild");
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await outfitAPI.recommend({ occasion, stylePersona, weather });
      setResult(res.data.data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate outfit. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.twoCol}>
      {/* ── Controls ── */}
      <div style={styles.panel}>
        <div style={styles.panelTitle}>Build your outfit</div>

        <Field label="Occasion">
          <div style={styles.chips}>
            {OCCASIONS.map(o => (
              <Chip key={o} active={occasion === o} onClick={() => setOccasion(o)}>{o}</Chip>
            ))}
          </div>
        </Field>

        <Field label="Style persona">
          <div style={styles.personaRow}>
            {PERSONAS.map(p => (
              <button
                key={p.id}
                style={{ ...styles.persona, ...(stylePersona === p.id ? styles.personaActive : {}) }}
                onClick={() => setStylePersona(p.id)}
              >
                <span style={styles.personaIcon}>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Weather">
          <select value={weather} onChange={e => setWeather(e.target.value)}>
            {WEATHERS.map(w => <option key={w}>{w}</option>)}
          </select>
        </Field>

        <button style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }} onClick={generate} disabled={loading || wardrobe.length === 0}>
          {loading ? "Styling…" : "Get outfit →"}
        </button>

        {wardrobe.length === 0 && (
          <div style={styles.warn}>Add items to your wardrobe first</div>
        )}
      </div>

      {/* ── Result ── */}
      <div>
        {!loading && !result && !error && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>✦</div>
            <div style={styles.emptyText}>Configure and generate</div>
          </div>
        )}

        {loading && (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <div style={styles.loadingText}>Curating your look</div>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {!loading && result && (
          <div style={styles.resultCard}>
            <div style={styles.vibe}>{result.vibe}</div>
            <div style={styles.outfitList}>
              {result.outfit.map((item, i) => (
                <div key={i} style={styles.outfitItem}>
                  <span style={styles.outfitNum}>{i + 1}</span>
                  <span style={styles.outfitName}>{item}</span>
                </div>
              ))}
            </div>
            <div style={styles.divider} />
            <p style={styles.why}>{result.why}</p>
            <div style={styles.tipBox}>
              <div style={styles.tipLabel}>Styling tip</div>
              <div style={styles.tipText}>{result.tip}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <span style={styles.label}>{label}</span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }} onClick={onClick}>
      {children}
    </button>
  );
}

const styles = {
  twoCol:      { display: "grid", gridTemplateColumns: "290px 1fr", gap: "24px", alignItems: "start" },
  panel:       { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px" },
  panelTitle:  { fontFamily: "var(--font-serif)", fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "20px" },
  label:       { fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", display: "block" },
  chips:       { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip:        { padding: "6px 12px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--border)", background: "none", color: "var(--text-muted)", transition: "all 0.15s" },
  chipActive:  { borderColor: "var(--gold)", color: "var(--gold)", background: "var(--gold-dim)" },
  personaRow:  { display: "flex", gap: "8px" },
  persona:     { flex: 1, padding: "10px 6px", textAlign: "center", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "none", color: "var(--text-muted)", fontSize: "11px", transition: "all 0.15s" },
  personaActive:{ borderColor: "var(--gold)", color: "var(--gold)", background: "var(--gold-dim)" },
  personaIcon: { fontSize: "18px", display: "block", marginBottom: "4px" },
  btn:         { width: "100%", padding: "14px", background: "var(--gold)", color: "#0e0e0e", border: "none", borderRadius: "var(--radius-sm)", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500, transition: "all 0.2s", marginTop: "8px" },
  btnDisabled: { background: "#3a3530", color: "var(--text-muted)", cursor: "not-allowed" },
  warn:        { fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "10px" },
  empty:       { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "340px", gap: "12px" },
  emptyIcon:   { fontFamily: "var(--font-serif)", fontSize: "52px", opacity: 0.15 },
  emptyText:   { fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-faint)" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "340px", gap: "16px" },
  spinner:     { width: "34px", height: "34px", border: "1px solid rgba(196,149,106,0.2)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.9s linear infinite" },
  loadingText: { fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)" },
  errorBox:    { background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: "var(--radius-sm)", padding: "16px", fontSize: "13px", color: "#e8a0a0", marginTop: "24px" },
  resultCard:  { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "32px", animation: "fadeUp 0.4s ease" },
  vibe:        { fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "20px" },
  outfitList:  { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" },
  outfitItem:  { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" },
  outfitNum:   { fontFamily: "var(--font-serif)", fontSize: "20px", fontStyle: "italic", color: "var(--gold)", opacity: 0.6, minWidth: "20px" },
  outfitName:  { fontSize: "14px", color: "#d8d4cc" },
  divider:     { width: "40px", height: "1px", background: "var(--gold)", opacity: 0.3, margin: "20px 0" },
  why:         { fontSize: "14px", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "16px" },
  tipBox:      { background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-sm)", padding: "14px 16px" },
  tipLabel:    { fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "6px" },
  tipText:     { fontSize: "13px", color: "#c8c4bc", lineHeight: 1.6 },
};
