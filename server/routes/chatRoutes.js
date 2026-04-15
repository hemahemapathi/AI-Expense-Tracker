import express from "express";
import { getSessions, createSession, getSession, deleteSession, sendMessage } from "../controllers/chatController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getSessions);
router.post("/", createSession);
router.get("/:id", getSession);
router.delete("/:id", deleteSession);
router.post("/:id/message", sendMessage);

export default router;
