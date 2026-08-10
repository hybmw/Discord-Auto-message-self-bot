const dmCooldowns = new Map();
const dmPendingTimers = new Map();

module.exports = {
  name: "messageCreate",
  execute(client, msg) {
    const { prefix, mode } = require("../json/config.json");

    // Auto-DM reply: when someone else DMs the account
    if (msg.channel.type == "DM" && msg.author.id != client.user.id) {
      const dmConfig = require("../json/dmConfig.json");
      if (dmConfig.enabled && dmConfig.message) {
        const userId = msg.author.id;
        const now = Date.now();
        const lastSent = dmCooldowns.get(userId) || 0;
        const cooldownMs = (dmConfig.cooldown || 60) * 1000;

        // Still within cooldown since the last auto-reply was actually sent, ignore.
        if (now - lastSent < cooldownMs) return;

        // Already waiting to send a reply to this user, don't schedule another one.
        if (dmPendingTimers.has(userId)) return;

        const timer = setTimeout(() => {
          dmPendingTimers.delete(userId);
          dmCooldowns.set(userId, Date.now());
          msg.channel.send(dmConfig.message).catch(() => {});
          console.log(
            `[${new Date().toLocaleTimeString()}] Auto-replied to DM from ${msg.author.username} (after ${cooldownMs / 1000}s delay).`
          );
        }, cooldownMs);
        dmPendingTimers.set(userId, timer);

        console.log(
          `[${new Date().toLocaleTimeString()}] DM received from ${msg.author.username}, waiting ${cooldownMs / 1000}s before auto-reply.`
        );
      }
      return;
    }

    // Ignore messages not from own account, not starting with prefix, or in DMs
    if (
      !msg.content.startsWith(prefix) ||
      msg.author.id != client.user.id ||
      msg.channel.type == "DM"
    )
      return;

    const arguments = msg.content.slice(prefix.length).split(" ");
    const individualMode = arguments.findIndex((a) => a.toLowerCase() == "-s");
    let isSubtle = mode == "subtle";
    if (individualMode >= 0) {
      arguments.splice(individualMode, 1);
      isSubtle = true;
    }
    const commandName = arguments.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.aliases.get(commandName);
    if (!command) return;
    if (command.duringTrading == false && client.trading) {
      if (isSubtle) {
        msg.delete();
        return console.log(
          `[${new Date().toLocaleTimeString()}] The action "${prefix}${
            command.name
          }" cannot be performed while trading.`
        );
      }
      return msg.reply(
        `> You cannot perform this command while you are trading. To stop, simply say \`${prefix}stoptrades\``
      );
    }
    if (command.requiresArgs && !arguments.length) {
      if (isSubtle) {
        msg.delete();
        return console.log(
          `[${new Date().toLocaleTimeString()}] The action "${prefix}${
            command.name
          }" requires arguments.`
        );
      }
      return msg.reply(
        `> That command requires arguments! Use \`${prefix}help\` for more information.`
      );
    }
    command.execute(client, msg, arguments, isSubtle);
  },
};
