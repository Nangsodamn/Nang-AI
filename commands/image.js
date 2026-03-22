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

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512`;

      console.log("✅ USING URL METHOD:", imageUrl);

      await new Promise(r => setTimeout(r, 5000));

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl
          }
        }
      }, pageAccessToken);

    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }
  }
};
