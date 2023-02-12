const { exec } = require("child_process");


module.exports = async (bot, clash) => {
  bot.channels.cache.get('1074404720208252938').send(`/ping`);

  let discordApi = false;
  let mongodb = false;
  let clashApi = false

  if (!isNaN(bot.ws.ping)) discordApi = true;

  try {
    const player = await bot.Players.findById('#Y88VUY8YR');
    mongodb = true;
  } catch(err) {
    console.log(err);
  }

  if (!clash.inMaintenance) clashApi = true;

  if (!discordApi || !mongodb || !clashApi || (new Date() - bot.lastPing > 3.5 * 60 * 1000)) {
    console.log(`Stop time: ${new Date()}`);
    exec("kill 1", (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }

  console.log(new Date() - bot.lastPing);
}