const { MessageEmbed } = require('discord.js')

module.exports = async (bot, message, args, argsF) => {
  players = await bot.Players.find();

  players.forEach((player) => {
    let rating = 0;
    let countAttacks = 0;

    player.attacks.forEach((attack) => {
      if (Date.now() - attack.date > 86400000 * 60) return;
      rating += attack.score;
      countAttacks++;
    })

    rating /= countAttacks;
    player.rating = rating;
  })

  players.sort(function(p1, p2) {
    return p2.rating - p1.rating;
  })

  let fields = [
    { name: 'Рейтинг', value: '', inline: true },
    { name: 'Никнейм', value: '', inline: true },
  ]

  players.forEach((player) => {
    if (isNaN(player.rating)) return;
    fields[0].value += player.rating + '\n';
    fields[1].value += player.nickname + '\n';
  })

  const embed = new MessageEmbed()
    .setColor('DARK_RED')
    .setTitle(`Топ игроков`)
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/6695/6695008.png')
    //.setAuthor({name: 'Рейтинг эффективности на КВ и ЛВК', iconURL: 'https://cdn-icons-png.flaticon.com/512/6695/6695008.png'})
    .setFooter(bot.version)
    .setTimestamp()
    .addFields(fields)
    .setDescription('Если рейтинг игрока ниже ???? единиц, администрация в праве принять решение о его изгнании.')
  message.reply({ embeds: [embed] });

};

module.exports.names = ["top"]
module.exports.interaction = {
  name: 'top',
  description: 'Вывести топ игроков по очкам',
  defaultPermission: true
};
