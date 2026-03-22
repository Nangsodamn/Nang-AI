const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "img",
  description: "Generate AI image",
  usage: "img <prompt>",
  category: "AI 🤖",

  async execute(senderId, args, pageAccessToken) {

    const prompt = args.join(" ");
    if (!prompt) return;

    try {

      // ✅ Generate image URL (NO DOWNLOAD)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("🖼️ IMAGE URL:", imageUrl);

      // ⏳ wait for AI to generate
      await new Promise(resolve => setTimeout(resolve, 5000));

      // ✅ SEND DIRECT URL (NO UPLOAD = NO ERROR)
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);

      console.log("✅ IMAGE SENT (URL MODE)");

    } catch (err) {

      console.error("❌ ERROR:", err.response?.data || err.message);

      // 🔥 fallback (ALWAYS WORKS)
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: "https://picsum.photos/512",
            is_reusable: true
          }
        }
      }, pageAccessToken);

      console.log("✅ FALLBACK SENT");
    }
  }
};
