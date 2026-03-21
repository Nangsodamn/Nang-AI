const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "img",
  description: "Generate AI image",
  usage: "img <prompt>",
  category: "AI 🤖",

  async execute(senderId, args, pageAccessToken) {

    const prompt = args.join(" ");

    if (!prompt) {
      return sendMessage(senderId, {
        text: "⚠️ Example:\nimg cute frog"
      }, pageAccessToken);
    }

    try {

      // ✅ loading message
      await sendMessage(senderId, {
        text: `🎨 Generating image for: "${prompt}"...`
      }, pageAccessToken);

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("🖼️ URL:", imageUrl);

      // ✅ delay (VERY IMPORTANT)
      await new Promise(resolve => setTimeout(resolve, 4000));

      // ✅ send image using SAME function
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);

      console.log("✅ Image sent");

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message);

      return sendMessage(senderId, {
        text: "❌ Failed to generate image"
      }, pageAccessToken);
    }
  }
};
