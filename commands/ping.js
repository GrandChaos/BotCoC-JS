module.exports = async (bot, clash, message, args, argsF) => {
  //console.log(`\nAPI Latency is ${Math.round(bot.ws.ping)}ms\n${Date()}\n`);
  console.log(`${(new Date).toISOString()} - Get ping!`);
  message.reply(`I'm here!\n\Latency is ${Date.now() - message.createdTimestamp}ms.\n\API Latency is ${Math.round(bot.ws.ping)}ms`);
  bot.lastPing = new Date();
};

module.exports.names = ["ping"]
module.exports.interaction = {
  name: 'ping',
  description: 'Пингануть бота',
  defaultPermission: true
};