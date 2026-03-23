const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
console.log("GROQ KEY CHECK:", process.env.GROQ_API_KEY);

async function askAI(prompt) {
  try {
    if (!GROQ_API_KEY) {
      console.log("❌ GROQ KEY MISSING");
      return "⚠️ AI not configured.";
    }

    console.log("GROQ KEY:", GROQ_API_KEY);

    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "mixtral-8x7b-32768"
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

    return res.data.choices[0].message.content;

  } catch (err) {
    console.error("❌ GROQ ERROR:", err.response?.data || err.message);
    return "🤖 Nang AI have temporary problem.";
  }
}

module.exports = askAI;
