const { MessageEmbed, DiscordAPIError, MessageActionRow, MessageButton } = require('discord.js');

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

  const clanTag = clashClan.tag;

  if (args.sort == false || args[1] == false || (args.sort == null && args[1] == null)) {
    const args = [ 'byTrophies', clashClan.tag ];
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