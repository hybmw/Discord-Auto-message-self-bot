const fs = require("fs");

module.exports = {
  name: "DMOff",
  description: "Disables the auto-DM reply feature.",
  execute(client, msg) {
    const dmConfig = require("../../json/dmConfig.json");
    if (!dmConfig.enabled)
      return msg.reply("> Auto-DM is already disabled.");
    dmConfig.enabled = false;
    fs.writeFile("./json/dmConfig.json", JSON.stringify(dmConfig, null, 2), (e) => {
      if (e) {
        msg.reply("> There was an error disabling auto-DM. Check the console.");
        return console.log(e);
      }
      msg.reply("> Auto-DM reply is now **disabled**.");
    });
  },
};
