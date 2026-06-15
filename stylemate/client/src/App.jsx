import { useState } from "react";
import { useWardrobe } from "./hooks/useWardrobe";
import RecommendTab  from "./components/RecommendTab";
import WardrobeTab   from "./components/WardrobeTab";
import ChatTab       from "./components/ChatTab";
import "./index.css";

const TABS = ["recommend", "wardrobe", "chat"];

export default function App() {
  const [activeTab, setActiveTab] = useState("recommend");
  const { wardrobe, loading, addItem, removeItem } = useWardrobe();

  return (
    <div style={styles.app}>
      {/* Ambient glow */}
      <div style={styles.glowTop}    />
      <div style={styles.glowBottom} />

      {/* Header */}
      <header style={styles.header}>
        <div>
          <div style={styles.logo}>Style<span style={styles.logoAccent}>Mate</span></div>
          <div style={styles.tagline}>AI Outfit Intelligence</div>
        </div>
        <div style={styles.headerRight}>
          {wardrobe.length} items in wardrobe
        </div>
      </header>

      {/* Nav */}
      <nav style={styles.nav}>
        {TABS.map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {activeTab === tab && <span style={styles.tabUnderline} />}
          </button>
        ))}
      </nav>

      {/* Body */}
      <main style={styles.body}>
        {activeTab === "recommend" && <RecommendTab wardrobe={wardrobe} />}
        {activeTab === "wardrobe"  && <WardrobeTab wardrobe={wardrobe} loading={loading} onAdd={addItem} onRemove={removeItem} />}
        {activeTab === "chat"      && <ChatTab />}
      </main>
    </div>
  );
}

const styles = {
  app:          { minHeight: "100vh", background: "#0e0e0e", color: "#e8e4dc", fontFamily: "var(--font-sans)", fontWeight: 300, position: "relative", overflow: "hidden" },
  glowTop:      { position: "fixed", top: "-40%", right: "-20%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle,rgba(196,149,106,0.07) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 },
  glowBottom:   { position: "fixed", bottom: "-30%", left: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle,rgba(30,45,90,0.12) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 },
  header:       { padding: "28px 32px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative", zIndex: 10 },
  logo:         { fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", color: "#e8e4dc" },
  logoAccent:   { color: "var(--gold)" },
  tagline:      { fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-faint)", marginTop: "2px" },
  headerRight:  { fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-faint)" },
  nav:          { display: "flex", gap: "4px", padding: "22px 32px 0", position: "relative", zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tab:          { padding: "10px 20px", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", position: "relative", transition: "color 0.2s" },
  tabActive:    { color: "var(--gold)" },
  tabUnderline: { position: "absolute", bottom: "-1px", left: 0, right: 0, height: "1px", background: "var(--gold)", display: "block" },
  body:         { padding: "32px", position: "relative", zIndex: 10, minHeight: "calc(100vh - 120px)", animation: "fadeIn 0.4s ease" },
};
