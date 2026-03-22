const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "img",
  description: "Generate AI image",
  usage: "img <prompt>",
  category: "AI 🤖",

  async execute({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ Enter prompt", event.threadID);
    }

    const filePath = path.join(__dirname, "temp.jpg");

    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("Generating:", url);

      // ✅ WAIT (IMPORTANT)
      await new Promise(res => setTimeout(res, 5000));

      // ✅ DOWNLOAD IMAGE
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
        timeout: 15000
      });

      // ✅ SAVE FILE
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // ✅ SEND FILE (THIS IS THE FIX)
      return api.sendMessage({
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath); // delete after send
      });

    } catch (err) {
      console.log("AI FAILED:", err.message);

      // ✅ FALLBACK (ALWAYS WORKS)
      const fallback = `https://picsum.photos/512?random=${Date.now()}`;

      return api.sendMessage({
        body: "⚠️ AI failed, fallback image",
        attachment: await axios({
          url: fallback,
          method: "GET",
          responseType: "stream"
        }).then(res => res.data)
      }, event.threadID);
    }
  }
};
