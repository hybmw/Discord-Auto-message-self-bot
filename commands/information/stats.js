module.exports = {
  name: "stats",
  description: "Shows a full snapshot of the bot's current configuration and trading status.",
  execute(client, msg) {
    const { prefix, mode } = require("../../json/config.json");
    const { localTrades, globalTrade } = require("../../json/tradeInfo.json");
    const dmConfig = require("../../json/dmConfig.json");
    const cooldowns = require("../../json/cooldowns.json");

    const lines = [];

    // ── Header ──────────────────────────────────────────────────────────────
    lines.push(`## 📊 Bot Stats — ${client.user.username}`);
    lines.push(`> **Status:** ${client.trading ? "🟢 Actively sending trades" : "🔴 Idle (not trading)"}`);
    lines.push(`> **Prefix:** \`${prefix}\`  |  **Mode:** \`${mode}\``);
    lines.push("");

    // ── Trade Channels ───────────────────────────────────────────────────────
    lines.push("### 📤 Trade Channels");
    if (!localTrades.length) {
      lines.push("> No channels set up. Use `.settrade` to add one.");
    } else {
      for (const lt of localTrades) {
        const channel = client.channels.cache.get(lt.channel);
        const channelName = channel ? `#${channel.name} (\`${lt.channel}\`)` : `\`${lt.channel}\` *(not in cache)*`;
        const cd = cooldowns.find((c) => c.id === lt.channel);
        const interval = cd
          ? cd.cooldown / 1000
          : channel?.rateLimitPerUser || 5;
        const tradeText = lt.current_trade || globalTrade || "*(using global trade)*";
        const preview = tradeText.replace(/\n/g, " ").slice(0, 80) + (tradeText.length > 80 ? "…" : "");
        lines.push(`> **Channel:** ${channelName}`);
        lines.push(`> **Cooldown:** \`${interval}s\``);
        lines.push(`> **Trade:** ${preview}`);
        lines.push("");
      }
    }

    // ── Global Trade ─────────────────────────────────────────────────────────
    lines.push("### 🌐 Global Trade");
    if (globalTrade) {
      const preview = globalTrade.replace(/\n/g, " ").slice(0, 100) + (globalTrade.length > 100 ? "…" : "");
      lines.push(`> ${preview}`);
    } else {
      lines.push("> *(not set)*");
    }
    lines.push("");

    // ── Auto-DM ──────────────────────────────────────────────────────────────
    lines.push("### 📬 Auto-DM");
    lines.push(`> **Status:** ${dmConfig.enabled ? "🟢 Enabled" : "🔴 Disabled"}`);
    lines.push(`> **Wait Timer:** \`${dmConfig.cooldown || 60}s\` (waits this long before replying, then blocks same user for same duration)`);
    if (dmConfig.message) {
      const preview = dmConfig.message.replace(/\n/g, " ").slice(0, 120) + (dmConfig.message.length > 120 ? "…" : "");
      lines.push(`> **Message:** ${preview}`);
    } else {
      lines.push(`> **Message:** *(not set)*`);
    }

    msg.reply(lines.join("\n"));
  },
};
