const icons = {
  expenses: "💸",
  transactions: "📋",
  search: "🔍",
  default: "📭",
};

const EmptyState = ({ type = "default", title, description, action }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icons[type]}</div>
    <h6 className="fw-semibold mb-1">{title}</h6>
    {description && <p className="text-muted small mb-3" style={{ maxWidth: 280 }}>{description}</p>}
    {action && action}
  </div>
);

export default EmptyState;
