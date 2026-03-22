const axios = require("axios");

module.exports = {
  name: "img",
  description: "Generate AI image",
  usage: "img <prompt>",
  category: "AI 🤖",

  async execute({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ Please provide a prompt", event.threadID);
    }

    try {
      // ✅ STEP 1: Generate Pollinations URL
      const polliURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Date.now()}`;

      console.log("🧠 Generating:", polliURL);

      // ✅ STEP 2: WAIT (VERY IMPORTANT)
      await new Promise(res => setTimeout(res, 4000));

      // ✅ STEP 3: CHECK IMAGE VALID
      const check = await axios.get(polliURL, {
        responseType: "arraybuffer",
        timeout: 10000
      });

      // if small = broken
      if (!check.data || check.data.length < 1000) {
        throw new Error("Image too small / invalid");
      }

      // ✅ STEP 4: SEND TO FACEBOOK
      return api.sendMessage({
        attachment: await axios({
          url: polliURL,
          method: "GET",
          responseType: "stream"
        }).then(res => res.data)
      }, event.threadID);

    } catch (err) {
      console.log("❌ Pollinations failed, using fallback...");

      // ✅ FALLBACK (100% SAFE)
      const fallback = `https://picsum.photos/512?random=${Date.now()}`;

      return api.sendMessage({
        body: "⚠️ AI failed, showing random image instead",
        attachment: await axios({
          url: fallback,
          method: "GET",
          responseType: "stream"
        }).then(res => res.data)
      }, event.threadID);
    }
  }
};
