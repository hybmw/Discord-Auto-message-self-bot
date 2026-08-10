const { version } = require("../json/config.json");
const packageUrl = "https://raw.githubusercontent.com/ehrm-a/Fruit-Trader/main/package.json";

module.exports = {
  name: "ready",
  execute(client) {
    const currentTime = new Date().toLocaleTimeString();
    console.log(
      `\n[${currentTime}] ${client.user.username} has been logged in and is ready to trade!`
    );
    // Update Checker
    fetch(packageUrl).then(async (r) => {
      const data = await r.json();
      if (data.version == version) console.log(`[${currentTime}] Your client is up to date!`);
      else console.log(`[${currentTime}] Your client is outdated, download the latest version.`);
    });
  },
};
