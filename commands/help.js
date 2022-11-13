const {MessageEmbed} = require('discord.js')

module.exports = async (bot, clash, message, args, argsF) => {
  const embed = new MessageEmbed()
    .setColor('DARK_RED')
    .setTitle('Рейтинг эффективности на КВ и ЛВК')
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/6695/6695008.png')
    //.setAuthor({name: 'Рейтинг эффективности на КВ и ЛВК', iconURL: 'https://cdn-icons-png.flaticon.com/512/6695/6695008.png'})
    .setDescription('Данный бот создан для составления рейтинга \
атак игроков на клановых войнах. Не пропускайте атаки и побеждайте \
сильных противников, чтобы повысить свой рейтинг. \
\n\
Если рейтинг игрока ниже 200 единиц или доля пропущенных атак более 30%, администрация в праве принять \
решение о его изгнании.\
\n\n\
Общедоступные команды: \n\
\n\
/clan #ТЕГ(необяз.) - информация о клане. Если тег не указан - клан #STABILITY, ключевое слово `academy` вместо #ТЕГа - клан #ST Academy\n\
\n\
/clan_members #ТЕГ(необяз.) НЕОБХ.СОРТ.(необяз.) - список игроков клана. Если тег не указан - клан #STABILITY, ключевое слово `academy` вместо #ТЕГа - клан #ST Academy\n\
\n\
/profile НИКНЕЙМ(или #ТЕГ) - информация о игроке и его атаках (только игроки кланов #STABILITY и #ST Academy)\n\
\n\
/top НЕОБХ.СОРТ.(необяз.) - текущий топ игроков по рейтингу (только игроки клана #STABILITY)\n\
\n\
/warlog #ТЕГ(необяз.) - лог клановых войн клана. Если тег не указан - клан #STABILITY, ключевое слово `academy` вместо #ТЕГа - клан #ST Academy\n')
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