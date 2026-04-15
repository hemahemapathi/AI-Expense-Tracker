import Expense from "../models/Expense.js";
import User from "../models/User.js";

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, type, date, note } = req.body;
    const expense = await Expense.create({
      user: req.user.id,
      title,
      amount,
      category,
      type,
      date,
      note,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const expenses = await Expense.find({ user: req.user.id });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const now = new Date();
    const thisMonthSpent = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    res.json({
      totalSpent,
      thisMonthSpent,
      totalTransactions: expenses.length,
      monthlyIncome: user.monthlyIncome || 0,
      balance: (user.monthlyIncome || 0) - thisMonthSpent,
      byCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
