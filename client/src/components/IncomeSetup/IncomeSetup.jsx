import { useState } from "react";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import "./IncomeSetup.css";

const IncomeSetup = ({ onDone }) => {
  const { user, login } = useAuth();
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.put("/auth/profile", { monthlyIncome: Number(income) });
      login(res.data, localStorage.getItem("token"));
      onDone();
    } catch {
      setError("Failed to save income. You can update it later in Profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="income-modal" style={{ maxWidth: 400, width: "100%" }}>
        <div className="income-header">
          <h5 className="fw-bold mb-1">Set Your Monthly Income</h5>
        </div>

        <div className="income-body">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Monthly Income (₹)</label>
              <input
                className="form-control"
                type="number"
                min="1"
                placeholder="e.g. 50000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
  );
};

export default IncomeSetup;
