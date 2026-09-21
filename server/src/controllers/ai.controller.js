import Groq from "groq-sdk";
import { GROQ_MODEL } from "../config/ai.config.js";

/* One place where a Groq failure becomes a JSON response. */
function respondToProviderError(res, error, label = "Groq") {
    const providerCode = error?.code || error?.error?.code || error?.error?.error?.code;
    const providerStatus = error?.status;
    const providerMessage = error?.error?.error?.message || error?.error?.message || error.message;

    if (providerCode === "model_not_found") {
        console.error(`${label} model error:`, providerMessage);
        return res.status(500).json({
            success: false,
            error: "AI model unavailable. Check GROQ_MODEL / your Groq model list.",
        });
    }

    if (providerStatus === 401 || providerStatus === 403) {
        console.error(`${label} auth error:`, providerMessage);
        return res.status(500).json({
            success: false,
            error: "AI provider authentication failed. Check GROQ_API_KEY.",
        });
    }

    console.error(`${label} Error:`, providerMessage);
    return res.status(500).json({
        success: false,
        error: "AI request failed.",
    });
}

export const getAiSuggestions = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        // Initialize inside the handler to ensure process.env.GROQ_API_KEY is available
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        console.log(`Calling Groq API (${GROQ_MODEL}) for Roadmap: ${prompt}`);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert AI Peak Performance and Career Coach. 
                    Your task is to provide a high-quality, actionable "Roadmap" and a "Future Impact" assessment for the given skill or goal.
                    
                    Respond ONLY in JSON format with the following structure:
                    {
                      "roadmap": [
                        { "phase": "Phase 1: Getting Started", "details": "Short actionable description of what to do first." },
                        { "phase": "Phase 2: Building Core Skills", "details": "Middle steps to gain proficiency." },
                        { "phase": "Phase 3: Mastering/Advancing", "details": "Advanced steps or project ideas." }
                      ],
                      "impact": {
                        "oneMonth": "The specific results after 1 month of consistent effort.",
                        "threeMonths": "The specific results after 3 months of consistent effort.",
                        "sixMonths": "The specific results after 6 months of consistent effort."
                      }
                    }`
                },
                {
                    role: "user",
                    content: `Create a roadmap and future impact for: "${prompt}"`
                }
            ],
            model: GROQ_MODEL,
            temperature: 0.6,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        const guidanceData = JSON.parse(content);

        console.log("Groq Response received successfully.");

        res.status(200).json({
            success: true,
            data: guidanceData
        });

    } catch (error) {
        return respondToProviderError(res, error);
    }
};

/* ------------------------------------------------------------
   Workflow Gallery — AI intent analysis and plan generation.
   Both endpoints are optional by design: the client falls back to its
   built-in plan engine when these fail or when no key is configured, so
   a failure here is never a broken workflow in the UI.
   ------------------------------------------------------------ */

const WORKFLOW_GUIDANCE = {
    "PERSONAL LIFE":
        "Focus on routines, habits, priorities and consistency. Keep every action small enough to survive a bad day.",
    PRODUCTIVITY:
        "Focus on turning a vague or overwhelming obligation into scoped parts, an order, a schedule and today's concrete actions. Show messy intent becoming structured action.",
    "HEALTH & FITNESS":
        "General wellness, routines and healthy habits only. Never diagnose, never make medical claims, never encourage unsafe dieting, extreme exercise or unhealthy body goals. Recommend that medical questions go to a professional.",
    "CAREER / GROWTH":
        "Focus on a skill audit, the gap to the goal, a sequenced learning roadmap, proof-of-work projects, publishing them, and interview or review preparation.",
    "FINANCIAL FREEDOM":
        "Educational planning only. Never recommend specific stocks, crypto, funds or financial products, and never promise returns. Keep it to visibility of spending, one goal, a monthly amount and a review habit.",
    "AI TUTOR / STUDY":
        "Focus on a learning roadmap: fundamentals, tools, deliberate practice, a small project, deepening, and explaining the subject back. Keep it sized to the stated time budget.",
};

const ANALYSIS_SYSTEM_PROMPT = `You are FLOWSTATE's intent analyst. You read one sentence of user intention and return a short, precise interpretation of it.

