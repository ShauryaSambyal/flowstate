import { User } from "../models/users.model.js";
import Groq from "groq-sdk";

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

        console.log(`Calling Groq API (llama-3.1-8b-instant) for chat from user: ${email}`);

        const completion = await groq.chat.completions.create({
            messages,
            model: "llama-3.1-8b-instant",
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
        console.error("Chat Handler Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during chat processing.",
            error: error.message
        });
    }
};
