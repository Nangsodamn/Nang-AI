const axios = require("axios");
const FormData = require("form-data");
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

      await sendMessage(senderId, {
        text: "🎨 Generating image..."
      }, pageAccessToken);

      // ✅ NEW (more stable API)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("🖼️ Image URL:", imageUrl);

      // ✅ download image (buffer)
      const response = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "arraybuffer",
        timeout: 20000 // prevent hanging
      });

      // ❌ if no data
      if (!response.data) throw new Error("No image data");

      const form = new FormData();

      form.append("recipient", JSON.stringify({ id: senderId }));

      form.append("message", JSON.stringify({
        attachment: {
          type: "image",
          payload: {}
        }
      }));

      form.append("filedata", Buffer.from(response.data), {
        filename: "image.jpg",
        contentType: "image/jpeg"
      });

      // ✅ send to Facebook
      await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 20000
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
