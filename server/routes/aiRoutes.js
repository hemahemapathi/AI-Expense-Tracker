import express from "express";
import { categorize, insights, budgetSuggestions, chatWithExpenses, anomalies, predict, scanBill } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/categorize", categorize);
router.get("/insights", insights);
router.get("/budget-suggestions", budgetSuggestions);
router.post("/chat", chatWithExpenses);
router.get("/anomalies", anomalies);
router.get("/predict", predict);
router.post("/scan-bill", scanBill);

export default router;
