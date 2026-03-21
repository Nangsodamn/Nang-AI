const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "img",
  description: "Generate AI image",
  usage: "img <prompt>",
  category: "AI 🤖",

  async execute(senderId, args, pageAccessToken) {

    let prompt = args.join(" ");

    if (!prompt) {
      return sendMessage(senderId, {
        text: "⚠️ Example:\nimg cute frog"
      }, pageAccessToken);
    }

    try {

      await sendMessage(senderId, {
        text: `🎨 Generating image for: "${prompt}"...`
      }, pageAccessToken);

      // ✅ main image source
      let imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("🖼️ Trying URL:", imageUrl);

      // ✅ wait (IMPORTANT for pollinations)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // ✅ check if image is reachable
      try {
        const check = await axios.get(imageUrl, { timeout: 10000 });
        console.log("✅ Image status:", check.status);
      } catch (e) {
        console.log("⚠️ Pollinations failed, using fallback...");
        
        // 🔥 fallback image (ALWAYS WORKS)
        imageUrl = `https://picsum.photos/512?random=${Date.now()}`;
      }

      // ✅ send image
      await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
        {
          messaging_type: "RESPONSE",
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

      console.log("✅ Image sent successfully!");

    } catch (err) {

      console.error("❌ FULL ERROR:", err.response?.data || err.message);

      return sendMessage(senderId, {
        text: "❌ Failed to generate image.\nTry again later bro."
      }, pageAccessToken);
    }
  }
};
