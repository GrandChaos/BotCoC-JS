const { exec } = require("child_process");
const generalFunctions = require('../generalFunctions.js');


module.exports = async (bot, clash) => {
  console.log(`\n${(new Date).toISOString()} - Sending ping...`);
  bot.channels.cache.get('1074404720208252938').send(`/ping`);

  let discordApi = false;
  let mongodb = false;
  let clashApi = false

  if (!isNaN(bot.ws.ping)) discordApi = true;

  try {
    const player = await bot.Players.findById('#Y88VUY8YR');
    mongodb = true;
  } catch (err) {
    console.log(err);
  }

  if (!clash.inMaintenance) clashApi = true;

  await generalFunctions.asyncTimeout(15000);
  console.log(new Date() - bot.lastPing);

  if (!discordApi || !mongodb || !clashApi || (new Date() - bot.lastPing > 16000)) {
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
}