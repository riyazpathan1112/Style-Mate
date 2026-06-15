import { useState, useRef, useEffect } from "react";
import { chatAPI } from "../services/api";

const SUGGESTIONS = [
  "What should I wear to an interview?",
  "How do I style my navy trousers?",
  "What's missing from my wardrobe?",
  "Best casual Friday look?",
  "How to look more put-together?",
];

export default function ChatTab() {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || sending) return;

    const userMsg   = { role: "user", content: msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setSending(true);

    try {
      const res = await chatAPI.send(newHistory);
      setMessages([...newHistory, res.data.data]);
    } catch (e) {
      setMessages([...newHistory, {
        role: "assistant",
        content: e.response?.data?.error || "Something went wrong. Is the server running?"
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.title}>Style Advisor</div>
        <div style={styles.subtitle}>Ask anything about your wardrobe</div>
      </div>

      {messages.length === 0 && (
        <div>
          <div style={styles.hint}>Suggested questions</div>
          <div style={styles.suggestions}>
            {SUGGESTIONS.map(q => (
              <button key={q} style={styles.sugBtn} onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.chatWrap}>
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ ...styles.msgRow, ...(msg.role === "user" ? styles.msgRowUser : {}) }}>
              <div style={{ ...styles.bubble, ...(msg.role === "user" ? styles.bubbleUser : styles.bubbleBot) }}>
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div style={styles.msgRow}>
              <div style={{ ...styles.bubble, ...styles.bubbleBot, ...styles.typing }}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.chatInput}
            placeholder="Ask your style advisor…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={sending}
          />
          <button style={{ ...styles.sendBtn, ...(sending ? styles.sendBtnDisabled : {}) }} onClick={() => send()} disabled={sending}>
            →
          </button>
        </div>
      </div>

      <style>{`
        .typing span {
          display: inline-block;
          width: 6px; height: 6px;
          background: var(--text-muted);
          border-radius: 50%;
          margin: 0 2px;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}

const styles = {
  header:      { marginBottom: "20px" },
  title:       { fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.3px", marginBottom: "4px" },
  subtitle:    { fontSize: "12px", color: "var(--text-muted)" },
  hint:        { fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-faint)", textAlign: "center", padding: "16px 0 12px" },
  suggestions: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px", justifyContent: "center" },
  sugBtn:      { padding: "6px 14px", background: "none", border: "1px solid var(--border)", borderRadius: "20px", color: "var(--text-muted)", fontSize: "11px", transition: "all 0.15s" },
  chatWrap:    { display: "flex", flexDirection: "column", height: "420px" },
  messages:    { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "12px", scrollbarWidth: "thin", scrollbarColor: "#2a2520 transparent" },
  msgRow:      { display: "flex", justifyContent: "flex-start" },
  msgRowUser:  { justifyContent: "flex-end" },
  bubble:      { maxWidth: "75%", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", lineHeight: 1.7 },
  bubbleUser:  { background: "var(--gold-dim)", border: "1px solid var(--gold-border)", color: "#d8d4cc" },
  bubbleBot:   { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" },
  typing:      { display: "flex", alignItems: "center", className: "typing" },
  inputRow:    { display: "flex", gap: "10px", paddingTop: "12px", borderTop: "1px solid var(--border)" },
  chatInput:   { flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 16px", color: "#c8c4bc", fontSize: "13px", outline: "none" },
  sendBtn:     { padding: "12px 20px", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius-sm)", fontSize: "16px", transition: "all 0.15s" },
  sendBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
};
