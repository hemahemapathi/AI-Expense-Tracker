import { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiTarget, FiX } from "react-icons/fi";
import EmptyState from "../../components/EmptyState/EmptyState";
import "./Goals.css";

const EMOJIS = ["🎯", "💻", "🏍️", "🚗", "🏠", "✈️", "📱", "💍", "🎓", "💰", "🏋️", "🎮"];

const GoalForm = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ title: "", targetAmount: "", emoji: "🎯", deadline: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/goals", form);
      onSave(res.data);
      toast.success("Goal created!");
      onClose();
    } catch {
      toast.error("Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goal-modal-backdrop" onClick={onClose}>
      <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="goal-modal-header">
          <h6 className="fw-bold mb-0">New Saving Goal</h6>
          <button className="btn-icon-close" onClick={onClose}><FiX size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="goal-modal-body">
          <div className="mb-3">
            <label className="form-label small fw-medium">Pick an Emoji</label>
            <div className="emoji-grid">
              {EMOJIS.map((e) => (
                <button key={e} type="button" className={`emoji-btn ${form.emoji === e ? "active" : ""}`} onClick={() => setForm({ ...form, emoji: e })}>{e}</button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Goal Title</label>
            <input className="form-control" placeholder="e.g. Buy a Laptop" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Target Amount (₹)</label>
            <input className="form-control" type="number" min="1" placeholder="e.g. 60000" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-medium">Deadline <span className="text-muted">(optional)</span></label>
            <input className="form-control" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>{loading ? "Creating..." : "Create Goal"}</button>
        </form>
      </div>
    </div>
  );
};

const AddSavingsModal = ({ goal, onClose, onSave }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post(`/goals/${goal._id}/save`, { amount: Number(amount) });
      onSave(res.data);
      toast.success(`₹${Number(amount).toLocaleString()} added!`);
      onClose();
    } catch {
      toast.error("Failed to add savings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goal-modal-backdrop" onClick={onClose}>
      <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="goal-modal-header">
          <h6 className="fw-bold mb-0">{goal.emoji} Add Savings</h6>
          <button className="btn-icon-close" onClick={onClose}><FiX size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="goal-modal-body">
          <p className="text-muted small mb-3">
            Current: ₹{goal.savedAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
          </p>
          <div className="mb-4">
            <label className="form-label small fw-medium">Amount to Add (₹)</label>
            <input className="form-control" type="number" min="1" max={goal.targetAmount - goal.savedAmount} placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>{loading ? "Saving..." : "Add Savings"}</button>
        </form>
      </div>
    </div>
  );
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [savingGoal, setSavingGoal] = useState(null);

  useEffect(() => {
    API.get("/goals")
      .then((res) => setGoals(res.data))
      .catch(() => toast.error("Failed to load goals"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    toast((t) => (
      <div>
        <p className="mb-2 small fw-medium">Delete this goal?</p>
        <div className="d-flex gap-2">
          <button className="btn btn-danger btn-sm" onClick={async () => {
            toast.dismiss(t.id);
            await API.delete(`/goals/${id}`);
            setGoals((prev) => prev.filter((g) => g._id !== id));
            toast.success("Goal deleted");
          }}>Delete</button>
          <button className="btn btn-light btn-sm" onClick={() => toast.dismiss(t.id)}>Cancel</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleSaveUpdate = (updated) => {
    setGoals((prev) => prev.map((g) => g._id === updated._id ? updated : g));
    if (updated.completed) toast.success(`🎉 Goal "${updated.title}" completed!`);
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-0">Saving Goals</h5>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowForm(true)}>
          <FiPlus size={15} /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="row g-3">
          {[...Array(3)].map((_, i) => <div key={i} className="col-12 col-md-6 col-lg-4"><div className="goal-card-skeleton" /></div>)}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          type="default"
          title="No goals yet"
          description="Set a saving goal and track your progress"
          action={<button className="btn btn-primary d-flex align-items-center gap-1 mx-auto" onClick={() => setShowForm(true)}><FiPlus size={15} /></button>}
        />
      ) : (
        <div className="row g-3">
          {goals.map((goal) => {
            const pct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
            const remaining = goal.targetAmount - goal.savedAmount;
            const barColor = pct >= 100 ? "#16a34a" : pct >= 60 ? "#2563eb" : pct >= 30 ? "#f59e0b" : "#e5e7eb";
            return (
              <div key={goal._id} className="col-12 col-md-6 col-lg-4">
                <div className={`goal-card ${goal.completed ? "completed" : ""}`}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="goal-emoji">{goal.emoji}</span>
                      <div>
                        <h6 className="fw-bold mb-0">{goal.title}</h6>
                        {goal.deadline && <p className="text-muted small mb-0">By {new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
                      </div>
                    </div>
                    <button className="btn-icon-sm" onClick={() => handleDelete(goal._id)}><FiTrash2 size={13} /></button>
                  </div>

                  <div className="goal-amounts mb-2">
                    <span className="goal-saved">₹{goal.savedAmount.toLocaleString()}</span>
                    <span className="goal-target">of ₹{goal.targetAmount.toLocaleString()}</span>
                  </div>

                  <div className="goal-bar-bg mb-1">
                    <div className="goal-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="goal-pct" style={{ color: barColor }}>{pct}% saved</span>
                    {!goal.completed && <span className="goal-remaining">₹{remaining.toLocaleString()} to go</span>}
                    {goal.completed && <span className="goal-done-badge">🎉 Completed!</span>}
                  </div>

                  {!goal.completed && (
                    <button className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1" onClick={() => setSavingGoal(goal)}>
                      <FiTarget size={13} /> Add Savings
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <GoalForm onClose={() => setShowForm(false)} onSave={(g) => setGoals((prev) => [g, ...prev])} />}
      {savingGoal && <AddSavingsModal goal={savingGoal} onClose={() => setSavingGoal(null)} onSave={handleSaveUpdate} />}
    </div>
  );
};

export default Goals;
