const { exec } = require("child_process");


module.exports = async (bot) => {
  if (!isNaN(bot.ws.ping)) return;
  else {
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