const { DiscordAPIError, MessageActionRow, MessageButton } = require('discord.js');

module.exports = async (bot, clash, message, args, argsF) => {

  if ((args.sort == false || args[0] == false || (args.sort == null && args[0] == null))) {
    if (args.clan == null && args[1] == null) {
      const argsCom = [ 'byRating', 'ALL' ];
      require('../buttons/top')(bot, clash, message, argsCom);
      return;
    }
    else {
      let clan;

      if (args.clan != null) {
        clan = await bot.Clans.find({ keyWord: args.clan.toUpperCase() });
      }
      else if (args[0] != null) {
        clan = await bot.Clans.find({ keyWord: args[0].toUpperCase() });
      }

      if (clan[0] == null) {
        message.reply('Клан не найден. Используйте ключевые слова "STABILITY", "ACADEMY" и т.д.');
        return;
      }

      const argsCom = [ 'byRating', clan[0].keyWord ];
      require('../buttons/top')(bot, clash, message, argsCom);
      return;
    }
  }

  let clanArg = null
  if (args.clan == null && args[1] == null) {
    clanArg = 'ALL'
  }
  else {
    let clan;

    if (args.clan != null) {
      clan = await bot.Clans.find({ keyWord: args.clan.toUpperCase() });
    }
    else if (args[0] != null) {
      clan = await bot.Clans.find({ keyWord: args[0].toUpperCase() });
    }

    if (clan[0] == null) {
      message.reply('Клан не найден. Используйте ключевые слова "STABILITY", "ACADEMY" и т.д.');
      return;
    }

    clanArg = clan[0].keyWord;
  }

  const row = new MessageActionRow()
  .addComponents([ 
    new MessageButton()
      .setCustomId(`top_byRating_${clanArg}`)
      .setLabel('По ретингу')
      .setStyle(1),
      
    new MessageButton()
      .setCustomId(`top_byAverageStars_${clanArg}`)
      .setLabel('По ср. звёздам')
      .setStyle(1),

    new MessageButton()
      .setCustomId(`top_byTH_${clanArg}`)
      .setLabel('По ТХ')
      .setStyle(1),

    new MessageButton()
      .setCustomId(`top_byName_${clanArg}`)
      .setLabel('По никнейму')
      .setStyle(1),
  ]);

  message.reply({ content: 'Выбери сортировку', components: [row], ephemeral: true });

};

module.exports.names = ["top"]
module.exports.interaction = {
  name: 'top',
  description: 'Вывести топ игроков по очкам',
  options: [
    {
      name: "sort",
      description: "Необходима ли сортировка",
      type: "BOOLEAN",
      required: false
    },
    {
      name: "clan",
      description: "Клан альянса",
      type: "STRING",
      required: false,
    },
  ],
  defaultPermission: true
};
