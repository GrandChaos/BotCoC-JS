const {MessageEmbed} = require('discord.js')

module.exports = async (bot, message, args, argsF) => {
  const embed = new MessageEmbed()
    .setColor('DARK_RED')
    .setTitle('Рейтинг эффективности на КВ и ЛВК')
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/6695/6695008.png')
    //.setAuthor({name: 'Рейтинг эффективности на КВ и ЛВК', iconURL: 'https://cdn-icons-png.flaticon.com/512/6695/6695008.png'})
    .setDescription('Данный бот создан для составления рейтинга \
      атак игроков на клановых войнах. Не пропускайте атаки и побеждайте \
      сильных противников, чтобы повысить свой рейтинг. \
      \n\
      Если рейтинг игрока ниже ???? единиц, администрация в праве принять \
      решение о его изгнании.\
      \n\n\
      Общедоступные команды: \n\
      \n\
      /top - текущий топ игрков по рейтингу \n\
      \n\
      /info НИКНЕЙМ(или #ТЕГ) - информация о игроке и его атаках\n')
    .setFooter(bot.version)
    .setTimestamp()
  
  message.reply({embeds:[embed]});
};

module.exports.names = ["help"]
module.exports.interaction = {
  name: 'help',
  description: 'Получить информацию о боте',
  defaultPermission: true
};