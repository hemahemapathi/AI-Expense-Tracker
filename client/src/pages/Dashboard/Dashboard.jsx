import { useEffect, useState } from "react";
import { useExpense } from "../../context/ExpenseContext";
import { useAuth } from "../../context/AuthContext";
import Charts from "../../components/Charts/Charts";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiList, FiArrowRight, FiDownload, FiZap } from "react-icons/fi";
import EmptyState from "../../components/EmptyState/EmptyState";
import { DashboardSkeleton } from "../../components/Skeleton/Skeleton";
import { useNavigate } from "react-router-dom";
import generateReport from "../../utils/generateReport";
import toast from "react-hot-toast";
import API from "../../utils/api";
import "./Dashboard.css";

const CATEGORY_EMOJI = {
  Food: "🍔", Transport: "🚗", Shopping: "🛍️", Bills: "💡",
  Health: "💊", Education: "📚", Entertainment: "🎬", Other: "📦",
};

const CATEGORY_COLORS = {
  Food: "#f59e0b", Transport: "#2563eb", Shopping: "#ec4899",
  Bills: "#dc2626", Health: "#16a34a", Education: "#8b5cf6",
  Entertainment: "#f97316", Other: "#6b7280",
};

const Dashboard = () => {
  const { summary, expenses, fetchExpenses, fetchSummary, loading } = useExpense();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchExpenses(); fetchSummary(); }, []);

  const [downloading, setDownloading] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [predLoading, setPredLoading] = useState(false);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    API.get("/goals").then((res) => setGoals(res.data)).catch(() => {});
  }, []);

  const fetchPrediction = async () => {
    setPredLoading(true);
    try {
      const res = await API.get("/ai/predict");
      setPrediction(res.data.prediction);
    } catch {
      toast.error("Failed to fetch prediction");
    } finally {
      setPredLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      generateReport(user, summary, expenses);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="mb-4">
        <h5 className="page-title mb-0">Dashboard</h5>
        <p className="page-subtitle mb-0">Welcome back, {user?.name} 👋</p>
      </div>
      <DashboardSkeleton />
    </div>
  );

  const balance = summary?.balance || 0;
  const income = summary?.monthlyIncome || 0;
  const spent = summary?.thisMonthSpent || 0;
  const spentPct = income > 0 ? Math.min((spent / income) * 100, 100) : 0;
  const budgetColor = spentPct < 50 ? "#16a34a" : spentPct < 80 ? "#f59e0b" : "#dc2626";

  const cards = [
    { label: "Monthly Income",     value: `₹${income.toLocaleString()}`,                      icon: <FiTrendingUp />,  cls: "income" },
    { label: "This Month Spent",   value: `₹${spent.toLocaleString()}`,                       icon: <FiTrendingDown />, cls: "spent" },
    { label: "Balance",            value: `₹${balance.toLocaleString()}`,                     icon: <FiDollarSign />,  cls: "balance" },
    { label: "Total Transactions", value: summary?.totalTransactions || 0,                    icon: <FiList />,        cls: "transactions" },
  ];

  // Top 3 categories this month
  const topCategories = summary?.byCategory
    ? Object.entries(summary.byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, amount]) => ({ name, amount, pct: spent > 0 ? Math.round((amount / spent) * 100) : 0 }))
    : [];

  // 6-month trend
  const sixMonthTrend = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.toLocaleDateString("en-US", { month: "short" }), year: d.getFullYear(), monthNum: d.getMonth(), amount: 0 });
    }
    (expenses || []).forEach((e) => {
      const d = new Date(e.date);
      const m = months.find(x => x.monthNum === d.getMonth() && x.year === d.getFullYear());
      if (m) m.amount += e.amount;
    });
    return months;
  };

  const trend = sixMonthTrend();
  const maxTrend = Math.max(...trend.map(t => t.amount), 1);

  // This month vs last month
  const lastMonthSpent = summary?.lastMonthSpent || (() => {
    const now = new Date();
    return (expenses || []).filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);
  })();
  const monthDiff = spent - lastMonthSpent;
  const monthDiffPct = lastMonthSpent > 0 ? Math.round(Math.abs(monthDiff / lastMonthSpent) * 100) : null;

  const recentExpenses = expenses.slice(0, 5);

  // Smart Alerts
  const alerts = [];
  if (spentPct >= 100) alerts.push({ type: "danger", msg: "🔴 You have exceeded your monthly budget!" });
  else if (spentPct >= 80) alerts.push({ type: "warning", msg: "⚠️ You've used 80% of your monthly budget. Slow down!" });
  if (summary?.byCategory) {
    Object.entries(summary.byCategory).forEach(([cat, amt]) => {
      const catPct = income > 0 ? (amt / income) * 100 : 0;
      if (catPct > 30) alerts.push({ type: "warning", msg: `⚠️ You're overspending on ${cat} — ₹${amt.toLocaleString()} (${Math.round(catPct)}% of income)` });
    });
  }
  if (monthDiff > 0 && monthDiffPct > 50) alerts.push({ type: "danger", msg: `🚨 This month's spending is ${monthDiffPct}% higher than last month!` });
  if (income > 0 && balance < 0) alerts.push({ type: "danger", msg: `🔴 Your balance is negative! You've overspent by ₹${Math.abs(balance).toLocaleString()}` });

  return (
    <div className="page-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h5 className="page-title mb-0">Dashboard</h5>
          <p className="page-subtitle mb-0">Welcome back, {user?.name} 👋</p>
        </div>
        <button className="btn-download" onClick={handleDownload} disabled={downloading}>
          <FiDownload size={14} />
          <span className="d-none d-sm-inline ms-1">{downloading ? "Generating..." : "Download Report"}</span>
        </button>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4 d-flex flex-column gap-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`alert-banner alert-${alert.type}`}>
              {alert.msg}
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div className="col-6 col-md-3" key={card.label}>
            <div className={`summary-card d-flex align-items-center gap-3 ${card.cls}`}>
              <div className="summary-icon">{card.icon}</div>
              <div style={{ minWidth: 0 }}>
                <div className="summary-label">{card.label}</div>
                <p className="summary-value">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
       {/* Charts */}
      <div className="mb-4">
        <Charts summary={summary} expenses={expenses} />
      </div>

      {/* AI Insights & Goals Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="dash-card quick-stat-card" onClick={() => navigate("/ai-insights")} style={{ cursor: "pointer", minHeight: 130 }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="quick-stat-label">AI Insights</p>
                <p className="quick-stat-value">Monthly · Budget · Anomaly</p>
                <p className="quick-stat-sub">Get AI-powered analysis of your spending</p>
              </div>
            </div>
            <div className="quick-stat-footer">
              <span>View Insights</span>
              <FiArrowRight size={13} />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="dash-card quick-stat-card" onClick={() => navigate("/goals")} style={{ cursor: "pointer", minHeight: 130 }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="quick-stat-label">Saving Goals</p>
                <p className="quick-stat-value">
                  {goals.length === 0 ? "No goals yet" : `${goals.filter(g => g.completed).length} / ${goals.length} completed`}
                </p>
                <p className="quick-stat-sub">
                  {goals.length === 0 ? "Set your first saving goal" :
                    goals.filter(g => !g.completed).length > 0 ?
                    `${goals.filter(g => !g.completed).length} goal${goals.filter(g => !g.completed).length > 1 ? "s" : ""} in progress` :
                    "All goals completed! 🎉"}
                </p>
              </div>
            </div>
            <div className="quick-stat-footer">
              <span>{goals.length === 0 ? "Create Goal" : "View Goals"}</span>
              <FiArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>

      {/* This Month vs Last Month */}
      <div className="dash-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span className="dash-card-title">Monthly Budget</span>
            <span className="dash-card-sub ms-2">₹{spent.toLocaleString()} of ₹{income.toLocaleString()}</span>
          </div>
          <span className="budget-pct-badge" style={{ background: budgetColor + "18", color: budgetColor }}>
            {spentPct.toFixed(0)}% used
          </span>
        </div>
        <div className="budget-bar-bg">
          <div className="budget-bar-fill" style={{ width: `${spentPct}%`, background: budgetColor }} />
        </div>
        <div className="d-flex justify-content-between mt-1">
          <span className="budget-hint">Remaining: ₹{Math.max(income - spent, 0).toLocaleString()}</span>
          <span className="budget-hint" style={{ color: budgetColor }}>
            {spentPct < 50 ? "✅ On track" : spentPct < 80 ? "⚠️ Watch spending" : "🔴 Over budget"}
          </span>
        </div>
      </div>

     

      {/* This Month vs Last Month */}
      <div className="dash-card mb-4">
        <span className="dash-card-title d-block mb-3">This Month vs Last Month</span>
        <div className="month-compare">
          <div className="month-compare-item">
            <span className="month-compare-label">Last Month</span>
            <span className="month-compare-value">₹{lastMonthSpent.toLocaleString()}</span>
          </div>
          <div className="month-compare-arrow">
            {monthDiff === 0 ? "=" : monthDiff > 0 ? "▲" : "▼"}
          </div>
          <div className="month-compare-item">
            <span className="month-compare-label">This Month</span>
            <span className="month-compare-value">₹{spent.toLocaleString()}</span>
          </div>
          <div className="month-compare-badge" style={{
            background: monthDiff <= 0 ? "#dcfce7" : "#fee2e2",
            color: monthDiff <= 0 ? "#16a34a" : "#dc2626"
          }}>
            {monthDiffPct !== null
              ? `${monthDiff <= 0 ? "↓" : "↑"} ${monthDiffPct}% ${monthDiff <= 0 ? "less" : "more"} than last month`
              : "No data for last month"}
          </div>
        </div>
      </div>

      {/* 6 Month Trend + Top Categories */}
      <div className="row g-3 mb-4">
        {/* 6 Month Trend */}
        <div className="col-12 col-md-7">
          <div className="dash-card h-100">
            <span className="dash-card-title d-block mb-3">6-Month Spending Trend</span>
            <div className="trend-chart">
              {trend.map((t, i) => (
                <div key={i} className="trend-col">
                  <div className="trend-bar-wrap">
                    <div
                      className="trend-bar"
                      style={{ height: `${(t.amount / maxTrend) * 100}%`, background: t.amount === Math.max(...trend.map(x => x.amount)) ? "#4f46e5" : "#c7d2fe" }}
                      title={`₹${t.amount.toLocaleString()}`}
                    />
                  </div>
                  <span className="trend-label">₹{t.amount >= 1000 ? (t.amount / 1000).toFixed(0) + "k" : t.amount}</span>
                  <span className="trend-month">{t.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="col-12 col-md-5">
          <div className="dash-card h-100">
            <span className="dash-card-title d-block mb-3">Top Spending Categories</span>
            {topCategories.length === 0 ? (
              <p className="text-muted small">No data yet</p>
            ) : (
              topCategories.map((cat, i) => (
                <div key={i} className="top-cat-row">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="top-cat-emoji">{CATEGORY_EMOJI[cat.name] || "📦"}</span>
                    <span className="top-cat-name">{cat.name}</span>
                    <span className="ms-auto top-cat-amount">₹{cat.amount.toLocaleString()}</span>
                    <span className="top-cat-pct">{cat.pct}%</span>
                  </div>
                  <div className="top-cat-bar-bg">
                    <div className="top-cat-bar-fill" style={{ width: `${cat.pct}%`, background: CATEGORY_COLORS[cat.name] || "#6b7280" }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Predict Future Expenses */}
      <div className="dash-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="dash-card-title">🔮 Predict Next Month</span>
          <button className="btn-refresh-pred" onClick={fetchPrediction} disabled={predLoading}>
            <FiZap size={13} /> {predLoading ? "Predicting..." : "Predict"}
          </button>
        </div>
        {predLoading ? (
          <div className="pred-skeleton" />
        ) : prediction ? (
          <div className="ai-pred-content">
            {prediction.split("\n").filter(Boolean).map((line, i) => (
              <p key={i} className={`pred-line ${line.startsWith("•") ? "pred-bullet" : ""}`}>{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-muted small mb-0">Click Predict to see your expected spending for next month</p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="dash-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="dash-card-title">Recent Transactions</span>
          <button className="btn-view-all" onClick={() => navigate("/expenses")}>
            View All <FiArrowRight size={13} />
          </button>
        </div>
        {recentExpenses.length === 0 ? (
          <EmptyState type="transactions" title="No transactions yet" description="Add your first expense to get started" />
        ) : (
          recentExpenses.map((e) => (
            <div key={e._id} className="recent-row d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="recent-emoji" style={{ background: (CATEGORY_COLORS[e.category] || "#6b7280") + "18" }}>
                  {CATEGORY_EMOJI[e.category] || "📦"}
                </div>
                <div>
                  <p className="recent-title mb-0">{e.title}</p>
                  <p className="recent-meta mb-0">
                    {e.category} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <span className="recent-amount">-₹{e.amount.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
