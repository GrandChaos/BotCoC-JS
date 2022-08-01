const { MessageEmbed } = require('discord.js')

module.exports = async (bot, clash, message, args, argsF) => {
  players = await bot.Players.find();

  for (const player of players) {
    let rating = 0;
    let countAttacks = 0;

    for (const attack of player.attacks) {
      if (Date.now() - attack.date > 86400000 * 60) continue;
      rating += attack.score;
      countAttacks++;
    }

    rating = Math.trunc(rating / countAttacks);
    player.rating = rating;
    //console.log(player.rating);
  }

  players.sort(function(p1, p2) {
    if (isNaN(p1.rating) && isNaN(p2.rating)) return 0;
    else if (isNaN(p1.rating)) return p2.rating;
    else if (isNaN(p2.rating)) return -p1.rating;
    return (p2.rating - p1.rating);
  })

  let description = "```Номер | Рейтинг | Никнейм\n"

  let i = 1;

  for (const player of players) {
    if (isNaN(player.rating)) continue;
    if (player.hide) continue;

    //const member = await clash.getPlayer(player.id);

    if (i >= 10) description += "\u00A0" + i++ + "\u00A0\u00A0 | "
    else description += "\u00A0" + i++ + "\u00A0\u00A0\u00A0 | "

    if (player.rating >= 1000) description += "\u00A0" + player.rating + "\u00A0\u00A0 | ";
    else if (player.rating >= 100) description += "\u00A0\u00A0" + player.rating + "\u00A0\u00A0 | ";
    else if (player.rating >= 10) description += "\u00A0\u00A0" + player.rating + "\u00A0\u00A0\u00A0\ | ";
    else description += "\u00A0\u00A0\u00A0" + player.rating + "\u00A0\u00A0\u00A0 | ";

    /*if (member.townHallLevel >= 10) description += member.townHallLevel + " | "
    else description += member.townHallLevel + "\u00A0 + | "*/

    description += player.nickname + "\n";
  }
  
  description += "```"

  const embed = new MessageEmbed()
    .setColor('DARK_RED')
    .setTitle(`Топ игроков`)
    //.setThumbnail('https://cdn-icons-png.flaticon.com/512/6695/6695008.png')
    //.setAuthor({name: 'Топ игроков', iconURL: 'https://cdn-icons-png.flaticon.com/512/6695/6695008.png'})
    .setFooter(bot.version)
    .setTimestamp()
    .setDescription(description)
  message.reply({ embeds: [embed] });

};

module.exports.names = ["top"]
module.exports.interaction = {
  name: 'top',
  description: 'Вывести топ игроков по очкам',
  defaultPermission: true
};
