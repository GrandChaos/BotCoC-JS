const { MessageEmbed, DiscordAPIError, MessageActionRow, MessageButton } = require('discord.js');

module.exports = async (bot, clash, message, args, argsF) => {
  let clanTag;
  
  if (args.clan_tag != null) {
    if (args.clan_tag.toUpperCase() === "ACADEMY") clanTag = bot.academy.tag;
    else {
      try {
        const clan = await clash.getClan(args.clan_tag.toUpperCase());
        clanTag = clan.tag;
      } catch (e) {
        //console.log(e);
        message.reply('Клан не найден');
        return;
      }
    }
  }
  else if (args[0] != null) {
    if (args[0].toUpperCase() === "ACADEMY") clanTag = bot.academy.tag;
    else {
      try {
        const clan = await clash.getClan(args[0].toUpperCase());
        clanTag = clan.tag;
      } catch (e) {
        //console.log(e);
        message.reply('Клан не найден');
        return;
      }
    }
  }
  else clanTag = bot.stability.tag;

  if (args.sort == false || args[1] == false || (args.sort == null && args[1] == null)) {
    const args = [ 'byTrophies', bot.stability.tag ];
    require('../buttons/clanMembers')(bot, clash, message, args);
    return;
  }

  const row = new MessageActionRow()
    .addComponents([ 
      new MessageButton()
        .setCustomId(`clanMembers_byTrophies_${clanTag}`)
        .setLabel('По трофеям')
        .setStyle(1),
        
      new MessageButton()
        .setCustomId(`clanMembers_byTH_${clanTag}`)
        .setLabel('По ТХ')
        .setStyle(1),

      new MessageButton()
        .setCustomId(`clanMembers_byName_${clanTag}`)
        .setLabel('По никнейму')
        .setStyle(1),
    ]);

  message.reply({ content: 'Выбери сортировку', components: [row], ephemeral: true });
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
    },
    {
      name: "sort",
      description: "Необходима ли сортировка",
      type: "BOOLEAN",
      required: false
    },
  ],
  defaultPermission: true
};