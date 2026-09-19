import { User } from "../models/users.model.js";
import Groq from "groq-sdk";
import { GROQ_MODEL } from "../config/ai.config.js";

export const googleAuth = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            user = new User({
                username: username || email.split("@")[0],
                email
            });
            await user.save();
            isNewUser = true;
        }

        res.status(200).json({
            success: true,
            message: isNewUser ? "User registered successfully!" : "User logged in successfully!",
            user
        });
    } catch (error) {
        console.error("Google Auth Backend Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during authentication sync.",
            error: error.message
        });
    }
};

export const getUserChatHistory = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            chatHistory: user.chatHistory || []
        });
    } catch (error) {
        console.error("Get Chat History Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching chat history.",
            error: error.message
        });
    }
};

export const handleUserChat = async (req, res) => {
    try {
        const { email, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({ success: false, message: "Email and message are required" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Add user message to history
        const userMsg = {
            role: "user",
            content: message,
            timestamp: new Date()
        };
        user.chatHistory.push(userMsg);

        // Initialize Groq SDK
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        // Format history for Groq API context
        const formattedHistory = user.chatHistory.map(msg => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content
        }));

        const messages = [
            {
                role: "system",
                content: `You are FLOWSTATE AI, an expert Peak Performance Coach and Career Mentor. 
                Your goal is to help the user stay in flow, achieve their goals, build productive habits, and make smart career decisions.
                Keep your answers highly actionable, motivating, and clear. Use markdown formatting where appropriate.`
            },
            ...formattedHistory
        ];

        console.log(`Calling Groq API (${GROQ_MODEL}) for chat from user: ${email}`);

        const completion = await groq.chat.completions.create({
            messages,
            model: GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 800,
        });

        const aiReply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        // Add assistant message to history
        const assistantMsg = {
            role: "assistant",
            content: aiReply,
            timestamp: new Date()
        };
        user.chatHistory.push(assistantMsg);

        await user.save();

        res.status(200).json({
            success: true,
            reply: aiReply,
            chatHistory: user.chatHistory
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

        console.error("Chat Handler Error:", error);
        return res.status(500).json({
            success: false,
            error: "AI request failed."
        });
    }
};
