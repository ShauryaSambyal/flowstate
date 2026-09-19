import { Router } from "express";
import { googleAuth, getUserChatHistory, handleUserChat } from "../controllers/auth.controller.js";
import { getStars, claimStars } from "../controllers/stars.controller.js";

const router = Router();

router.post("/google-auth", googleAuth);
router.get("/chat-history", getUserChatHistory);
router.post("/chat", handleUserChat);
router.get("/stars", getStars);
router.post("/stars/claim", claimStars);

export default router;