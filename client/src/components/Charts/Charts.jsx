import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import "./Charts.css";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6", "#ec4899", "#14b8a6", "#9ca3af"];

const Charts = ({ summary, expenses }) => {
  const pieData = summary?.byCategory
    ? Object.entries(summary.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  const last7Days = () => {
    const map = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      map[key] = 0;
    }
    (expenses || [])
      .forEach((e) => {
        const key = new Date(e.date).toLocaleDateString("en-US", { weekday: "short" });
        if (map[key] !== undefined) map[key] += e.amount;
      });
    return Object.entries(map).map(([day, amount]) => ({ day, amount }));
  };

  return (
    <div className="row g-3">
      <div className="col-12 col-md-5">
        <div className="chart-card h-100">
          <p className="chart-title">Spending by Category</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="d-flex align-items-center justify-content-center" style={{ height: 210 }}>
              <p className="text-muted small mb-0">No data yet</p>
            </div>
          )}
        </div>
      </div>
      <div className="col-12 col-md-7">
        <div className="chart-card h-100">
          <p className="chart-title">Last 7 Days Spending</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={last7Days()} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
