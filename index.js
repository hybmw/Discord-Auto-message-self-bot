const fs = require("fs");
const { Client, Collection } = require("discord.js-selfbot-v13");
const { capitalize } = require("./functions.js");
require("dotenv").config();

const client = new Client({ rejectOnRateLimit: ["/channels"] });
client.commands = new Collection();
client.aliases = new Collection();

fs.readdirSync("./commands").forEach((category) => {
  fs.readdirSync(`./commands/${category}`)
    .filter((file) => file.endsWith(".js"))
    .forEach((jsFile) => {
      const commandName = jsFile.split(".js")[0];
      const command = require(`./commands/${category}/${commandName}`);
      command.category = capitalize(category);
      client.commands.set(commandName, command);
      if (!command.aliases) return;
      command.aliases.forEach((a) => client.aliases.set(a.toLowerCase(), command));
    });
});

fs.readdirSync("./events")
  .filter((file) => file.endsWith(".js"))
  .forEach((jsFile) => {
    const eventName = jsFile.split(".js")[0];
    const event = require(`./events/${eventName}`);
    client.on(event.name, (...args) => event.execute(client, ...args));
  });

process.on("unhandledRejection", (e) => {
  if (e.timeout) return;
  if (e.code == 500)
    return console.log(
      `[${new Date().toLocaleTimeString()}] There was a problem with your internet connection...`
    );
  console.log(
    `[${new Date().toLocaleTimeString()}] Uh Oh! An error has occurred. Check below to see more details.`
  );
  console.log(e);
});

client.on("disconnect", () => {
  console.log(`[${new Date().toLocaleTimeString()}] Disconnected. Reconnecting...`);
  client.login(process.env.TOKEN).catch((err) => {
    console.log(`[${new Date().toLocaleTimeString()}] Reconnect failed: ${err.message}`);
  });
});

client.on("error", (e) => {
  console.log(`[${new Date().toLocaleTimeString()}] Client error: ${e.message}`);
});

if (!process.env.TOKEN) {
  console.log(`[${new Date().toLocaleTimeString()}] ERROR: TOKEN is not set. Add your Discord token to Replit Secrets.`);
  process.exit(1);
}

client.login(process.env.TOKEN).catch((err) => {
  console.log(`[${new Date().toLocaleTimeString()}] Login failed: ${err.message}`);
  process.exit(1);
});
