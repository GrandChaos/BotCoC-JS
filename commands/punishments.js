const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, message, args, argsF) => {
    let player;

    if (args.slash && argsF.nickname[0] == '#') {
      player = await bot.Players.findById(args.nickname.toUpperCase());
    }
    else if (!args.slash && argsF[0][0] == '#') {
      player = await bot.Players.findById(args[0].toUpperCase());
    }
  
    else {
      if (args.slash) {
        player = await bot.Players.find({ nickname: argsF.nickname });
      }
      else {
        player = await bot.Players.find({ nickname: argsF[0] });
      }
      if (player.length > 1) {
        message.reply("Найдено несколько игроков, используйте #тег!");
        return;
      }
      player = player[0];
    }

    if (player == null) {
        message.reply("Игрок не найден! Попробуйте использовать #тег.");
        return;
    }

    const member = await clash.getPlayer(player._id);
    let extraLimits = 0;
    const attacksRating = generalFunctions.getAttacksRating(player, member);
    if (attacksRating.countExtraLimits > 0) extraLimits = 1;

    let des = '';
    const punish = generalFunctions.getPunishments(player);
    
    if (punish.countBans > 0) {
      des += `Активные блокировки:\n${punish.bansTable}\n`;
    }
    if (punish.countNotActualBans > 0) {
      des += `История блокировок:\n${punish.notActualBansTable}\n`;
    }
    if (punish.countWarns > 0) {
      des += `Предупреждения:\n${punish.warnsTable}\nВсего предупреждений: ${punish.countWarns}\n`;
    }
    if (extraLimits > 0) {
      des += `Лимит предупреждений: ${player.warnsLimit}(+1)\n\n`;
    }
    else des += `Лимит предупреждений: ${player.warnsLimit}\n\n`;
    if (punish.countNotActualWarns > 0) {
      des += `История предупреждений:\n${punish.notActualWarnsTable}\n`;
    }
    if (punish.countBans + punish.countNotActualBans + punish.countWarns + punish.countNotActualWarns == 0) {
      des += 'Наказаний нет';
    }

    const embed = new MessageEmbed()
      .setColor('GREY')
      .setTitle(`Наказания игрока ${player.nickname}`)
      .setDescription(des)
      .setFooter(bot.version)
      .setTimestamp()

      const row = new MessageActionRow()
      .addComponents([ 
        new MessageButton()
          .setCustomId(`getProfile_${player._id}`)
          .setLabel('Профиль')
          .setStyle(2),
      ]);

    message.reply({ embeds: [embed], components: [row] });
};


module.exports.names = ["punish"]
module.exports.interaction = {
  name: 'punish',
  description: 'Посмотреть наказания игрока',
  options: [
    {
      name: "nickname",
      description: "Никнейм или #ТЕГ игрока",
      type: "STRING",
      required: true
    },
  ],
  defaultPermission: true
};