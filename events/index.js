module.exports = (bot, clash) => {
  bot
  .on('ready', (client) => require('./ready')(bot))
  .on('messageCreate', (message) => require('./messageCreate')(bot, clash, message))
  .on('interactionCreate', (interaction) => require('./interactionCreate')(bot, clash, interaction));
};