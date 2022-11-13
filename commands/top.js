const { DiscordAPIError, MessageActionRow, MessageButton } = require('discord.js');

module.exports = async (bot, clash, message, args, argsF) => {

  if (args.sort == false || args[0] == false || (args.sort == null && args[0] == null)) {
    const args = [ 'byRating' ];
    require('../buttons/top')(bot, clash, message, args);
    return;
  }

  const row = new MessageActionRow()
  .addComponents([ 
    new MessageButton()
      .setCustomId(`top_byRating`)
      .setLabel('По ретингу')
      .setStyle(1),
      
    new MessageButton()
      .setCustomId(`top_byAverageStars`)
      .setLabel('По ср. звёздам')
      .setStyle(1),

    new MessageButton()
      .setCustomId(`top_byTH`)
      .setLabel('По ТХ')
      .setStyle(1),

    new MessageButton()
      .setCustomId(`top_byName`)
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
  ],
  defaultPermission: true
};
