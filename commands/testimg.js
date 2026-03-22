const axios = require("axios");

module.exports = {
  name: "testimg",
  description: "Test image send",

  async execute({ api, event }) {
    try {
      const stream = await axios({
        url: "https://picsum.photos/500",
        method: "GET",
        responseType: "stream"
      });

      return api.sendMessage({
        attachment: stream.data
      }, event.threadID);

    } catch (err) {
      console.log("TEST IMG ERROR:", err.message);
      return api.sendMessage("❌ test failed", event.threadID);
    }
  }
};
