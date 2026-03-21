const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  name: "img",
  description: "Generate AI image",
  usage: "img <prompt>",
  category: "AI 🤖",

  async execute(senderId, args, pageAccessToken) {

    const prompt = args.join(" ");
    if (!prompt) return;

    try {

      // 🧠 STEP 1: Generate AI URL
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;
      console.log("🖼️ Fetching:", imageUrl);

      // 🧠 STEP 2: Wait (IMPORTANT for AI readiness)
      await new Promise(resolve => setTimeout(resolve, 8000));

      // 🧠 STEP 3: Download image
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 20000
      });

      // 🧠 STEP 4: Validate image
      const contentType = response.headers["content-type"];
      console.log("📦 Content-Type:", contentType);

      if (!contentType || !contentType.startsWith("image")) {
        throw new Error("Invalid image response");
      }

      const imageBuffer = Buffer.from(response.data);

      // 🧠 STEP 5: Prepare upload form
      const form = new FormData();

      form.append("recipient", JSON.stringify({ id: senderId }));

      // ✅ REQUIRED by Facebook
      form.append("messaging_type", "RESPONSE");

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

      // 🔥 FINAL FIX: add Content-Length
      const headers = {
        ...form.getHeaders(),
        "Content-Length": form.getLengthSync()
      };

      // 🧠 STEP 6: Send to Facebook
      await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
        form,
        { headers, timeout: 20000 }
      );

      console.log("✅ IMAGE SENT SUCCESS");

    } catch (err) {

      console.error("❌ MAIN ERROR:", err.response?.data || err.message);

      // 🔥 FALLBACK (ALWAYS SEND IMAGE)
      try {

        console.log("⚠️ Using fallback image...");

        const fallback = await axios.get(
          `https://picsum.photos/512`,
          { responseType: "arraybuffer" }
        );

        const form = new FormData();

        form.append("recipient", JSON.stringify({ id: senderId }));
        form.append("messaging_type", "RESPONSE");

        form.append("message", JSON.stringify({
          attachment: {
            type: "image",
            payload: {}
          }
        }));

        form.append("filedata", Buffer.from(fallback.data), {
          filename: "fallback.jpg",
          contentType: "image/jpeg"
        });

        const headers = {
          ...form.getHeaders(),
          "Content-Length": form.getLengthSync()
        };

        await axios.post(
          `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
          form,
          { headers }
        );

        console.log("✅ FALLBACK IMAGE SENT");

      } catch (fallbackErr) {
        console.error("❌ FALLBACK ERROR:", fallbackErr.response?.data || fallbackErr.message);
      }
    }
  }
};
