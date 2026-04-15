import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "https://aiexpensetrackerhemapathi.netlify.app"],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => res.json({ message: "AI Expense Tracker API is running ✅" }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
