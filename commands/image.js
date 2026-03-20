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

    // ❌ no prompt
    if (!prompt) {
      return sendMessage(senderId, {
        text: "⚠️ Example:\nimg cute cat astronaut"
      }, pageAccessToken);
    }

    try {

      // ✅ loading message
      await sendMessage(senderId, {
        text: "🎨 Generating image..."
      }, pageAccessToken);

      // ✅ create image URL
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

      // ✅ download image as buffer (IMPORTANT FIX)
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });

      // ✅ create form data
      const form = new FormData();

      form.append("recipient", JSON.stringify({ id: senderId }));

      form.append("message", JSON.stringify({
        attachment: {
          type: "image",
          payload: {}
        }
      }));

      // ✅ attach image file
      form.append("filedata", Buffer.from(response.data), {
        filename: "image.jpg"
      });

      // ✅ send to Facebook
      await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
        form,
        {
          headers: form.getHeaders()
        }
      );

    } catch (err) {

      console.error("❌ Image Error:", err.response?.data || err.message);

      return sendMessage(senderId, {
        text: "❌ Failed to generate image."
      }, pageAccessToken);
    }
  }
};
