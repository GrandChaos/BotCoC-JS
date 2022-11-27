const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js');

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
  else if (args[1] != null) {
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

  let count = 10;
  if (args.count != null) count = args.count;
  else if (args[0] != null && typeof args[0] == "number" && args[0] <= 30) count = args[0];
  
  let des = `Тег: ${clan.tag}
  Лига войн кланов: ${clan.warLeague.name}
  Побед: ${clan.warWins}
  Поражений: ${clan.warLosses}
  Ничьих: ${clan.warTies}
  Серия побед: ${clan.warWinStreak}`;

  const embed = new MessageEmbed()
    .setColor('DARK_RED')
    .setTitle(`Лог войны клана ${clan.name}`)
    .setThumbnail(clan.badge.url)
    .setDescription(des)
  
  message.reply({ embeds: [embed] });

  let resEmbeds = [];

  let warlog;
  try {
    warlog = await clash.getClanWarLog(clan.tag);
  }
  catch {
    message.channel.send("Лог клана недоступен");
    return;
  }
  
  for (let i = 0; i < count; i++) {
    if (i == warlog.length) break;
    if (warlog.at(i).isCWL || warlog.at(i).result == null || warlog.at(i).opponent.name == null) {
      count++;
      continue;
    } 

    let warEmbed = new MessageEmbed();

    if (warlog.at(i).result == "win") warEmbed.setColor('GREEN');
    else if (warlog.at(i).result == "lose") warEmbed.setColor('RED');
    else warEmbed.setColor('GRAY');
    
    let warDes = `Завершена: ${generalFunctions.formatDate(warlog.at(i).endTime)}
Размер команды: ${warlog.at(i).teamSize}
Тип: `;

    if (warlog.at(i).isNormal) warDes += "Обычная";
    if (warlog.at(i).isFriendly) warDes += "Дружеская";

    warEmbed.setDescription(warDes);

    warEmbed.addFields(
		{ name: warlog.at(i).clan.name, value: `Звёзды: ${warlog.at(i).clan.stars}
Разрушение: ${warlog.at(i).clan.destruction.toFixed(2)}%
Атак использовано: ${warlog.at(i).clan.attackCount}`,inline: true },
      
		{ name: warlog.at(i).opponent.name, value: `Звёзды: ${warlog.at(i).opponent.stars}
Разрушение: ${warlog.at(i).opponent.destruction.toFixed(2)}%`,inline: true },
	)

    resEmbeds.push(warEmbed);

    if (resEmbeds.length == 10) {
      message.channel.send({embeds: resEmbeds})
      resEmbeds = [];
    }
  }
  if (resEmbeds.length > 0) message.channel.send({embeds: resEmbeds});
};


module.exports.names = ["warlog"]
module.exports.interaction = {
  name: 'warlog',
  description: 'Лог войны клана',
  options: [
    {
      name: "count",
      description: "Длинна лога, по умолчанию 10",
      type: "INTEGER",
      min_value: 1,
      max_value: 30,
      required: false
    },
    {
      name: "clan_tag",
      description: "#Тег клана",
      type: "STRING",
      required: false
    }
  ],
  defaultPermission: true
};