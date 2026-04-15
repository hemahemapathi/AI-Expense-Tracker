import express from "express";
import { getGoals, createGoal, updateGoal, deleteGoal, addSavings } from "../controllers/goalController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);
router.post("/:id/save", addSavings);

export default router;
