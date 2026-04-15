import { useEffect, useState, useMemo } from "react";
import { useExpense } from "../../context/ExpenseContext";
import ExpenseCard from "../../components/ExpenseCard/ExpenseCard";
import ExpenseForm from "../../components/ExpenseForm/ExpenseForm";
import ExpenseDetail from "../../components/ExpenseDetail/ExpenseDetail";
import Loading from "../../components/Loading/Loading";
import EmptyState from "../../components/EmptyState/EmptyState";
import { ExpenseListSkeleton } from "../../components/Skeleton/Skeleton";
import { FiPlus, FiChevronDown, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";
import "./Expenses.css";

const CATEGORIES = ["All", "Food", "Transport", "Shopping", "Bills", "Health", "Education", "Entertainment", "Other"];
const DATE_RANGES = ["All Time", "Today", "This Week", "This Month", "Last Month", "Custom"];
const PAGE_SIZE = 10;

const Expenses = () => {
  const { expenses, fetchExpenses, fetchSummary, addExpense, updateExpense, deleteExpense, loading } = useExpense();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState({ category: "All", search: "", dateRange: "All Time", from: "", to: "" });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [page, setPage] = useState(1);
  const isMobile = window.innerWidth <= 576;

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (data) => {
    if (editData) await updateExpense(editData._id, data);
    else await addExpense(data);
    await fetchSummary();
    setShowForm(false);
    setEditData(null);
  };

  const handleEdit = (expense) => { setEditData(expense); setShowForm(true); };

  const handleDelete = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    await deleteExpense(deleteId);
    await fetchSummary();
    setDeleteId(null);
  };

  const getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    if (range === "Today") { start.setHours(0, 0, 0, 0); return { from: start, to: now }; }
    if (range === "This Week") { start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); return { from: start, to: now }; }
    if (range === "This Month") { start.setDate(1); start.setHours(0, 0, 0, 0); return { from: start, to: now }; }
    if (range === "Last Month") {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from, to };
    }
    return null;
  };

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchCategory = filter.category === "All" || e.category === filter.category;
      const matchSearch = e.title.toLowerCase().includes(filter.search.toLowerCase());
      let matchDate = true;
      if (filter.dateRange === "Custom") {
        const d = new Date(e.date);
        if (filter.from) matchDate = matchDate && d >= new Date(filter.from);
        if (filter.to) matchDate = matchDate && d <= new Date(filter.to);
      } else if (filter.dateRange !== "All Time") {
        const range = getDateRange(filter.dateRange);
        if (range) { const d = new Date(e.date); matchDate = d >= range.from && d <= range.to; }
      }
      return matchCategory && matchSearch && matchDate;
    });
  }, [expenses, filter]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }, [expenses]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > page * PAGE_SIZE;

  const exportCSV = () => {
    if (filtered.length === 0) { toast.error("No expenses to export"); return; }
    const headers = ["Title", "Amount", "Category", "Date", "Note"];
    const rows = filtered.map((e) => [e.title, e.amount, e.category, new Date(e.date).toLocaleDateString(), e.note || ""]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "expenses.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported successfully!");
  };

  return (
    <div className="page-wrapper">
      <div className="d-flex justify-content-between align-items-center expenses-header flex-wrap gap-2">
        <div>
          <h5 className="page-title mb-0">Expenses</h5>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-export" onClick={exportCSV} title="Export CSV"><FiDownload size={15} /></button>
          <button className="btn-add" onClick={() => { setEditData(null); setShowForm(true); }}>
            <FiPlus size={15} /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="row g-2">
          <div className="col-12 col-sm-4">
            <input className="form-control form-control-sm" placeholder="Search by title..." value={filter.search} onChange={(e) => { setFilter({ ...filter, search: e.target.value }); setPage(1); }} />
          </div>
          <div className="col-6 col-sm-4">
            {isMobile ? (
              <button type="button" className="form-control form-control-sm text-start d-flex justify-content-between align-items-center category-btn" onClick={() => setShowCategoryModal(true)}>
                <span>{filter.category}</span><FiChevronDown size={14} />
              </button>
            ) : (
              <select className="form-select form-select-sm" value={filter.category} onChange={(e) => { setFilter({ ...filter, category: e.target.value }); setPage(1); }}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>
          <div className="col-6 col-sm-4">
            {isMobile ? (
              <button type="button" className="form-control form-control-sm text-start d-flex justify-content-between align-items-center category-btn" onClick={() => setShowDateModal(true)}>
                <span>{filter.dateRange}</span><FiChevronDown size={14} />
              </button>
            ) : (
              <select className="form-select form-select-sm" value={filter.dateRange} onChange={(e) => { setFilter({ ...filter, dateRange: e.target.value }); setPage(1); }}>
                {DATE_RANGES.map((d) => <option key={d}>{d}</option>)}
              </select>
            )}
          </div>
          {filter.dateRange === "Custom" && (
            <>
              <div className="col-6">
                <input className="form-control form-control-sm" type="date" value={filter.from} onChange={(e) => { setFilter({ ...filter, from: e.target.value }); setPage(1); }} />
              </div>
              <div className="col-6">
                <input className="form-control form-control-sm" type="date" value={filter.to} onChange={(e) => { setFilter({ ...filter, to: e.target.value }); setPage(1); }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <ExpenseListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          type={filter.search || filter.category !== "All" || filter.dateRange !== "All Time" ? "search" : "expenses"}
          title={filter.search || filter.category !== "All" || filter.dateRange !== "All Time" ? "No results found" : "No expenses yet"}
          description={filter.search || filter.category !== "All" || filter.dateRange !== "All Time" ? "Try adjusting your filters" : "Start by adding your first expense"}
          action={!filter.search && filter.category === "All" && filter.dateRange === "All Time" && (
            <button className="btn-add" onClick={() => setShowForm(true)}><FiPlus size={15} /> Add Expense</button>
          )}
        />
      ) : (
        <>
          {paginated.map((e) => (
            <ExpenseCard key={e._id} expense={e} onEdit={handleEdit} onDelete={handleDelete} onClick={() => setSelectedExpense(e)} />
          ))}
          {hasMore && (
            <div className="text-center mt-3">
              <button className="btn btn-light btn-sm px-4" onClick={() => setPage((p) => p + 1)}>Load More</button>
            </div>
          )}
          <p className="text-muted small text-center mt-2">Showing {paginated.length} of {filtered.length}</p>
        </>
      )}

      {/* Mobile Category Modal */}
      {showCategoryModal && (
        <div className="category-modal-backdrop" onClick={() => setShowCategoryModal(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="category-modal-header">
              <span className="fw-semibold">Select Category</span>
              <button className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
            </div>
            <div className="category-modal-body">
              {CATEGORIES.map((c) => (
                <button key={c} className={`category-option ${filter.category === c ? "active" : ""}`} onClick={() => { setFilter({ ...filter, category: c }); setPage(1); setShowCategoryModal(false); }}>
                  <span>{c}</span>
                  {c !== "All" && categoryTotals[c] ? <span className="category-option-total">₹{categoryTotals[c].toLocaleString()}</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Date Range Modal */}
      {showDateModal && (
        <div className="category-modal-backdrop" onClick={() => setShowDateModal(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="category-modal-header">
              <span className="fw-semibold">Select Date Range</span>
              <button className="btn-close" onClick={() => setShowDateModal(false)}></button>
            </div>
            <div className="category-modal-body">
              {DATE_RANGES.map((d) => (
                <button key={d} className={`category-option ${filter.dateRange === d ? "active" : ""}`} onClick={() => { setFilter({ ...filter, dateRange: d }); setPage(1); setShowDateModal(false); }}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && <ExpenseForm onSubmit={handleSubmit} editData={editData} onClose={() => { setShowForm(false); setEditData(null); }} />}
      {selectedExpense && <ExpenseDetail expense={selectedExpense} onClose={() => setSelectedExpense(null)} onEdit={handleEdit} onDelete={handleDelete} />}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="delete-backdrop" onClick={() => setDeleteId(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">🗑️</div>
            <h6 className="delete-title">Delete Expense?</h6>
            <p className="delete-sub">This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
