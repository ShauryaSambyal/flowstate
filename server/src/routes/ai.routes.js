import { Router } from "express";
import {
    analyzeWorkflowIntent,
    generateWorkflowPlan,
    getAiSuggestions,
} from "../controllers/ai.controller.js";

const router = Router();

router.post("/suggestions", getAiSuggestions);
router.post("/workflow/intent", analyzeWorkflowIntent);
router.post("/workflow/plan", generateWorkflowPlan);

export default router;
