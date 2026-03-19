const axios = require("axios");

async function sendMessage(senderId, message, pageAccessToken) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
      {
        recipient: { id: senderId },
        message: message
      }
    );
  } catch (err) {
    console.log("Error:", err.response?.data || err.message);
  }
}

module.exports = { sendMessage };
