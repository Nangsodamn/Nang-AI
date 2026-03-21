const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  name: "img",

  async execute(senderId, args, pageAccessToken) {

    const prompt = args.join(" ");

    if (!prompt) {
      return;
    }

    try {

      // ✅ Step 1: generate AI image URL
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("🖼️ Fetching:", imageUrl);

      // ✅ Step 2: download image buffer
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      const imageBuffer = Buffer.from(response.data);

      // ✅ Step 3: send via upload (NOT URL)
      const form = new FormData();

      form.append("recipient", JSON.stringify({ id: senderId }));

      form.append("message", JSON.stringify({
        attachment: {
          type: "image",
          payload: {}
        }
      }));

      form.append("filedata", imageBuffer, {
        filename: "image.jpg",
        contentType: "image/jpeg"
      });

      await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 20000
        }
      );

      console.log("✅ Image sent via upload");

    } catch (err) {

      console.error("❌ ERROR:", err.response?.data || err.message);

      // 🔥 fallback (still upload)
      try {

        const fallback = await axios.get(
          `https://picsum.photos/512`,
          { responseType: "arraybuffer" }
        );

        const form = new FormData();

        form.append("recipient", JSON.stringify({ id: senderId }));
        form.append("message", JSON.stringify({
          attachment: { type: "image", payload: {} }
        }));
        form.append("filedata", Buffer.from(fallback.data), {
          filename: "fallback.jpg",
          contentType: "image/jpeg"
        });

        await axios.post(
          `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
          form,
          { headers: form.getHeaders() }
        );

        console.log("✅ Fallback sent");

      } catch (e) {
        console.log("❌ Even fallback failed");
      }
    }
  }
};
