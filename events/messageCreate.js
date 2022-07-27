module.exports = (bot, message) => {
  const {content} = message;
  const config = require('../config.json');
  config.prefix = '/';
  
  if(content.slice(0, config.prefix.length) !== config.prefix) return;
  
  const
    messageArray = content.toLowerCase().split(' '), 
    command = messageArray[0].replace(config.prefix, ''),
    args = messageArray.slice(1),
    messageArrayFull = content.split(' '), 
    argsF = messageArrayFull.slice(1),
    commandRun = bot.commands.get(command);

  if (commandRun) commandRun(bot, message, args, argsF)
  .catch(err => console.error(err));
}