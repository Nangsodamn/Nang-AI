const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "img",
  description: "Generate AI image",
  usage: "img <prompt>",
  category: "AI 🤖",

  async execute(senderId, args, pageAccessToken) {

    const prompt = args.join(" ");

    // ❌ no prompt
    if (!prompt) {
      return sendMessage(senderId, {
        text: "⚠️ Example:\nimg cute frog"
      }, pageAccessToken);
    }

    try {

      // ⏳ loading message
      await sendMessage(senderId, {
        text: "🎨 Generating image..."
      }, pageAccessToken);

      // ✅ generate image URL
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("🖼️ Image URL:", imageUrl);

      // ✅ send image directly (FIXED PART)
      await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
        {
          recipient: { id: senderId },
          message: {
            attachment: {
              type: "image",
              payload: {
                url: imageUrl,
                is_reusable: true
              }
            }
          }
        }
      );

      console.log("✅ Image sent!");

    } catch (err) {

      console.error("❌ FULL ERROR:", err.response?.data || err.message);

      return sendMessage(senderId, {
        text: "❌ Failed to generate image.\n(Check logs bro)"
      }, pageAccessToken);
    }
  }
};