Respond ONLY with JSON in this exact shape:
{
  "intent": "The user's intention restated as one clear sentence, no more than 12 words.",
  "summary": "One sentence describing how you read the intention, no more than 20 words.",
  "focusAreas": ["3 to 5 short focus areas", "2-4 words each"]
}

Rules: keep the user's own vocabulary, never invent goals they did not imply, and never add advice.`;

const PLAN_SYSTEM_PROMPT = `You are FLOWSTATE's workflow architect. You turn one intention into a structured workflow that follows the FlowState framework: understand, break down, plan, act, track.

Respond ONLY with JSON in this exact shape:
{
  "steps": [
    {
      "phase": "understand | breakdown | plan | act | track",
      "title": "Short imperative title, max 8 words",
      "summary": "One sentence explaining what this phase does for this intention.",
      "tasks": ["2 to 4 concrete actions the user can complete and tick off"],
      "details": ["1 to 2 short notes, caveats or heuristics"],
      "resources": [{ "label": "Short label", "note": "Optional short note" }]
    }
  ],
  "focusAreas": ["3 to 5 short focus areas", "2-4 words each"]
}

Rules:
- Return 5 to 8 steps, ordered, covering every phase at least once.
- Titles are concrete ("Map your current routine"), never generic ("Getting started").
- Tasks are imperative, specific and small enough to finish in one sitting.
- No markdown, no emoji, no numbering inside titles, no preamble, no explanation outside the JSON.`;

export const analyzeWorkflowIntent = async (req, res) => {
    try {
        const { intent, category, workflowId, answers } = req.body;

        if (!intent || !String(intent).trim()) {
            return res.status(400).json({ success: false, message: "Intent is required" });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        console.log(`Calling Groq API (${GROQ_MODEL}) for workflow intent: ${intent}`);

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: [
                        `Category: ${category || workflowId || "General"}`,
                        `Category guidance: ${WORKFLOW_GUIDANCE[category] || "Keep the plan practical and specific."}`,
                        `User intention: "${intent}"`,
                        `Optional inputs: ${JSON.stringify(answers || {})}`,
                        "Interpret this intention.",
                    ].join("\n"),
                },
            ],
            model: GROQ_MODEL,
            temperature: 0.4,
            max_tokens: 400,
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(completion.choices[0]?.message?.content || "{}");

        res.status(200).json({
            success: true,
            data: {
                intent: typeof data.intent === "string" ? data.intent : String(intent),
                summary: typeof data.summary === "string" ? data.summary : "",
                focusAreas: Array.isArray(data.focusAreas) ? data.focusAreas.slice(0, 6) : [],
            },
        });
    } catch (error) {
        return respondToProviderError(res, error);
    }
};

export const generateWorkflowPlan = async (req, res) => {
    try {
        const { intent, subject, category, workflowId, answers, focusAreas } = req.body;

        if (!intent || !String(intent).trim()) {
            return res.status(400).json({ success: false, message: "Intent is required" });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        console.log(`Calling Groq API (${GROQ_MODEL}) for workflow plan: ${intent}`);

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: PLAN_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: [
                        `Category: ${category || workflowId || "General"}`,
                        `Category guidance: ${WORKFLOW_GUIDANCE[category] || "Keep the plan practical and specific."}`,
                        `User intention: "${intent}"`,
                        subject ? `Subject: ${subject}` : null,
                        Array.isArray(focusAreas) && focusAreas.length
                            ? `Focus areas to cover: ${focusAreas.join(", ")}`
                            : null,
                        `Optional inputs: ${JSON.stringify(answers || {})}`,
                        "Build the workflow.",
                    ]
                        .filter(Boolean)
                        .join("\n"),
                },
            ],
            model: GROQ_MODEL,
            temperature: 0.5,
            max_tokens: 1800,
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(completion.choices[0]?.message?.content || "{}");

        if (!Array.isArray(data.steps) || data.steps.length === 0) {
            return res.status(500).json({
                success: false,
                error: "AI returned no workflow steps.",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                steps: data.steps.slice(0, 10),
                focusAreas: Array.isArray(data.focusAreas) ? data.focusAreas.slice(0, 6) : [],
            },
        });
    } catch (error) {
        return respondToProviderError(res, error);
    }
};