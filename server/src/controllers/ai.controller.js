import Groq from "groq-sdk";
import { GROQ_MODEL } from "../config/ai.config.js";

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
        const providerCode = error?.code || error?.error?.code || error?.error?.error?.code;
        const providerStatus = error?.status;

        if (providerCode === "model_not_found") {
            console.error("Groq model error:", error?.error?.error?.message || error?.error?.message || error.message);
            return res.status(500).json({
                success: false,
                error: "AI model unavailable. Check GROQ_MODEL / your Groq model list."
            });
        }

        if (providerStatus === 401 || providerStatus === 403) {
            console.error("Groq auth error:", error?.error?.error?.message || error?.error?.message || error.message);
            return res.status(500).json({
                success: false,
                error: "AI provider authentication failed. Check GROQ_API_KEY."
            });
        }

        console.error("Groq Error:", error.message);
        return res.status(500).json({
            success: false,
            error: "AI request failed."
        });
    }
};