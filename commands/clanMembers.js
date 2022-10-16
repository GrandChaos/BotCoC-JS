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
    } catch (e) {
      console.log(e);
    }
    if (clan == null) {
      if (args[0].toUpperCase() === "ACADEMY") clan = await clash.getClan(bot.academyTag);
      else {
        message.reply("Клан не найден");
        return;
      }
    }
  }
  else clan = await clash.getClan(bot.clanTag);

  let des = "**Участники клана:**```Трофеи\u00A0|\u00A0\u00A0\u00A0\u00A0Тег\u00A0\u00A0\u00A0\u00A0|\u00A0ТХ\u00A0|\u00A0Никнейм\n";

  const members = await clan.fetchMembers();
  
  for (const member of members) {
    
    if (member.trophies >= 1000) des += "\u00A0" + member.trophies + "\u00A0\u00A0|";
    else if (member.trophies >= 100) des += "\u00A0\u00A0" + member.trophies + "\u00A0\u00A0|";
    else if (member.trophies >= 10) des += "\u00A0\u00A0" + member.trophies + "\u00A0\u00A0\u00A0|";
    else des += "\u00A0\u00A0\u00A0" + member.trophies + "\u00A0\u00A0\u00A0|";

    if (member.tag.length == 11) des += member.tag + "|";
    else if (member.tag.length == 10) des += member.tag + "\u00A0|";
    else if (member.tag.length == 9) des += "\u00A0" + member.tag + "\u00A0|";
    else if (member.tag.length == 8) des += "\u00A0" + member.tag + "\u00A0\u00A0|";
    else if (member.tag.length == 7) des += "\u00A0\u00A0" + member.tag + "\u00A0\u00A0|";
    else if (member.tag.length == 6) des += "\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0|";
    else if (member.tag.length == 5) des += "\u00A0\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0|";
    else if (member.tag.length == 4) des += "\u00A0\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0\u00A0|";
    else if (member.tag.length == 3) des += "\u00A0\u00A0\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0\u00A0|";
    else  des += "\u00A0\u00A0\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0\u00A0|";

    if (member.townHallLevel >= 10) des += "\u00A0" + member.townHallLevel + "\u00A0|"
    else des += "\u00A0\u00A0" + member.townHallLevel + "\u00A0|"
    
    des += "\u00A0" + member.name;

    //if (member.role != 'member') des += `\u00A0(${member.role})`;
    des += "\n";    
  }
  des += "```"

  //console.log(clan);

  const embed = new MessageEmbed()
    .setColor('DARK_RED')
    .setTitle(clan.name)
    //.setThumbnail(clan.badge.url)
    //.setAuthor({name: clan.name, iconURL: clan.badge.url})
    .setDescription(des)
    .setFooter(bot.version)
    .setTimestamp()
  message.reply({ embeds: [embed] });

  //message.reply(clan.name);

};

module.exports.names = ["clan_members"]
module.exports.interaction = {
  name: 'clan_members',
  description: 'Список участников клана',
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