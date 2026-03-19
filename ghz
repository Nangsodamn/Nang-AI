const { sendMessage } = require("../handles/sendMessage");
const WebSocket = require("ws");

const activeSessions = new Map();
const lastSentCache = new Map();
const favoriteMap = new Map();

let sharedWebSocket = null;
let keepAliveInterval = null;

function formatValue(val) {
  if (val >= 1_000_000) return `x${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `x${(val / 1_000).toFixed(1)}K`;
  return `x${val}`;
}

function getPHTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
}

function cleanText(text) {
  return text.trim().toLowerCase();
}

function formatItems(items) {
  return items
    .filter(i => i.quantity > 0)
    .map(i => `- ${i.emoji ? i.emoji + " " : ""}${i.name}: ${formatValue(i.quantity)}`)
    .join("\n");
}

function ensureWebSocketConnection() {

  if (sharedWebSocket && sharedWebSocket.readyState === WebSocket.OPEN) return;

  sharedWebSocket = new WebSocket("wss://gagstock.gleeze.com/ghz");

  sharedWebSocket.on("open", () => {

    keepAliveInterval = setInterval(() => {

      if (sharedWebSocket.readyState === WebSocket.OPEN) {
        sharedWebSocket.send("ping");
      }

    }, 10000);

  });

  sharedWebSocket.on("message", async (data) => {

    try {

      const payload = JSON.parse(data);

      if (!payload) return;

      const seeds = Array.isArray(payload.seeds) ? payload.seeds : [];
      const gear = Array.isArray(payload.gear) ? payload.gear : [];
      const weather = payload.weather || null;

      for (const [senderId, session] of activeSessions.entries()) {

        const favList = favoriteMap.get(senderId) || [];

        let sections = [];
        let matchCount = 0;

        function checkItems(label, items) {

          const available = items.filter(i => i.quantity > 0);

          if (available.length === 0) return false;

          const matched = favList.length > 0
            ? available.filter(i => favList.includes(cleanText(i.name)))
            : available;

          if (favList.length > 0 && matched.length === 0) return false;

          matchCount += matched.length;

          sections.push(`${label}:\n${formatItems(matched)}`);

          return true;

        }

        checkItems("🌱 𝗦𝗲𝗲𝗱𝘀", seeds);
        checkItems("🛠️ 𝗚𝗲𝗮𝗿", gear);

        if (favList.length > 0 && matchCount === 0) continue;
        if (sections.length === 0) continue;

        const weatherInfo = weather
          ? `🌤️ 𝗪𝗲𝗮𝘁𝗵𝗲𝗿: ${weather.status}
📋 ${weather.description}
🕒 Start: ${weather.startTime}
🕒 End: ${weather.endTime}`
          : "";

        const updatedAt = payload.lastUpdated || getPHTime().toLocaleString("en-PH");

        const title = favList.length > 0
          ? `❤️ ${matchCount} 𝗙𝗮𝘃𝗼𝗿𝗶𝘁𝗲 𝗜𝘁𝗲𝗺${matchCount > 1 ? "s" : ""} 𝗙𝗼𝘂𝗻𝗱!`
          : "🌾 𝗚𝗮𝗿𝗱𝗲𝗻 𝗛𝗼𝗿𝗶𝘇𝗼𝗻 — 𝗦𝘁𝗼𝗰𝗸";

        const messageKey = JSON.stringify({ title, sections, weatherInfo, updatedAt });

        const lastSent = lastSentCache.get(senderId);

        if (lastSent === messageKey) continue;

        lastSentCache.set(senderId, messageKey);

        await sendMessage(senderId, {
          text: `${title}

${sections.join("\n\n")}

${weatherInfo}

📅 Updated: ${updatedAt}`
        }, session.pageAccessToken);

      }

    } catch {}

  });

  sharedWebSocket.on("close", () => {

    clearInterval(keepAliveInterval);
    sharedWebSocket = null;

    setTimeout(ensureWebSocketConnection, 3000);

  });

  sharedWebSocket.on("error", () => {
    sharedWebSocket?.close();
  });

}

module.exports = {
  name: "ghz",
  description: "Garden Horizon live stock tracker using WebSocket.",
  usage: "ghz on | ghz off | ghz fav add Item1 | Item2",
  category: "Tools ⚒️",

  async execute(senderId, args, pageAccessToken) {

    const subcmd = args[0]?.toLowerCase();

    if (subcmd === "fav") {

      const action = args[1]?.toLowerCase();

      const input = args.slice(2)
        .join(" ")
        .split("|")
        .map(i => cleanText(i))
        .filter(Boolean);

      if (!action || !["add","remove"].includes(action) || input.length === 0) {
        return sendMessage(senderId,
          { text: "📌 Usage: ghz fav add/remove Item1 | Item2" },
          pageAccessToken
        );
      }

      const currentFav = favoriteMap.get(senderId) || [];

      const updated = new Set(currentFav);

      for (const name of input) {

        if (action === "add") updated.add(name);
        else updated.delete(name);

      }

      favoriteMap.set(senderId, Array.from(updated));

      return sendMessage(senderId, {
        text: `✅ Favorite list updated:\n${Array.from(updated).join(", ") || "(empty)"}`
      }, pageAccessToken);

    }

    if (subcmd === "off") {

      if (!activeSessions.has(senderId)) {
        return sendMessage(senderId,
          { text: "⚠️ You don't have an active ghz session." },
          pageAccessToken
        );
      }

      activeSessions.delete(senderId);
      lastSentCache.delete(senderId);

      return sendMessage(senderId,
        { text: "🛑 Garden Horizon tracking stopped." },
        pageAccessToken
      );

    }

    if (subcmd !== "on") {

      return sendMessage(senderId, {
        text:
`📌 Garden Horizon Commands

• ghz on
• ghz off
• ghz fav add Carrot | Watering Can
• ghz fav remove Carrot`
      }, pageAccessToken);

    }

    if (activeSessions.has(senderId)) {

      return sendMessage(senderId,
        { text: "📡 You're already tracking Garden Horizon.\nUse ghz off to stop." },
        pageAccessToken
      );

    }

    activeSessions.set(senderId, { pageAccessToken });

    await sendMessage(senderId, {
      text: "✅ Garden Horizon tracking started!"
    }, pageAccessToken);

    ensureWebSocketConnection();

  }
