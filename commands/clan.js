const { MessageEmbed } = require('discord.js')

module.exports = async (bot, clash, message, args, argsF) => {
  let clan;
  
  if (args.clan_tag != null) {
    try {
      clan = await clash.getClan(args.clan_tag.toUpperCase());
    } catch (e) {}
    if (clan == null) {
      if (args.clan_tag.toUpperCase() === "ACADEMY") clan = await clash.getClan(bot.academyTag);
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
      if (args[0].toUpperCase() === "ACADEMY") clan = await clash.getClan(bot.academyTag);
      else {
        message.reply("Клан не найден");
        return;
      }
    }
  }
  else clan = await clash.getClan(bot.clanTag);
  
  let des = `Тег: ${clan.tag}\n\
  Очков: ${clan.points}\n\
  Уровень: ${clan.level}\n\
  Расположение: ${clan.location.name}\n\
  Язык: ${clan.chatLanguage.name}\n\
  Вид: ${clan.type}\n\
  Трофеев для вступления: ${clan.requiredTrophies}\n\
  ТХ для вступления: ${clan.requiredTownHallLevel}\n\
  Участников: ${clan.memberCount}\n\
  \n\
  Участие в войнах: ${clan.warFrequency}\n\
  Лига войн кланов: ${clan.warLeague.name}\n\
  Побед: ${clan.warWins}\n\
  Поражений: ${clan.warLosses}\n\
  Ничьих: ${clan.warTies}\n\
  Серия побед: ${clan.warWinStreak}\n\
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