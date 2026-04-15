import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./ExpenseCard.css";

const CATEGORY_COLORS = {
  Food:          { bg: "#fef3c7", color: "#92400e" },
  Transport:     { bg: "#dbeafe", color: "#1e40af" },
  Shopping:      { bg: "#fce7f3", color: "#9d174d" },
  Bills:         { bg: "#fee2e2", color: "#991b1b" },
  Health:        { bg: "#d1fae5", color: "#065f46" },
  Education:     { bg: "#ede9fe", color: "#5b21b6" },
  Entertainment: { bg: "#ffedd5", color: "#9a3412" },
  Other:         { bg: "#f3f4f6", color: "#374151" },
};

const CATEGORY_EMOJI = {
  Food: "🍔", Transport: "🚗", Shopping: "🛍️", Bills: "💡",
  Health: "💊", Education: "📚", Entertainment: "🎬", Other: "📦",
};

const TITLE_EMOJI = [
  { keywords: ["water"],                emoji: "💧" },
  { keywords: ["electricity", "electric", "power"], emoji: "⚡" },
  { keywords: ["gas"],                  emoji: "🔥" },
  { keywords: ["internet", "wifi", "broadband"], emoji: "📶" },
  { keywords: ["phone", "mobile", "recharge"],   emoji: "📱" },
  { keywords: ["rent", "house"],        emoji: "🏠" },
  { keywords: ["grocery", "groceries"], emoji: "🛒" },
  { keywords: ["fuel", "petrol", "diesel"], emoji: "⛽" },
  { keywords: ["movie", "cinema"],      emoji: "🎬" },
  { keywords: ["gym", "fitness"],       emoji: "🏋️" },
  { keywords: ["medicine", "medical", "doctor"], emoji: "💊" },
  { keywords: ["school", "college", "tuition"],  emoji: "🎓" },
  { keywords: ["restaurant", "dinner", "lunch", "breakfast"], emoji: "🍽️" },
  { keywords: ["coffee", "cafe"],       emoji: "☕" },
  { keywords: ["travel", "trip", "flight", "train", "bus"], emoji: "✈️" },
  { keywords: ["taxi", "uber", "ola", "auto"],   emoji: "🚕" },
];

const getEmoji = (title, category) => {
  const lower = title.toLowerCase();
  const match = TITLE_EMOJI.find(({ keywords }) => keywords.some(k => lower.includes(k)));
  return match ? match.emoji : (CATEGORY_EMOJI[category] || "📦");
};

const ExpenseCard = ({ expense, onEdit, onDelete, onClick }) => {
  const { title, category, amount, date } = expense;
  const style = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  const emoji = getEmoji(title, category);
  const formattedDate = date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div className="expense-card" onClick={onClick}>
      <div className="expense-card-left">
        <div className="expense-emoji-icon" style={{ background: style.bg, color: style.color }}>
          {emoji}
        </div>
        <div className="expense-info">
          <span className="expense-title">{title}</span>
          <div className="expense-meta">
            <span className="expense-category-pill" style={{ background: style.bg, color: style.color }}>{category}</span>
            {formattedDate && <span className="expense-date">{formattedDate}</span>}
          </div>
        </div>
      </div>
      <div className="expense-card-right">
        <span className="expense-amount">-₹{amount.toLocaleString()}</span>
        <div className="expense-actions">
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(expense); }} title="Edit">
            <FiEdit2 size={13} />
          </button>
          <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); onDelete(expense._id); }} title="Delete">
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
