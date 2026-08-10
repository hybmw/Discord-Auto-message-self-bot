const cooldowns = require("../../json/cooldowns.json");

// Returns a random integer between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simulates a human typing then sending a message.
// sendTyping() lasts 10s on Discord — we refresh it while "typing".
async function humanSend(channel, trade) {
  // How long a human would take to "type" this message.
  // ~180 chars per minute average, minimum 2s, max 12s.
  const typingMs = Math.min(12000, Math.max(2000, Math.round((trade.length / 180) * 60000)));

  const started = Date.now();
  // Kick off typing indicator, refresh every 8s if message is long
  channel.sendTyping().catch(() => {});
  const refresher = setInterval(() => {
    if (Date.now() - started < typingMs) channel.sendTyping().catch(() => {});
  }, 8000);

  await new Promise((r) => setTimeout(r, typingMs));
  clearInterval(refresher);
  await channel.send(trade).catch(() => {});
}

// Recursive loop per channel — uses setTimeout so interval varies each cycle
function startChannelLoop(client, channel, trade, baseInterval) {
  if (!client.trading) return;

  // Jitter: ±25% of the base interval, so a 120s cooldown becomes 90–150s
  const jitter = Math.round(baseInterval * (randInt(0, 50) / 100 - 0.25));
  const nextDelay = Math.max(10000, baseInterval + jitter);

  humanSend(channel, trade).then(() => {
    if (!client.trading) return;
    setTimeout(() => startChannelLoop(client, channel, trade, baseInterval), nextDelay);
  });
}

module.exports = {
  name: "SendTrades",
  description: "Sends all trades into their channels, behaving like a real user.",
  duringTrading: false,
  execute(client, msg) {
    const { localTrades, globalTrade } = require("../../json/tradeInfo.json");
    if (!localTrades.length)
      return msg.reply("> You don't have any channels to send trades to.");

    client.trading = true;

    localTrades.forEach((ltrade, i) => {
      const channel = client.channels.cache.get(ltrade.channel);
      const trade = ltrade.current_trade || globalTrade;
      if (!channel || !trade) return;

      const cd = cooldowns.find((c) => c.id === channel.id);
      const baseInterval = cd
        ? cd.cooldown
        : (channel.rateLimitPerUser || 5) * 1000 + 2000;

      // Stagger each channel's start by 0–30s so they don't all fire together
      const startDelay = i === 0 ? 0 : randInt(0, 30000);
      setTimeout(() => {
        if (!client.trading) return;
        startChannelLoop(client, channel, trade, baseInterval);
      }, startDelay);
    });

    msg.reply(
      `> 🟢 Started sending trades to \`${localTrades.length}\` channel(s) with randomised intervals and human-like typing.`
    );
    console.log(
      `[${new Date().toLocaleTimeString()}] Trading started for ${localTrades.length} channel(s) with human behaviour enabled.`
    );
  },
};
