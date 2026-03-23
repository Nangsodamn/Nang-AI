const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "img",

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ");

    if (!prompt) {
      return sendMessage(senderId, {
        text: "⚠️ Enter a prompt."
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: "🎨 Generating image..."
    }, pageAccessToken);

    try {
      console.log("REPLICATE KEY:", process.env.REPLICATE_API_KEY);

      const create = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "db21e45f7c1e3c1f1b0c8d45d7b2f2c5c6a2f1f1c7b6e7e6e1f2a3b4c5d6e7f",
          input: { prompt }
        },
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const statusUrl = create.data.urls.get;

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
          throw new Error("Image failed");
        }

        await new Promise(r => setTimeout(r, 2000));
      }

      const img = await axios.get(imageUrl, {
        responseType: "stream"
      });

      await sendMessage(senderId, {
        body: `🖼️ ${prompt}`,
        attachment: img.data
      }, pageAccessToken);

    } catch (err) {
      console.error("❌ REPLICATE ERROR:", err.response?.data || err.message);

      await sendMessage(senderId, {
        text: "❌ Failed to generate image."
      }, pageAccessToken);
    }
  }
};
