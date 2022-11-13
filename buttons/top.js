const { MessageEmbed, DiscordAPIError } = require('discord.js');
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, interaction, args) => {

    players = await bot.Players.find({ hide: false });

    for (const player of players) {
      player.rating = generalFunctions.getAttacksRating(player).rating;
      player.starsRatio = generalFunctions.getAttacksRating(player).starsRatio;
    }
  
    if (args[0] == 'byRating') {
        players.sort( (a, b) => sortByRating(a, b) )
    }
    else if (args[0] == 'byAverageStars') {
        players.sort( (a, b) => {
            if (isNaN(a.starsRatio) && isNaN(b.starsRatio)) return sortByRating(a, b);
            else if (isNaN(a.starsRatio)) return b.starsRatio;
            else if (isNaN(b.starsRatio)) return -a.starsRatio;
            else if (a.starsRatio == b.starsRatio) return sortByRating(a, b);
            return (b.starsRatio - a.starsRatio);
        })
    }
    else if (args[0] == 'byTH') {
        players.sort( (a, b) => {
            if (a.th == b.th) return sortByRating(a, b);
            return (b.th - a.th);
        })
    }
    else if (args[0] == 'byName') {
        players.sort( (a, b) => a.nickname.localeCompare(b.nickname) );
    }
  
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
      .setFooter(bot.version)
      .setTimestamp()
      .setDescription(description)
    interaction.reply({ embeds: [embed] });

    function sortByRating(a, b) {
        if (isNaN(a.rating) && isNaN(b.rating)) return 0;
        else if (isNaN(a.rating)) return b.rating;
        else if (isNaN(b.rating)) return -a.rating;
        return (b.rating - a.rating);
    }
};

