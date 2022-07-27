module.exports = async (bot, message, args, argsF) => {
  message.reply(`I'm here!\n\Latency is ${Date.now() - message.createdTimestamp}ms.\n\API Latency is ${Math.round(bot.ws.ping)}ms`)
};

module.exports.names = ["ping"]
module.exports.interaction = {
  name: 'ping',
  description: 'Пингануть бота',
  defaultPermission: true
};