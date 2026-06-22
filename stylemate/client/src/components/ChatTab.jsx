import { useState, useRef, useEffect } from "react";
import { chatAPI } from "../services/api";

const SUGGESTIONS = [
  "What should I wear to an interview?",
  "How do I style my navy trousers?",
  "What's missing from my wardrobe?",
  "Best casual Friday outfit?",
  "How to look more put-together?",
  "What shoes work with everything?",
];

export default function ChatTab() {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || sending) return;

    const userMsg    = { role: "user", content: msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setSending(true);
    inputRef.current?.focus();

    try {
      const res = await chatAPI.send(newHistory);
      setMessages([...newHistory, res.data.data]);
    } catch (e) {
      setMessages([...newHistory, {
        role: "assistant",
        content: e.response?.data?.error || "Something went wrong. Is the server running?",
      }]);
    } finally {
      setSending(false);
    }
  };

  const clear = () => { setMessages([]); setInput(""); };

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Style Advisor</div>
          <div style={s.subtitle}>
            <span style={s.modelDot} />
            Powered by GPT-4o · Your personal AI stylist
          </div>
        </div>
        {messages.length > 0 && (
          <button style={s.clearBtn} onClick={clear}>Clear chat</button>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div style={s.sugWrap} className="anim-fade-in">
          <div style={s.sugLabel}>Suggested questions</div>
          <div style={s.suggestions}>
            {SUGGESTIONS.map(q => (
              <button key={q} className="sug-pill" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Chat box */}
      <div style={s.chatBox}>
        <div style={s.messages}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          {sending && <TypingIndicator />}
          <div ref={endRef} />
        </div>

        {/* Input row */}
        <div style={s.inputWrap}>
          <div style={s.inputRow}>
            <input
              ref={inputRef}
              style={s.chatInput}
              placeholder="Ask your style advisor…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              disabled={sending}
            />
            <button
              style={{ ...s.sendBtn, ...(!input.trim() || sending ? s.sendOff : {}) }}
              onClick={() => send()}
              disabled={!input.trim() || sending}
              title="Send (Enter)"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2l2 6-2 6 12-6z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <div style={s.hint}>Press Enter to send</div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && <Avatar label="S" gold />}
      <div
        className={isUser ? "bubble-user" : "bubble-bot"}
        style={{ maxWidth: "72%", padding: "12px 16px", fontSize: "13px", lineHeight: 1.75 }}
      >
        {msg.content}
      </div>
      {isUser && <Avatar label="U" />}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
      <Avatar label="S" gold />
      <div className="bubble-bot" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "1px" }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function Avatar({ label, gold }) {
  return (
    <div style={{
      width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
      background: gold ? "var(--gold-dim)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${gold ? "var(--border-gold)" : "var(--border)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 600,
      color: gold ? "var(--gold)" : "var(--text-muted)",
      fontFamily: "var(--font-serif)",
    }}>
      {label}
    </div>
  );
}

const s = {
  wrap:        { maxWidth: "720px", margin: "0 auto" },
  header:      { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" },
  title:       { fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: 600, letterSpacing: "-0.3px", marginBottom: "6px" },
  subtitle:    { display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.3px" },
  modelDot:    { width: "5px", height: "5px", borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 5px rgba(122,184,122,0.6)", flexShrink: 0 },
  clearBtn:    { fontSize: "11px", color: "var(--text-faint)", background: "none", border: "1px solid var(--border)", borderRadius: "20px", padding: "5px 14px", transition: "all 0.18s" },
  sugWrap:     { marginBottom: "24px" },
  sugLabel:    { fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-faint)", textAlign: "center", marginBottom: "14px" },
  suggestions: { display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" },
  chatBox:     { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" },
  messages:    { minHeight: "300px", maxHeight: "440px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", padding: "22px", scrollbarWidth: "thin", scrollbarColor: "#242020 transparent" },
  inputWrap:   { padding: "12px 16px 14px", borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" },
  inputRow:    { display: "flex", gap: "10px", alignItems: "center" },
  chatInput:   { flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 16px", color: "#c8c4bc", fontSize: "13px", outline: "none", transition: "border-color 0.18s, box-shadow 0.18s" },
  sendBtn:     { width: "42px", height: "42px", borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--border-gold)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.18s" },
  sendOff:     { opacity: 0.32, cursor: "not-allowed" },
  hint:        { fontSize: "10px", color: "var(--text-faint)", textAlign: "right", marginTop: "7px", letterSpacing: "0.3px" },
};
