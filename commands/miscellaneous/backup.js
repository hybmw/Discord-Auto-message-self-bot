const fs = require("fs");
const path = require("path");
const { ZipArchive } = require("archiver");

module.exports = {
  name: "Backup",
  description: "Creates a zip backup of all bot config and source files and sends it to your DMs.",
  async execute(client, msg) {
    msg.reply("> ⏳ Creating backup, please wait...");

    const backupPath = path.join(__dirname, "../../backup.zip");
    const output = fs.createWriteStream(backupPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on("close", async () => {
      try {
        await msg.channel.send({
          content: `> ✅ Backup created! \`${(archive.pointer() / 1024).toFixed(1)} KB\` — ${new Date().toLocaleString()}`,
          files: [{ attachment: backupPath, name: "fruit-trader-backup.zip" }],
        });
      } catch (e) {
        console.log(e);
        msg.reply("> ❌ Backup created but failed to send. Check the console.");
      } finally {
        fs.unlink(backupPath, () => {});
      }
    });

    archive.on("error", (e) => {
      console.log(e);
      msg.reply("> ❌ Failed to create backup. Check the console.");
    });

    archive.pipe(output);

    const sourceDir = path.join(__dirname, "../../");
    archive.directory(path.join(sourceDir, "json"), "json");
    archive.directory(path.join(sourceDir, "commands"), "commands");
    archive.directory(path.join(sourceDir, "events"), "events");
    archive.file(path.join(sourceDir, "index.js"), { name: "index.js" });
    archive.file(path.join(sourceDir, "functions.js"), { name: "functions.js" });

    archive.finalize();
  },
};
