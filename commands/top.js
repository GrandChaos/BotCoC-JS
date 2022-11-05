const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, message, args, argsF) => {
  players = await bot.Players.find({ hide: false });

  for (const player of players) {
    player.rating = generalFunctions.getAttacksRating(player).rating;
    player.starsRatio = generalFunctions.getAttacksRating(player).starsRatio;
  }

  players.sort(function(p1, p2) {
    if (isNaN(p1.rating) && isNaN(p2.rating)) return 0;
    else if (isNaN(p1.rating)) return p2.rating;
    else if (isNaN(p2.rating)) return -p1.rating;
    return (p2.rating - p1.rating);
  })

  let description = "``` № | Рейт.| Ср. зв.| ТХ | Никнейм\n"

  let i = 1;

  for (const player of players) {
    if (isNaN(player.rating)) continue;
    //if (player.hide) continue;

    if (i >= 10) description += i++ + " | "
    else description += "\u00A0" + i++ + " | "

    if (player.rating >= 1000) description += player.rating + " | ";
    else if (player.rating >= 100) description += "\u00A0" + player.rating + " | ";
    else if (player.rating >= 10) description += "\u00A0" + player.rating + "\u00A0\ | ";
    else description += "\u00A0\u00A0" + player.rating + "\u00A0 | ";

    description += "\u00A0" + player.starsRatio + "\u00A0 | "

    if (player.th >= 10) description += player.th + " | ";
    else description += player.th + "\u00A0 + | ";

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
