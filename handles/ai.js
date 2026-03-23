const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function askAI(prompt) {
  try {
    if (!GROQ_API_KEY) {
      console.log("❌ GROQ KEY MISSING");
      return "⚠️ AI not configured.";
    }

    console.log("📨 Prompt:", prompt);

    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = res.data?.choices?.[0]?.message?.content;

    return reply || "⚠️ Empty response from AI.";

  } catch (err) {
    console.error("❌ FULL ERROR:", err.response?.data || err.message);
    return "🤖 Nang AI have temporary problem.";
  }
}

module.exports = askAI;
