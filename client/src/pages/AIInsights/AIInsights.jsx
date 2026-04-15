import { useState, useEffect } from "react";
import API from "../../utils/api";
import { useExpense } from "../../context/ExpenseContext";
import { FiZap, FiTrendingUp, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import "./AIInsights.css";

const TABS = [
  { key: "insights",    label: "Monthly Insights",    icon: <FiZap size={15} />,          color: "#4f46e5" },
  { key: "suggestions", label: "Budget Suggestions",  icon: <FiTrendingUp size={15} />,   color: "#16a34a" },
  { key: "anomalies",   label: "Anomaly Detection",   icon: <FiAlertTriangle size={15} />, color: "#dc2626" },
];

const TAB_ICONS = { insights: "📊", suggestions: "💰", anomalies: "🔍" };

const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : null;

const Skeleton = () => (
  <div className="ai-loading">
    {[100, 85, 92, 75, 88, 80].map((w, i) => (
      <div key={i} className="ai-skeleton" style={{ width: `${w}%` }} />
    ))}
  </div>
);

const ContentBlock = ({ content, color }) => {
  if (!content) return null;
  if (content.startsWith("No ") || content.startsWith("Not enough")) {
    return (
      <div className="ai-empty-hint">
        <span className="ai-empty-icon">💡</span>
        <p className="mb-0">{content}</p>
      </div>
    );
  }
  return (
    <div className="ai-content">
      {content.split("\n").filter(Boolean).map((line, i) => (
        <p key={i} className={`ai-line ${line.startsWith("•") ? "ai-bullet" : ""}`}
          style={line.startsWith("•") ? { borderLeftColor: color + "40" } : {}}>
          {line}
        </p>
      ))}
    </div>
  );
};

const AIInsights = () => {
  const { summary, fetchSummary } = useExpense();
  const [activeTab, setActiveTab] = useState("insights");
  const [data, setData] = useState({ insights: "", suggestions: "", anomalies: "" });
  const [loading, setLoading] = useState({ insights: false, suggestions: false, anomalies: false });
  const [updatedAt, setUpdatedAt] = useState({ insights: null, suggestions: null, anomalies: null });
  const [generated, setGenerated] = useState({ insights: false, suggestions: false, anomalies: false });

  useEffect(() => {
    fetchSummary();
    return () => {
      localStorage.removeItem("ai_insights_data");
      localStorage.removeItem("ai_insights_time");
    };
  }, []);

  const fetchOne = async (key) => {
    const endpoints = { insights: "/ai/insights", suggestions: "/ai/budget-suggestions", anomalies: "/ai/anomalies" };
    const resKeys = { insights: "insights", suggestions: "suggestions", anomalies: "anomalies" };
    setLoading(p => ({ ...p, [key]: true }));
    setGenerated(p => ({ ...p, [key]: true }));
    try {
      const res = await API.get(endpoints[key]);
      const value = res.data[resKeys[key]];
      const time = new Date().toISOString();
      setData(p => ({ ...p, [key]: value }));
      setUpdatedAt(p => ({ ...p, [key]: time }));
    } finally {
      setLoading(p => ({ ...p, [key]: false }));
    }
  };

  const generateAll = async () => {
    await Promise.all(["insights", "suggestions", "anomalies"].map(fetchOne));
  };

  const income = summary?.monthlyIncome || 0;
  const spent = summary?.thisMonthSpent || 0;
  const spentPct = income > 0 ? Math.round((spent / income) * 100) : 0;
  const budgetColor = spentPct < 50 ? "#16a34a" : spentPct < 80 ? "#f59e0b" : "#dc2626";
  const activeColor = TABS.find(t => t.key === activeTab)?.color || "#4f46e5";

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="mb-4">
        <div className="ai-header-row">
          <h5 className="page-title mb-0">AI Insights</h5>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="ai-banner mb-4">
        <div className="ai-banner-main">
          <span className="ai-banner-headline">
            You spent <strong>₹{spent.toLocaleString()}</strong> this month —{" "}
            <span style={{ color: budgetColor }}>{spentPct}% of your income</span>
          </span>
          <span className="ai-banner-sub">
            ₹{Math.max(income - spent, 0).toLocaleString()} remaining · Monthly income ₹{income.toLocaleString()}
          </span>
        </div>
        <div className="ai-banner-bar-wrap">
          <div className="ai-banner-bar-bg">
            <div className="ai-banner-bar-fill" style={{ width: `${spentPct}%`, background: budgetColor }} />
          </div>
          <span className="ai-banner-status">
            {spentPct < 50 ? "✅ On track" : spentPct < 80 ? "⚠️ Watch spending" : "🔴 Over budget"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ai-tabs mb-3">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`ai-tab ${activeTab === tab.key ? "active" : ""}`}
            style={activeTab === tab.key ? { color: tab.color, borderBottomColor: tab.color } : {}}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="ai-tab-icon" style={activeTab === tab.key ? { background: tab.color + "15", color: tab.color } : {}}>
              {tab.icon}
            </span>
            {tab.label}
            {generated[tab.key] && !loading[tab.key] && (
              <span className="ai-tab-done">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {TABS.map(tab => activeTab === tab.key && (
        <div key={tab.key} className={`ai-card ${tab.key === "anomalies" ? "ai-card-anomaly" : ""}`}
          style={{ "--accent": tab.color }}>
          <div className="ai-card-header">
            <div className="ai-card-title-row">
              <span className="ai-icon-wrap">{tab.icon}</span>
              <div>
                <h6 className="ai-card-heading">{tab.label}</h6>
                <p className="ai-card-sub">
                  {tab.key === "insights" && "Analysis of your spending patterns this month"}
                  {tab.key === "suggestions" && "AI-recommended budget allocations for next month"}
                  {tab.key === "anomalies" && "Unusual or suspicious spending patterns detected"}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              {updatedAt[tab.key] && (
                <span className="ai-updated">Updated {formatTime(updatedAt[tab.key])}</span>
              )}
              {generated[tab.key] && (
                <button className="btn-refresh" onClick={() => fetchOne(tab.key)} disabled={loading[tab.key]}>
                  <FiRefreshCw size={14} className={loading[tab.key] ? "spin" : ""} />
                </button>
              )}
            </div>
          </div>
          <div className="ai-card-body">
            {!generated[tab.key] ? (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">{TAB_ICONS[tab.key]}</div>
                <p className="ai-welcome-sub" style={{ margin: 0 }}>
                  {tab.key === "insights" && "Analyze your spending patterns this month"}
                  {tab.key === "suggestions" && "Get AI-recommended budget allocations"}
                  {tab.key === "anomalies" && "Detect unusual spending patterns"}
                </p>
                <button className="btn-generate" onClick={() => fetchOne(tab.key)}>
                  <FiZap size={15} /> Generate
                </button>
              </div>
            ) : loading[tab.key] ? <Skeleton /> : <ContentBlock content={data[tab.key]} color={tab.color} />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIInsights;
