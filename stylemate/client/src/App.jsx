import { useState } from "react";
import { useWardrobe } from "./hooks/useWardrobe";
import RecommendTab from "./components/RecommendTab";
import WardrobeTab  from "./components/WardrobeTab";
import ChatTab      from "./components/ChatTab";
import "./index.css";

const TABS = [
  { id: "recommend", label: "Recommend", icon: "✦" },
  { id: "wardrobe",  label: "Wardrobe",  icon: "◈" },
  { id: "chat",      label: "Advisor",   icon: "◎" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("recommend");
  const { wardrobe, loading, addItem, removeItem } = useWardrobe();

  return (
    <div style={s.app}>
      <div style={s.glowTop} />
      <div style={s.glowBot} />
      <div style={s.glowMid} />

      {/* ── Header ── */}
      <header style={s.header}>
        <div>
          <div style={s.logo}>Style<span style={s.accent}>Mate</span></div>
          <div style={s.tagline}>AI Outfit Intelligence</div>
        </div>
        <div style={s.badge}>
          <span style={s.badgeDot} />
          {wardrobe.length} items in wardrobe
        </div>
      </header>

      {/* ── Nav ── */}
      <nav style={s.nav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ marginRight: "7px", opacity: 0.65, fontSize: "13px" }}>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && <span className="nav-tab-underline" />}
          </button>
        ))}
      </nav>

      {/* ── Body ── */}
      <main style={s.body} key={activeTab}>
        {activeTab === "recommend" && <RecommendTab wardrobe={wardrobe} />}
        {activeTab === "wardrobe"  && <WardrobeTab wardrobe={wardrobe} loading={loading} onAdd={addItem} onRemove={removeItem} />}
        {activeTab === "chat"      && <ChatTab />}
      </main>
    </div>
  );
}

const s = {
  app:      { minHeight: "100vh", background: "#0a0a0a", color: "#ede9e1", fontFamily: "var(--font-sans)", fontWeight: 300, position: "relative", overflow: "hidden" },
  glowTop:  { position: "fixed", top: "-35%", right: "-15%", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle,rgba(196,149,106,0.055) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 },
  glowBot:  { position: "fixed", bottom: "-30%", left: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle,rgba(30,45,90,0.09) 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 },
  glowMid:  { position: "fixed", top: "45%", left: "50%", transform: "translate(-50%,-50%)", width: "900px", height: "400px", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(196,149,106,0.02) 0%,transparent 60%)", pointerEvents: "none", zIndex: 0 },
  header:   { padding: "28px 36px 0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 10 },
  logo:     { fontFamily: "var(--font-serif)", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.5px" },
  accent:   { color: "var(--gold)" },
  tagline:  { fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--text-faint)", marginTop: "3px" },
  badge:    { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "20px", padding: "7px 16px" },
  badgeDot: { width: "5px", height: "5px", borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 6px rgba(196,149,106,0.7)", flexShrink: 0 },
  nav:      { display: "flex", gap: "2px", padding: "18px 36px 0", position: "relative", zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" },
  body:     { padding: "36px", position: "relative", zIndex: 10, minHeight: "calc(100vh - 130px)", animation: "fadeUp 0.35s ease both" },
};
