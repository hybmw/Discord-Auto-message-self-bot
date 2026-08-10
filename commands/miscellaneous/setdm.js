const fs = require("fs");

module.exports = {
  name: "SetDM",
  description: "Sets the auto-reply message sent when someone DMs you.",
  requiresArgs: true,
  arguments: ["<message>"],
  execute(client, msg, args) {
    const dmConfig = require("../../json/dmConfig.json");
    const newMessage = args.join(" ");
    dmConfig.message = newMessage;
    fs.writeFile("./json/dmConfig.json", JSON.stringify(dmConfig, null, 2), (e) => {
      if (e) {
        msg.reply("> There was an error saving the DM message. Check the console.");
        return console.log(e);
      }
      msg.reply(`> Auto-DM message set to:\n> ${newMessage}`);
    });
  },
};
