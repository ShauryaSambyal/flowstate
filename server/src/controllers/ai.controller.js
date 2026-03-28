import axios from 'axios';

export const getAiSuggestions = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        const hfToken = process.env.HF_TOKEN;
        if (!hfToken) {
            return res.status(500).json({ success: false, message: "HF_TOKEN is not configured on the server" });
        }

        const model = "google/flan-t5-large";
        const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

        const response = await axios.post(
            apiUrl,
            {
                inputs: `[INST] As an AI peak performance coach, provide 3 to 5 short, actionable, and punchy suggestions for someone struggling with or wanting to improve on: "${prompt}". Respond ONLY with the suggestions, each on a new line, no introductory text, no numbers, just the suggestions. [/INST]`,
                parameters: {
                    max_new_tokens: 150,
                    temperature: 0.7,
                    return_full_text: false
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${hfToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const generatedText = response.data[0]?.generated_text || "";
        
        // Clean up the response and split into an array
        const suggestions = generatedText
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('[INST]') && !s.startsWith('[/INST]'));

        res.status(200).json({
            success: true,
            suggestions: suggestions.slice(0, 5) // Ensure we don't return too many
        });

    } catch (error) {
        console.error("Hugging Face API Error:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate AI suggestions",
            error: error.response?.data || error.message
        });
    }
};
