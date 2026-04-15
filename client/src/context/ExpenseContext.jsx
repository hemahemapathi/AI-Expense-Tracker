import { createContext, useContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import API from "../utils/api";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await API.get("/expenses/summary");
      setSummary(res.data);
    } catch {
      toast.error("Failed to load summary");
    }
  }, []);

  const addExpense = async (data) => {
    const toastId = toast.loading("Adding expense...");
    try {
      const res = await API.post("/expenses", data);
      setExpenses((prev) => [res.data, ...prev]);
      toast.success("Expense added!", { id: toastId });
    } catch {
      toast.error("Failed to add expense", { id: toastId });
    }
  };

  const updateExpense = async (id, data) => {
    const toastId = toast.loading("Updating...");
    try {
      const res = await API.put(`/expenses/${id}`, data);
      setExpenses((prev) => prev.map((e) => (e._id === id ? res.data : e)));
      toast.success("Expense updated!", { id: toastId });
    } catch {
      toast.error("Failed to update expense", { id: toastId });
    }
  };

  const deleteExpense = async (id) => {
    const toastId = toast.loading("Deleting...");
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      toast.success("Expense deleted!", { id: toastId });
    } catch {
      toast.error("Failed to delete expense", { id: toastId });
    }
  };

  return (
    <ExpenseContext.Provider
      value={{ expenses, summary, loading, fetchExpenses, fetchSummary, addExpense, updateExpense, deleteExpense }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => useContext(ExpenseContext);
