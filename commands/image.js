const axios = require("axios");

module.exports = {
  name: "img",
  description: "Generate AI image (Replicate)",
  usage: "img <prompt>",
  category: "AI",

  async execute({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("⚠️ Enter a prompt.", event.threadID);
    }

    api.sendMessage("🎨 Generating image...", event.threadID);

    try {
      // 🔥 STEP 1: Create prediction
      const create = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "db21e45f7c1e3c1f1b0c8d45d7b2f2c5c6a2f1f1c7b6e7e6e1f2a3b4c5d6e7f", // SDXL model
          input: {
            prompt: prompt
          }
        },
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const statusUrl = create.data.urls.get;

      // 🔁 STEP 2: Wait until finished
      let imageUrl;
      while (true) {
        const check = await axios.get(statusUrl, {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`
          }
        });

        if (check.data.status === "succeeded") {
          imageUrl = check.data.output[0];
          break;
        }

        if (check.data.status === "failed") {
          throw new Error("Image generation failed");
        }

        await new Promise(r => setTimeout(r, 2000));
      }

      // 📥 STEP 3: Convert to stream (VERY IMPORTANT)
      const img = await axios.get(imageUrl, {
        responseType: "stream"
      });

      // 📤 STEP 4: Send to Facebook
      api.sendMessage({
        body: `🖼️ ${prompt}`,
        attachment: img.data
      }, event.threadID);

    } catch (err) {
      console.error("REPLICATE ERROR:", err.message);

      api.sendMessage(
        "❌ Failed to generate image. Try again.",
        event.threadID
      );
    }
  }
};
