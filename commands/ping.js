module.exports = async (bot, clash, message, args, argsF) => {
  message.reply(`I'm here!\n\API Latency is ${Math.round(bot.ws.ping)}ms`)
};

module.exports.names = ["ping"]
module.exports.interaction = {
  name: 'ping',
  description: 'Пингануть бота',
  defaultPermission: true
};