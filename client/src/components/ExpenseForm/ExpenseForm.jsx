import { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiCalendar, FiZap, FiCamera } from "react-icons/fi";
import API from "../../utils/api";
import toast from "react-hot-toast";
import "./ExpenseForm.css";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Education", "Entertainment", "Other"];
const defaultForm = { title: "", amount: "", category: "Other", date: "", note: "" };

const ExpenseForm = ({ onSubmit, editData, onClose }) => {
  const [form, setForm] = useState(defaultForm);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [categorizing, setCategorizing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef(null);
  const isMobile = window.innerWidth <= 576;

  useEffect(() => {
    if (editData) {
      setForm({ ...editData, date: editData.date ? new Date(editData.date).toISOString().split("T")[0] : "" });
    } else {
      setForm(defaultForm);
    }
  }, [editData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  const autoCategorize = async () => {
    if (!form.title.trim()) return toast.error("Enter a title first");
    setCategorizing(true);
    try {
      const res = await API.post("/ai/categorize", { title: form.title });
      setForm((prev) => ({ ...prev, category: res.data.category }));
      toast.success(`Category set to ${res.data.category}`);
    } catch {
      toast.error("Auto-categorize failed");
    } finally {
      setCategorizing(false);
    }
  };

  const handleScanBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return toast.error("Image must be under 4MB");

    setScanning(true);
    const toastId = toast.loading("Scanning bill...");
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const base64 = ev.target.result;
          const res = await API.post("/ai/scan-bill", { imageBase64: base64 });
          setForm((prev) => ({
            ...prev,
            title: res.data.title || prev.title,
            amount: res.data.amount || prev.amount,
            category: res.data.category || prev.category,
            note: res.data.note || prev.note,
          }));
          toast.success("Bill scanned successfully!", { id: toastId });
        } catch {
          toast.error("Could not read bill. Try a clearer image.", { id: toastId });
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Scan failed", { id: toastId });
      setScanning(false);
    }
    e.target.value = "";
  };

  const formatDisplay = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Select date";

  return (
    <>
      <div className="modal fade show d-block expense-modal-backdrop" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editData ? "Edit Expense" : "Add Expense"}</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-medium">Title</label>
                  <div className="d-flex gap-2">
                    <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 text-nowrap"
                      onClick={autoCategorize}
                      disabled={categorizing}
                      title="Auto-detect category"
                    >
                      <FiZap size={13} /> {categorizing ? "..." : "AI"}
                    </button>
                    {!editData && (
                      <>
                        <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleScanBill} />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 text-nowrap"
                          onClick={() => fileRef.current.click()}
                          disabled={scanning}
                          title="Scan a bill/receipt"
                        >
                          <FiCamera size={13} /> {scanning ? "..." : "Scan"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-medium">Amount (₹)</label>
                    <input className="form-control" type="number" name="amount" value={form.amount} onChange={handleChange} required min="0" />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-medium">Category</label>
                    {isMobile ? (
                      <button type="button" className="form-control text-start d-flex justify-content-between align-items-center category-btn" onClick={() => setShowCategoryModal(true)}>
                        <span>{form.category}</span><FiChevronDown size={14} />
                      </button>
                    ) : (
                      <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-medium">Date</label>
                  {isMobile ? (
                    <button type="button" className="form-control text-start d-flex justify-content-between align-items-center category-btn" onClick={() => { setTempDate(form.date); setShowDateModal(true); }}>
                      <span className={form.date ? "" : "text-muted"}>{formatDisplay(form.date)}</span>
                      <FiCalendar size={14} />
                    </button>
                  ) : (
                    <input className="form-control" type="date" name="date" value={form.date} onChange={handleChange} />
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-medium">Note <span className="text-muted">(optional)</span></label>
                  <input className="form-control" name="note" value={form.note} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editData ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showCategoryModal && (
        <div className="category-modal-backdrop" onClick={() => setShowCategoryModal(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="category-modal-header">
              <span className="fw-semibold">Select Category</span>
              <button className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
            </div>
            <div className="category-modal-body">
              {CATEGORIES.map((c) => (
                <button key={c} className={`category-option ${form.category === c ? "active" : ""}`} onClick={() => { setForm({ ...form, category: c }); setShowCategoryModal(false); }}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="category-modal-backdrop" onClick={() => setShowDateModal(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="category-modal-header">
              <span className="fw-semibold">Select Date</span>
              <button className="btn-close" onClick={() => setShowDateModal(false)}></button>
            </div>
            <div className="category-modal-body">
              <input className="form-control mb-3" type="date" value={tempDate} onChange={(e) => setTempDate(e.target.value)} />
              <button className="btn btn-primary w-100" onClick={() => { setForm({ ...form, date: tempDate }); setShowDateModal(false); }}>Confirm Date</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseForm;
