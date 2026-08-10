const fs = require("fs");

module.exports = {
  name: "DMOn",
  description: "Enables the auto-DM reply feature.",
  execute(client, msg) {
    const dmConfig = require("../../json/dmConfig.json");
    if (!dmConfig.message)
      return msg.reply("> You haven't set a DM message yet. Use `.setdm <message>` first.");
    if (dmConfig.enabled)
      return msg.reply("> Auto-DM is already enabled.");
    dmConfig.enabled = true;
    fs.writeFile("./json/dmConfig.json", JSON.stringify(dmConfig, null, 2), (e) => {
      if (e) {
        msg.reply("> There was an error enabling auto-DM. Check the console.");
        return console.log(e);
      }
      msg.reply("> Auto-DM reply is now **enabled**. I'll reply to DMs automatically.");
    });
  },
};
