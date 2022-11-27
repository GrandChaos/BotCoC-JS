const { MessageEmbed } = require('discord.js')

module.exports = async (bot, clash, message, args, argsF) => {
  let clan;
  
  if (args.clan_tag != null) {
    try {
      clan = await clash.getClan(args.clan_tag.toUpperCase());
    } catch (e) {}
    if (clan == null) {
      if (args.clan_tag.toUpperCase() === "ACADEMY") clan = await clash.getClan(bot.academy.tag);
      else {
        message.reply("Клан не найден");
        return;
      }
    }
  }
  else if (args[0] != null) {
    try {
      clan = await clash.getClan(args[0].toUpperCase());
    } catch (e) {}
    if (clan == null) {
      if (args[0].toUpperCase() === "ACADEMY") clan = await clash.getClan(bot.academy.tag);
      else {
        message.reply("Клан не найден");
        return;
      }
    }
  }
  else clan = await clash.getClan(bot.stability.tag);
  
  let des = `Тег: ${clan.tag}
Очков: ${clan.points}
Уровень: ${clan.level}\n`
  if (clan.location != null ) des += `Расположение: ${clan.location.name}\n`
  if (clan.chatLanguage != null ) des += `Язык: ${clan.chatLanguage.name}\n`
des += `Вид: ${clan.type}
Трофеев для вступления: ${clan.requiredTrophies}
ТХ для вступления: ${clan.requiredTownHallLevel}
Участников: ${clan.memberCount}
\n\
Участие в войнах: ${clan.warFrequency}
Лига войн кланов: ${clan.warLeague.name}
Побед: ${clan.warWins}
Поражений: ${clan.warLosses}
Ничьих: ${clan.warTies}
Серия побед: ${clan.warWinStreak}
\n\
${clan.description}`;

  //console.log(clan);
  
  const embed = new MessageEmbed()
    .setColor('DARK_RED')
    .setTitle(clan.name)
    .setThumbnail(clan.badge.url)
    //.setAuthor({name: clan.name, iconURL: clan.badge.url})
    .setDescription(des)
    .setFooter(bot.version)
    .setTimestamp()
  
  message.reply({ embeds: [embed] });

};

module.exports.names = ["clan"]
module.exports.interaction = {
  name: 'clan',
  description: 'Информация о клане',
  options: [
    {
      name: "clan_tag",
      description: "#Тег клана",
      type: "STRING",
      required: false
    }
  ],
  defaultPermission: true
};