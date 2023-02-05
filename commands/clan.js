const { MessageEmbed } = require('discord.js')

module.exports = async (bot, clash, message, args, argsF) => {
  let clashClan;
  let clan;
  
  try {
    if (args.clan_tag != null) {
      /*try {
        clan = await clash.getClan(args.clan_tag.toUpperCase());
      } catch (e) {}
      if (clan == null) {
        if (args.clan_tag.toUpperCase() === "ACADEMY") clan = await clash.getClan(bot.academy.tag);
        else {
          message.reply("Клан не найден");
          return;
        }
      }*/

      if (args.clan_tag[0] != '#'){
        clan = await bot.Clans.find({ keyWord: args.clan_tag.toUpperCase() });
        args.clan_tag = clan[0].tag;
      }

      clashClan = await clash.getClan(args.clan_tag.toUpperCase());

    }
    else if (args[0] != null) {
      /*try {
        clashClan = await clash.getClan(args[0].toUpperCase());
      } catch (e) {}
      if (clashClan == null) {
        if (args[0].toUpperCase() === "ACADEMY") clashClan = await clash.getClan(bot.academy.tag);
        else {
          message.reply("Клан не найден");
          return;
        }
      }*/

      if (args[0][0] != '#'){
        clan = await bot.Clans.find({ keyWord: args[0].toUpperCase() });
        args[0] = clan[0].tag;
      }

      clashClan = await clash.getClan(args[0].toUpperCase());

    }
    else {
      clan = await bot.Clans.find({ keyWord: 'STABILITY' });
      clashClan = await clash.getClan( clan[0].tag );
    }

  } catch (e) {
    console.warn(e);
    message.reply("Клан не найден");
    return;
  }
  
  let des = `Тег: ${clashClan.tag}
Очков: ${clashClan.points}
Уровень: ${clashClan.level}\n`
  if (clashClan.location != null ) des += `Расположение: ${clashClan.location.name}\n`
  if (clashClan.chatLanguage != null ) des += `Язык: ${clashClan.chatLanguage.name}\n`
des += `Вид: ${clashClan.type}
Трофеев для вступления: ${clashClan.requiredTrophies}
ТХ для вступления: ${clashClan.requiredTownHallLevel}
Участников: ${clashClan.memberCount}
\n\
Участие в войнах: ${clashClan.warFrequency}
Лига войн кланов: ${clashClan.warLeague.name}
Побед: ${clashClan.warWins}
Поражений: ${clashClan.warLosses}
Ничьих: ${clashClan.warTies}
Серия побед: ${clashClan.warWinStreak}
\n\
${clashClan.description}`;

  //console.log(clan);
  
  const embed = new MessageEmbed()
    .setColor('DARK_RED')
    .setTitle(clashClan.name)
    .setThumbnail(clashClan.badge.url)
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