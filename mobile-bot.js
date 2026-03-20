const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ✅ VERIFY TOKEN (must match Facebook webhook)
const VERIFY_TOKEN = "aibot123";

// ✅ COMMANDS
const imageCmd = require("./commands/image");
const ghzCmd = require("./commands/ghz");

// ============================
// 🔹 WEBHOOK VERIFY
// ============================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// ============================
// 🔹 RECEIVE MESSAGES
// ============================
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.object === "page") {

      for (const entry of body.entry) {
        for (const event of entry.messaging) {

          const senderId = event.sender.id;
          const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;

          if (event.message && event.message.text) {

            const text = event.message.text.trim();

            console.log("📩 Received:", text);

            // ============================
            // 🔹 COMMAND HANDLER
            // ============================

            // 👉 IMG COMMAND
            if (text.startsWith("img")) {
              const args = text.split(" ").slice(1);
              return imageCmd.execute(senderId, args, pageAccessToken);
            }

            // 👉 GHZ COMMAND
            if (text.startsWith("ghz")) {
              const args = text.split(" ").slice(1);
              return ghzCmd.execute(senderId, args, pageAccessToken);
            }

            // ============================
            // 🔹 DEFAULT REPLY
            // ============================
            const { sendMessage } = require("./handles/sendMessage");

            return sendMessage(senderId, {
              text: "🤖 I didn't understand that.\nTry:\n• img frog\n• ghz on"
            }, pageAccessToken);
          }
        }
      }

      res.sendStatus(200);
    }

  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.sendStatus(500);
  }
});

// ============================
// 🔹 START SERVER
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
