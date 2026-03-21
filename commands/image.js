const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "img",

  async execute(senderId, args, pageAccessToken) {

    try {

      // ✅ send test image (NO AI, just check Facebook)
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: "https://picsum.photos/500"
          }
        }
      }, pageAccessToken);

      console.log("✅ Test image sent");

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message);
    }
  }
};
