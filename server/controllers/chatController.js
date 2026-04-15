import ChatSession from "../models/ChatSession.js";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Groq from "groq-sdk";

// GET all sessions for user
export const getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user.id })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create new session
export const createSession = async (req, res) => {
  try {
    const session = await ChatSession.create({ user: req.user.id, title: "New Chat", messages: [] });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single session
export const getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE session
export const deleteSession = async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST send message in session
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });

    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const user = await User.findById(req.user.id);
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 }).limit(100);

    const expenseSummary = expenses.map((e) => ({
      title: e.title, amount: e.amount, category: e.category,
      date: new Date(e.date).toLocaleDateString("en-IN"), note: e.note,
    }));

    const history = session.messages.map((m) => ({ role: m.role, content: m.content }));

    const aiMessages = [
      {
        role: "system",
        content: `You are a helpful personal finance assistant. The user's monthly income is ₹${user.monthlyIncome}. Here are their recent expenses: ${JSON.stringify(expenseSummary)}. Answer questions about their spending clearly and concisely. Use ₹ for currency.`,
      },
      ...history,
      { role: "user", content: message },
    ];

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: aiMessages,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content.trim();

    // Save both messages
    session.messages.push({ role: "user", content: message });
    session.messages.push({ role: "assistant", content: reply });

    // Auto-title from first message
    if (session.messages.length === 2) {
      session.title = message.length > 40 ? message.substring(0, 40) + "..." : message;
    }

    await session.save();
    res.json({ reply, session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
