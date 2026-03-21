const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  name: "img",

  async execute(senderId, args, pageAccessToken) {

    const prompt = args.join(" ");
    if (!prompt) return;

    try {

      // 🧠 Step 1: create AI URL
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;
      console.log("🖼️ URL:", imageUrl);

      // 🧠 Step 2: WAIT (VERY IMPORTANT)
      await new Promise(r => setTimeout(r, 8000));

      // 🧠 Step 3: download image
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      // 🧠 Step 4: validate image
      const contentType = response.headers["content-type"];
      console.log("📦 Content-Type:", contentType);

      if (!contentType || !contentType.startsWith("image")) {
        throw new Error("Not an image!");
      }

      const buffer = Buffer.from(response.data);

      // 🧠 Step 5: upload to Facebook
      const form = new FormData();

      form.append("recipient", JSON.stringify({ id: senderId }));

      // ✅ VERY IMPORTANT
      form.append("messaging_type", "RESPONSE");

      form.append("message", JSON.stringify({
        attachment: {
          type: "image",
          payload: {}
        }
      }));

      form.append("filedata", buffer, {
        filename: "image.jpg",
        contentType: "image/jpeg"
      });

      await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
        form,
        {
          headers: form.getHeaders()
        }
      );

      console.log("✅ IMAGE SENT");

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message);
    }
  }
};
