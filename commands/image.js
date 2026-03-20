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
        text: "⚠️ Example:\nimg cute cat astronaut"
      }, pageAccessToken);
    }

    try {

      // ✅ send loading message
      await sendMessage(senderId, {
        text: "🎨 Generating image..."
      }, pageAccessToken);

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

      // ✅ send image
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (err) {
      console.error("❌ Image Error:", err.message);

      return sendMessage(senderId, {
        text: "❌ Failed to generate image."
      }, pageAccessToken);
    }
  }
};
