import { FiX, FiEdit2, FiTrash2, FiTag, FiCalendar, FiFileText, FiDollarSign } from "react-icons/fi";
import "./ExpenseDetail.css";

const ExpenseDetail = ({ expense, onClose, onEdit, onDelete }) => {
  if (!expense) return null;
  const { title, amount, category, date, note } = expense;

  return (
    <div className="detail-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h6 className="fw-semibold mb-0">Expense Details</h6>
          <button className="detail-close" onClick={onClose}><FiX size={18} /></button>
        </div>

        <div className="detail-body">
          {/* Amount */}
          <div className="detail-amount-block">
            <span className="detail-amount">-₹{amount.toLocaleString()}</span>
            <span className="detail-title">{title}</span>
          </div>

          {/* Info rows */}
          <div className="detail-info">
            <div className="detail-row">
              <span className="detail-icon"><FiTag size={15} /></span>
              <span className="detail-key">Category</span>
              <span className="detail-val">
                <span className="category-pill">{category}</span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-icon"><FiCalendar size={15} /></span>
              <span className="detail-key">Date</span>
              <span className="detail-val">
                {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            {note && (
              <div className="detail-row">
                <span className="detail-icon"><FiFileText size={15} /></span>
                <span className="detail-key">Note</span>
                <span className="detail-val">{note}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-icon"><FiDollarSign size={15} /></span>
              <span className="detail-key">Amount</span>
              <span className="detail-val fw-semibold text-danger">₹{amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="detail-footer">
          <button className="btn btn-light btn-sm d-flex align-items-center gap-1" onClick={() => { onEdit(expense); onClose(); }}>
            <FiEdit2 size={13} /> Edit
          </button>
          <button className="btn btn-danger btn-sm d-flex align-items-center gap-1" onClick={() => { onDelete(expense._id); onClose(); }}>
            <FiTrash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
