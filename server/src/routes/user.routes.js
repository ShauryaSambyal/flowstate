import { Router } from "express";
import { googleAuth, getUserChatHistory, handleUserChat } from "../controllers/auth.controller.js";

const router = Router();

router.post("/google-auth", googleAuth);
router.get("/chat-history", getUserChatHistory);
router.post("/chat", handleUserChat);

export default router;
