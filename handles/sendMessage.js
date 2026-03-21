const axios = require("axios");

async function sendMessage(senderId, message, pageAccessToken) {
  try {
    const payload = {
      messaging_type: "RESPONSE", // ✅ IMPORTANT
      recipient: { id: senderId },
      message: message
    };

    const res = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
      payload
    );

    return res.data; // ✅ return so await works

  } catch (err) {
    console.log("❌ FB Error:", err.response?.data || err.message);
    throw err; // ✅ so errors are not silent
  }
}

module.exports = { sendMessage };
