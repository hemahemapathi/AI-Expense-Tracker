import Expense from "../models/Expense.js";
import User from "../models/User.js";
import Goal from "../models/Goal.js";
import chat from "../services/groqaiService.js";
import Groq from "groq-sdk";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Education", "Entertainment", "Other"];

// 1. Auto Categorize
export const categorize = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const result = await chat(
      `You are an expense categorizer. Given an expense title, return ONLY one category from this list: ${CATEGORIES.join(", ")}. Return just the category name, nothing else.`,
      `Expense title: "${title}"`
    );
    const category = CATEGORIES.find((c) => c.toLowerCase() === result.toLowerCase()) || "Other";
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Monthly Insights
export const insights = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const expenses = await Expense.find({ user: req.user.id });
    const goals = await Goal.find({ user: req.user.id });

    if (expenses.length === 0) return res.json({ insights: "No expenses found. Start adding expenses to get insights." });
    const now = new Date();
    const thisMonth = expenses.filter((e) => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const lastMonth = expenses.filter((e) => { const d = new Date(e.date); return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear(); });
    const summary = {
      monthlyIncome: user.monthlyIncome,
      thisMonthTotal: thisMonth.reduce((s, e) => s + e.amount, 0),
      lastMonthTotal: lastMonth.reduce((s, e) => s + e.amount, 0),
      byCategory: thisMonth.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {}),
      totalTransactions: thisMonth.length,
      goals: goals.map((g) => ({ title: g.title, target: g.targetAmount, saved: g.savedAmount, completed: g.completed })),
    };
    const result = await chat(
      "You are a personal finance advisor. Analyze the user's expense data and saving goals, then provide 4-5 clear, concise insights. Include goal progress in your analysis. Use ₹ for currency. Be specific with numbers. Format as bullet points starting with •",
      `User expense data: ${JSON.stringify(summary)}`
    );
    res.json({ insights: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Budget Suggestions
export const budgetSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const expenses = await Expense.find({ user: req.user.id });
    const goals = await Goal.find({ user: req.user.id, completed: false });

    if (expenses.length === 0) return res.json({ suggestions: "No expense history found. Add some expenses first to get budget suggestions." });
    const byCategory = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
    const months = [...new Set(expenses.map((e) => `${new Date(e.date).getMonth()}-${new Date(e.date).getFullYear()}`))].length || 1;
    const avgByCategory = Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, Math.round(v / months)]));
    const goalsSummary = goals.map((g) => ({ title: g.title, target: g.targetAmount, saved: g.savedAmount, remaining: g.targetAmount - g.savedAmount }));

    const result = await chat(
      "You are a personal finance advisor. Based on the user's average monthly spending, income, and saving goals, suggest a realistic budget for next month. Factor in how much they need to save monthly to reach their goals. Use ₹ for currency. Format as bullet points starting with • with category name and suggested amount. Include a savings allocation for goals. End with total and a tip.",
      `Monthly income: ₹${user.monthlyIncome}, Average monthly spending by category: ${JSON.stringify(avgByCategory)}, Active saving goals: ${JSON.stringify(goalsSummary)}`
    );
    res.json({ suggestions: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Chat with Expenses (AI Financial Advisor)
export const chatWithExpenses = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const user = await User.findById(req.user.id);
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 }).limit(100);
    const goals = await Goal.find({ user: req.user.id });
    const expenseSummary = expenses.map((e) => ({ title: e.title, amount: e.amount, category: e.category, date: new Date(e.date).toLocaleDateString("en-IN"), note: e.note }));
    const goalsSummary = goals.map((g) => ({ title: g.title, target: g.targetAmount, saved: g.savedAmount, completed: g.completed }));
    const messages = [
      {
        role: "system",
        content: `You are an expert AI financial advisor and personal finance assistant. The user's monthly income is ₹${user.monthlyIncome}. Here are their recent expenses: ${JSON.stringify(expenseSummary)}. Their saving goals: ${JSON.stringify(goalsSummary)}.
Your role:
- Answer questions about their spending clearly and concisely
- Give personalized financial advice based on their actual data
- Help them make smart financial decisions (e.g. can they afford something)
- Factor in their saving goals when giving advice
- Suggest ways to save money and reduce unnecessary spending
- Be encouraging but honest about overspending
- Use ₹ for currency
- Keep responses concise and actionable`,
      },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];
    const response = await new Groq({ apiKey: process.env.GROQ_API_KEY }).chat.completions.create({ model: "llama-3.3-70b-versatile", messages, temperature: 0.7 });
    res.json({ reply: response.choices[0].message.content.trim() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Anomaly Detection
export const anomalies = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    const goals = await Goal.find({ user: req.user.id, completed: false });

    if (expenses.length < 5) return res.json({ anomalies: `Not enough data — you have ${expenses.length} expense${expenses.length === 1 ? "" : "s"}, but at least 5 are needed to detect anomalies.` });
    const byCategory = expenses.reduce((acc, e) => { if (!acc[e.category]) acc[e.category] = []; acc[e.category].push(e.amount); return acc; }, {});
    const avgByCategory = Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, Math.round(v.reduce((a, b) => a + b, 0) / v.length)]));
    const recent = expenses.slice(0, 20).map((e) => ({ title: e.title, amount: e.amount, category: e.category, date: new Date(e.date).toLocaleDateString("en-IN") }));
    const goalsSummary = goals.map((g) => ({ title: g.title, target: g.targetAmount, saved: g.savedAmount }));

    const result = await chat(
      "You are a financial anomaly detector. Compare recent expenses against category averages and identify unusual spending. Also check if spending patterns are affecting the user's ability to reach their saving goals. Be specific. Format as bullet points starting with • If no anomalies found, say so clearly.",
      `Category averages: ${JSON.stringify(avgByCategory)}, Recent expenses: ${JSON.stringify(recent)}, Saving goals: ${JSON.stringify(goalsSummary)}`
    );
    res.json({ anomalies: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Predict Future Expenses
export const predict = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const expenses = await Expense.find({ user: req.user.id });
    if (expenses.length < 3) return res.json({ prediction: "Not enough data to predict. Add more expenses first!", avgTotal: 0 });
    const monthlyData = {};
    expenses.forEach((e) => {
      const key = `${new Date(e.date).getFullYear()}-${new Date(e.date).getMonth()}`;
      if (!monthlyData[key]) monthlyData[key] = { total: 0, byCategory: {} };
      monthlyData[key].total += e.amount;
      monthlyData[key].byCategory[e.category] = (monthlyData[key].byCategory[e.category] || 0) + e.amount;
    });
    const months = Object.values(monthlyData);
    const avgTotal = Math.round(months.reduce((s, m) => s + m.total, 0) / months.length);
    const result = await chat(
      "You are a financial prediction expert. Based on past spending data, predict next month's expenses. Be specific with numbers. Use ₹. Format: start with total prediction, then bullet points per category starting with •",
      `Monthly income: ₹${user.monthlyIncome}, Past monthly data: ${JSON.stringify(monthlyData)}, Average monthly spend: ₹${avgTotal}`
    );
    res.json({ prediction: result, avgTotal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Bill Scanner
export const scanBill = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ message: "Image is required" });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt/bill image and extract the expense details. Return ONLY a JSON object with these fields: { "title": "store or item name", "amount": number, "category": one of [Food, Transport, Shopping, Bills, Health, Education, Entertainment, Other], "note": "brief description" }. No extra text, just the JSON.`,
            },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      temperature: 0.1,
    });
    const text = response.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(400).json({ message: "Could not extract data from image" });
    const data = JSON.parse(jsonMatch[0]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
