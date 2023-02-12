module.exports = async (bot, clash, message, args, argsF) => {
  console.log(`API Latency is ${Math.round(bot.ws.ping)}ms\n${Date()}\n`);
  message.reply(`I'm here!\n\Latency is ${Date.now() - message.createdTimestamp}ms.\n\API Latency is ${Math.round(bot.ws.ping)}ms`);
  bot.lastPing = Date.now;
  //require('../update/checkApi')(bot, clash);
};

module.exports.names = ["ping"]
module.exports.interaction = {
  name: 'ping',
  description: 'Пингануть бота',
  defaultPermission: true
};