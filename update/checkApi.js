const { exec } = require("child_process");


module.exports = async (bot, clash) => {
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

  if (!discordApi || !mongodb || !clashApi) {
    console.log(`Stop time: ${Date()}`);
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