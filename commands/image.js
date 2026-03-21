const axios = require("axios");
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
        text: "⚠️ Example:\nimg cute dog"
      }, pageAccessToken);
    }

    try {

      // ✅ Step 1: Loading message
      await sendMessage(senderId, {
        text: `🎨 Generating image for: "${prompt}"...`
      }, pageAccessToken);

      // ✅ Step 2: Create AI URL
      const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("🖼️ AI URL:", aiUrl);

      // ✅ Step 3: WAIT (very important)
      await new Promise(r => setTimeout(r, 7000));

      // ✅ Step 4: CHECK if image is reachable
      let isWorking = false;

      try {
        await axios.get(aiUrl, { timeout: 5000 });
        isWorking = true;
        console.log("✅ AI image is reachable");
      } catch {
        console.log("❌ AI image not ready");
      }

      // ✅ Step 5: SEND IMAGE
      const finalUrl = isWorking
        ? aiUrl
        : `https://picsum.photos/512?random=${Date.now()}`;

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: finalUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);

      console.log("✅ Image sent:", finalUrl);

    } catch (err) {

      console.error("❌ ERROR:", err.response?.data || err.message);

      // 🔥 ultimate fallback (never fail)
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: `https://picsum.photos/512?random=${Date.now()}`
          }
        }
      }, pageAccessToken);

    }
  }
};
