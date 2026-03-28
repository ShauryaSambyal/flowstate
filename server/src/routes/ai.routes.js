import { Router } from "express";
import { getAiSuggestions } from "../controllers/ai.controller.js";

const router = Router();

router.post("/suggestions", getAiSuggestions);

export default router;
