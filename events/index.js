module.exports = (bot) => {
  bot
  .on('ready', (client) => require('./ready')(bot))
  .on('messageCreate', (message) => require('./messageCreate')(bot, message))
  .on('interactionCreate', (interaction) => require('./interactionCreate')(bot, interaction));
};