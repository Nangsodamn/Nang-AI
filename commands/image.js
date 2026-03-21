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

      // ✅ Step 2: Pollinations URL
      let imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;

      console.log("🖼️ Trying AI URL:", imageUrl);

      // ✅ Step 3: Wait (VERY IMPORTANT)
      await new Promise(resolve => setTimeout(resolve, 6000));

      // ✅ Step 4: Try sending AI image
      try {

        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: imageUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);

        console.log("✅ AI image sent");

      } catch (err) {

        console.log("⚠️ AI failed, using fallback");

        // ✅ Step 5: Fallback (ALWAYS WORKS)
        const fallbackUrl = `https://picsum.photos/512?random=${Date.now()}`;

        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: fallbackUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);

        console.log("✅ Fallback image sent");
      }

    } catch (err) {

      console.error("❌ FINAL ERROR:", err.response?.data || err.message);

      return sendMessage(senderId, {
        text: "❌ Failed to generate image, try again bro"
      }, pageAccessToken);
    }
  }
};
