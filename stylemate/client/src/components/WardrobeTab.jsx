import { useState } from "react";

const TYPES = ["T-Shirt","Shirt","Blazer","Trousers","Jeans","Dress","Skirt","Jacket","Sweater","Hoodie","Shorts","Shoes","Sneakers","Boots","Loafers","Coat","Cardigan"];

const COLORS = ["Black","White","Navy","Grey","Beige","Olive","Burgundy","Camel","Blush","Cobalt","Brown","Red"];

const SWATCHES = {
  Black:"#1c1c1c", White:"#f0ede8", Navy:"#1e2d5a", Grey:"#787878",
  Beige:"#d4c4a8", Olive:"#6b7a3d", Burgundy:"#6b1f2a", Camel:"#c4956a",
  Blush:"#e8b4b4", Cobalt:"#1a4fa0", Brown:"#7a5230", Red:"#b83030",
};
const SWATCH_TEXT = {
  Black:"#777", White:"#aaa", Navy:"#6a82b8", Grey:"#aaa",
  Beige:"#c4a878", Olive:"#9aad60", Burgundy:"#c47080", Camel:"#d4a878",
  Blush:"#e8a8a8", Cobalt:"#5a8fd8", Brown:"#c49060", Red:"#e08080",
};

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
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Your Wardrobe</div>
          <div style={s.subtitle}>{wardrobe.length} piece{wardrobe.length !== 1 ? "s" : ""} curated</div>
        </div>
        <div style={s.badge}>
          <span style={s.badgeDot} />
          {wardrobe.length} items
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={s.loadRow}>
          <div className="spinner" />
          <span style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1px" }}>Loading wardrobeâ€¦</span>
        </div>
      ) : (
        <div style={s.grid}>
          {wardrobe.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: "1/-1" }}>
              <div className="empty-icon">â—ˆ</div>
              <div className="empty-text">No items yet</div>
              <div style={{ fontSize: "11px", color: "var(--text-faint)" }}>Add your first piece below</div>
            </div>
          ) : (
            wardrobe.map((item, i) => (
              <WardrobeCard key={item.id} item={item} onRemove={onRemove} delay={i * 28} />
            ))
          )}
        </div>
      )}

      {/* Add form */}
      <div style={s.addForm}>
        <div style={s.addHeader}>
          <span className="section-label" style={{ marginBottom: 0 }}>Add new item</span>
          {err && <span style={s.errMsg}>{err}</span>}
        </div>

        <div style={s.formGrid}>
          <div>
            <span className="section-label">Type</span>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <span className="section-label">Color</span>
            <div style={s.colorPicker}>
              {COLORS.map(c => (
                <button
                  key={c}
                  title={c}
                  className={`color-dot-option${form.color === c ? " selected" : ""}`}
                  style={{ background: SWATCHES[c] || "#888" }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
            <div style={{ fontSize: "10px", color: SWATCH_TEXT[form.color] || "var(--text-muted)", marginTop: "7px", letterSpacing: "0.5px" }}>
              {form.color}
            </div>
          </div>

          <div>
            <span className="section-label">Brand</span>
            <input
              placeholder="e.g. Zara, Uniqlo"
              value={form.brand}
              onChange={e => setForm({ ...form, brand: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="add-btn" onClick={handleAdd} disabled={adding}>
              {adding ? "Addingâ€¦" : "+ Add"}
            </button>
          </div>
        </div>

        <div style={{ ...s.successMsg, opacity: success ? 1 : 0 }}>âœ“ Added to wardrobe</div>
      </div>
    </div>
  );
}

function WardrobeCard({ item, onRemove, delay }) {
  const swatch = SWATCHES[item.color] || "#666";
  return (
    <div className="wardrobe-card anim-card" style={{ animationDelay: `${delay}ms` }}>
      {/* Color header */}
      <div style={{ height: "58px", background: `linear-gradient(135deg, ${swatch}20, ${swatch}40)`, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: swatch, border: item.color === "White" ? "1px solid #3a3530" : "none", boxShadow: `0 0 14px ${swatch}50` }} />
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: "14px", color: "#d0ccc4", fontWeight: 400, marginBottom: "3px" }}>{item.type}</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>{item.color}</div>
        <div style={{ fontSize: "10px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "1px" }}>{item.brand}</div>
        {item.tags?.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
            {item.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
          </div>
        )}
      </div>

      <button className="remove-btn" onClick={() => onRemove(item.id)}>Ã—</button>
    </div>
  );
}

const s = {
  header:     { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" },
  title:      { fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: 600, letterSpacing: "-0.3px", marginBottom: "3px" },
  subtitle:   { fontSize: "12px", color: "var(--text-muted)" },
  badge:      { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "20px", padding: "7px 16px" },
  badgeDot:   { width: "5px", height: "5px", borderRadius: "50%", background: "var(--gold)", flexShrink: 0 },
  loadRow:    { display: "flex", alignItems: "center", gap: "12px", padding: "48px 0" },
  grid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))", gap: "12px", marginBottom: "32px", minHeight: "80px" },
  addForm:    { background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px" },
  addHeader:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
  formGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "16px", alignItems: "start" },
  colorPicker:{ display: "flex", gap: "7px", flexWrap: "wrap", paddingTop: "2px" },
  successMsg: { fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--green)", marginTop: "14px", transition: "opacity 0.4s" },
  errMsg:     { fontSize: "12px", color: "#e8a0a0" },
};
