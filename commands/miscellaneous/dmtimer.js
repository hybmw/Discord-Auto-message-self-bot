const fs = require("fs");

module.exports = {
  name: "DMTimer",
  description: "Sets how long (in seconds) the bot waits after a DM before sending the auto-DM reply.",
  requiresArgs: true,
  arguments: ["<seconds>"],
  execute(client, msg, args) {
    const dmConfig = require("../../json/dmConfig.json");
    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 1)
      return msg.reply("> Please provide a valid number of seconds (minimum 1).");
    dmConfig.cooldown = seconds;
    fs.writeFile("./json/dmConfig.json", JSON.stringify(dmConfig, null, 2), (e) => {
      if (e) {
        msg.reply("> There was an error saving the timer. Check the console.");
        return console.log(e);
      }
      msg.reply(
        `> Auto-DM wait time set to \`${seconds} second${seconds === 1 ? "" : "s"}\`. When someone DMs the bot, it will wait ${seconds}s before sending the auto-DM message (and won't send another one to the same person for ${seconds}s after that).`
      );
    });
  },
};
