import { useState, useRef, useEffect } from "react";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { FiSend, FiPlus, FiTrash2, FiSun, FiMoon, FiMessageSquare, FiZap, FiMic, FiMicOff, FiClock } from "react-icons/fi";
import "./Chat.css";

const SUGGESTIONS = [
  { icon: "💰", text: "Can I afford a bike worth ₹80,000?" },
  { icon: "📊", text: "How much can I save monthly?" },
  { icon: "⚠️", text: "Where am I overspending?" },
  { icon: "🎯", text: "Suggest a budget plan for next month" },
  { icon: "📅", text: "Compare this month vs last month" },
  { icon: "💡", text: "Give me tips to reduce my expenses" },
];

const Chat = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadSessions = async () => {
    try {
      const res = await API.get("/chat");
      setSessions(res.data);
    } catch {}
  };

  const newChat = async () => {
    try {
      const res = await API.post("/chat");
      setSessions((prev) => [res.data, ...prev]);
      setActiveSession(res.data);
      setMessages([]);
    } catch {}
  };

  const openSession = async (session) => {
    setActiveSession(session);
    setMobileSidebarOpen(false);
    try {
      const res = await API.get(`/chat/${session._id}`);
      setMessages(res.data.messages);
    } catch {}
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/chat/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (activeSession?._id === id) { setActiveSession(null); setMessages([]); }
    } catch {}
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    let session = activeSession;
    if (!session) {
      try {
        const res = await API.post("/chat");
        session = res.data;
        setSessions((prev) => [res.data, ...prev]);
        setActiveSession(res.data);
      } catch { return; }
    }

    setMessages((prev) => [...prev, { role: "user", content: msg, time: new Date() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post(`/chat/${session._id}/message`, { message: msg });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply, time: new Date() }]);
      // update session title in sidebar
      setSessions((prev) => prev.map((s) => s._id === session._id ? { ...s, title: res.data.session.title } : s));
      setActiveSession((prev) => prev ? { ...prev, title: res.data.session.title } : prev);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again.", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input is not supported in this browser. Try Chrome."); return; }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onstart = () => setListening(true);
    recognition.onerror = (e) => { console.error("Speech error:", e.error); setListening(false); };
    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      finalTranscript = transcript;
      setInput(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      setInput("");
      if (finalTranscript.trim()) sendMessage(finalTranscript.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <div className={`chat-root ${dark ? "dark" : ""}`}>
      {/* Sidebar */}
      {mobileSidebarOpen && <div className="chat-sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />}
      <div className={`chat-sidebar ${sidebarOpen ? "open" : "closed"} ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        <div className="chat-sidebar-top">
          <div className="chat-sidebar-brand">
            <FiZap size={18} className="brand-icon" />
            <span>AI Chat</span>
          </div>
          <button className="btn-new-chat" onClick={newChat}>
            <FiPlus size={15} /> New Chat
          </button>
        </div>

        <div className="chat-history-label">Recent Chats</div>

        <div className="chat-history-list">
          {sessions.length === 0 ? (
            <p className="chat-no-history">No chats yet. Start a new one!</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s._id}
                className={`chat-history-item ${activeSession?._id === s._id ? "active" : ""}`}
                onClick={() => openSession(s)}
              >
                <FiMessageSquare size={13} className="history-icon" />
                <div className="history-item-info">
                  <span className="history-title">{s.title}</span>
                  <span className="history-date">{formatDate(s.updatedAt)}</span>
                </div>
                <button className="btn-delete-session" onClick={(e) => deleteSession(e, s._id)}>
                  <FiTrash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="chat-sidebar-bottom">
          <div className="chat-user-info">
            <div className="chat-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="chat-user-name">{user?.name}</p>
              <p className="chat-user-email">{user?.email}</p>
            </div>
          </div>
          <button className="btn-theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
            {dark ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="chat-main">
        <div className="chat-mobile-bar">
          <button className="btn-mobile-sidebar" onClick={() => setMobileSidebarOpen(true)}>
            <FiClock size={15} /> History
          </button>
          <span className="chat-mobile-title">AI Chat</span>
          <button className="btn-mobile-theme" onClick={() => setDark(!dark)}>
            {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
          </button>
          <button className="btn-mobile-new-chat" onClick={newChat}>
            <FiPlus size={15} /> New
          </button>
        </div>
        {!activeSession || messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">🤖</div>
            <h2 className="chat-welcome-title">Hi {user?.name?.split(" ")[0]}, how can I help?</h2>
            <p className="chat-welcome-sub">Ask me anything about your expenses and finances</p>
            <div className="chat-suggestion-grid">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-card" onClick={() => sendMessage(s.text)}>
                  <span className="suggestion-card-icon">{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message-row ${msg.role === "user" ? "user" : "ai"}`}>
                {msg.role === "assistant" && <div className="chat-ai-dot">🤖</div>}
                <div className={`chat-bubble ${msg.role === "user" ? "user" : "ai"}`}>
                  {msg.content.split("\n").filter(Boolean).map((line, j) => (
                    <p key={j} style={{ margin: 0 }}>{line}</p>
                  ))}
                  <span className="bubble-time">{formatTime(msg.time || new Date())}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message-row ai">
                <div className="chat-ai-dot">🤖</div>
                <div className="chat-bubble ai">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-box">
            <textarea
              className="chat-input"
              rows={1}
              placeholder="Ask about your expenses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={`btn-voice ${listening ? "listening" : ""}`}
              onClick={toggleVoice}
              title={listening ? "Stop listening" : "Voice input"}
            >
              {listening ? <FiMicOff size={15} /> : <FiMic size={15} />}
            </button>
            <button className="btn-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              <FiSend size={15} />
            </button>
          </div>
          <p className="chat-input-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
