import { useState } from "react";

const TYPES  = ["T-Shirt","Shirt","Blazer","Trousers","Jeans","Dress","Skirt","Jacket","Sweater","Shorts","Shoes","Sneakers","Boots","Bag","Scarf"];
const COLORS = ["Black","White","Navy","Grey","Beige","Olive","Burgundy","Camel","Blush","Cobalt"];

const colorDot = (color) => ({
  Black:"#1a1a1a", White:"#f0ede8", Navy:"#1e2d5a", Grey:"#8a8a8a",
  Beige:"#d4c4a8", Olive:"#6b7a3d", Burgundy:"#6b1f2a", Camel:"#c4956a",
  Blush:"#e8b4b4", Cobalt:"#1a4fa0"
})[color] || "#888";

export default function WardrobeTab({ wardrobe, onAdd, onRemove, loading }) {
  const [form,    setForm]    = useState({ type: "T-Shirt", color: "Black", brand: "" });
  const [adding,  setAdding]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [err,     setErr]     = useState(null);

  const handleAdd = async () => {
    if (!form.brand.trim()) { setErr("Brand is required"); return; }
    setAdding(true);
    setErr(null);
    try {
      await onAdd(form);
      setForm({ type: "T-Shirt", color: "Black", brand: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.title}>Your Wardrobe</div>
        <span style={styles.badge}>{wardrobe.length} items</span>
      </div>

      {loading ? (
        <div style={styles.loadingRow}><div style={styles.spinner} /><span style={styles.loadingText}>Loading wardrobe…</span></div>
      ) : (
        <div style={styles.grid}>
          {wardrobe.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={{ ...styles.dot, background: colorDot(item.color), border: item.color === "White" ? "1px solid #3a3530" : "none" }} />
                <span style={styles.colorLabel}>{item.color}</span>
              </div>
              <div style={styles.itemType}>{item.type}</div>
              <div style={styles.itemBrand}>{item.brand}</div>
              <button style={styles.removeBtn} onClick={() => onRemove(item.id)} title="Remove">×</button>
            </div>
          ))}
          {wardrobe.length === 0 && (
            <div style={styles.emptyGrid}>No items yet. Add your first piece below.</div>
          )}
        </div>
      )}

      {/* ── Add form ── */}
      <div style={styles.addForm}>
        <div style={styles.addTitle}>Add item</div>
        {err && <div style={styles.errMsg}>{err}</div>}
        <div style={styles.formGrid}>
          <div>
            <span style={styles.label}>Type</span>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <span style={styles.label}>Color</span>
            <select value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}>
              {COLORS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <span style={styles.label}>Brand</span>
            <input
              placeholder="e.g. Zara, Uniqlo"
              value={form.brand}
              onChange={e => setForm({ ...form, brand: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
          </div>
          <button style={{ ...styles.addBtn, ...(adding ? styles.addBtnDisabled : {}) }} onClick={handleAdd} disabled={adding}>
            {adding ? "Adding…" : "Add +"}
          </button>
        </div>
        <div style={{ ...styles.successMsg, opacity: success ? 1 : 0 }}>✓ Item added to wardrobe</div>
      </div>
    </div>
  );
}

const styles = {
  header:       { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  title:        { fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.3px" },
  badge:        { fontSize: "11px", padding: "4px 10px", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", borderRadius: "20px", color: "var(--gold)" },
  grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "10px" },
  card:         { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", position: "relative", transition: "border-color 0.2s" },
  cardTop:      { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  dot:          { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  colorLabel:   { fontSize: "11px", color: "var(--text-muted)" },
  itemType:     { fontSize: "13px", color: "#d8d4cc", marginBottom: "2px" },
  itemBrand:    { fontSize: "10px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "1px" },
  removeBtn:    { position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "var(--text-faint)", fontSize: "18px", lineHeight: 1, padding: "2px", cursor: "pointer", transition: "color 0.15s" },
  emptyGrid:    { gridColumn: "1/-1", fontSize: "13px", color: "var(--text-muted)", padding: "32px 0" },
  addForm:      { background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px", marginTop: "24px" },
  addTitle:     { fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px" },
  formGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" },
  label:        { fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px", display: "block" },
  addBtn:       { padding: "9px 20px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-xs)", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", transition: "all 0.2s", whiteSpace: "nowrap", alignSelf: "end" },
  addBtnDisabled:{ opacity: 0.5, cursor: "not-allowed" },
  successMsg:   { fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#6da87a", marginTop: "10px", transition: "opacity 0.3s" },
  errMsg:       { fontSize: "12px", color: "#e8a0a0", marginBottom: "12px" },
  loadingRow:   { display: "flex", alignItems: "center", gap: "10px", padding: "32px 0" },
  spinner:      { width: "20px", height: "20px", border: "1px solid rgba(196,149,106,0.2)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.9s linear infinite", flexShrink: 0 },
  loadingText:  { fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1px" },
};
