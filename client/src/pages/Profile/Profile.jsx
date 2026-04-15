import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useExpense } from "../../context/ExpenseContext";
import API from "../../utils/api";
import "./Profile.css";
import toast from "react-hot-toast";
import Loading from "../../components/Loading/Loading";

const Profile = () => {
  const { user, login } = useAuth();
  const { summary } = useExpense();
  const spent = summary?.thisMonthSpent || 0;
  const income = summary?.monthlyIncome || 0;
  const total = summary?.totalTransactions || 0;
  const spentPct = income > 0 ? Math.min(Math.round((spent / income) * 100), 100) : 0;
  const budgetColor = spentPct < 50 ? "#16a34a" : spentPct < 80 ? "#f59e0b" : "#dc2626";
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    monthlyIncome: user?.monthlyIncome || "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        monthlyIncome: Number(form.monthlyIncome) || 0,
      };
      if (form.password) payload.password = form.password;
      const res = await API.put("/auth/profile", payload);
      login(res.data, localStorage.getItem("token"));
      toast.success("Profile updated!");
      setSuccess("");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="mb-4">
        <h5 className="page-title mb-0">Profile</h5>
      </div>

      <div className="profile-wrapper">
      <div className="profile-card p-4" style={{ width: "100%" }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div>
            <p className="fw-semibold mb-0">{user?.name}</p>
            <p className="text-muted small mb-0">{user?.email}</p>
          </div>
        </div>

        {/* Spending Summary */}
        <div className="profile-stats mb-4">
          <div className="profile-stat">
            <span className="profile-stat-value">₹{spent.toLocaleString()}</span>
            <span className="profile-stat-label">Spent this month</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{total}</span>
            <span className="profile-stat-label">Total expenses</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value" style={{ color: budgetColor }}>{spentPct}%</span>
            <span className="profile-stat-label">Budget used</span>
          </div>
        </div>

        {success && <div className="alert alert-success py-2 small">{success}</div>}
        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-medium">Name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Email</label>
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Monthly Income (₹)</label>
            <input className="form-control" type="number" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} min="0" placeholder="e.g. 50000" />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-medium">
              New Password 
            </label>
            <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} placeholder="(leave blank to keep current)" />
          </div>
          {loading && <Loading />}
          <button className="btn btn-primary px-4" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Profile;
