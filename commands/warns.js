const { MessageEmbed } = require('discord.js')
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

    let actualWarnsTable = '``` Дата | Кол-во | Причина\n';
    let notActualWarnsTable = '``` Дата | Кол-во | Причина\n';

    let actualWarnsCount = 0;
    let notActualWarnsCount = 0;

    for (const warn of player.warns) {
        if (warn.date == null) continue;
        if (Date.now() - warn.date < 86400000 * 60) {
            actualWarnsCount += warn.amount;
            actualWarnsTable += `${generalFunctions.formatDate(warn.date)} |    ${warn.amount}   | ${warn.reason}\n`;
        }
        else {
            notActualWarnsCount += warn.amount;
            notActualWarnsTable += `${generalFunctions.formatDate(warn.date)} |    ${warn.amount}   | ${warn.reason}\n`;
        }
    }
    actualWarnsTable += '```';
    notActualWarnsTable += '```';

    let des = '';

    if (actualWarnsCount > 0) {
        des += `Текущие:
${actualWarnsTable}
Всего предупреждений: ${actualWarnsCount}\n\n`;
    }
    if (notActualWarnsCount > 0) {
        des += `История наказаний:\n ${notActualWarnsTable}`;
    }
    if (actualWarnsCount == 0 && notActualWarnsCount == 0) {
        des += `Предупреждений нет`;
    }

    const embed = new MessageEmbed()
      .setColor('GREY')
      .setTitle(`Предупреждения игрока ${player.nickname}`)
      .setDescription(des)
      .setFooter(bot.version)
      .setTimestamp()

    message.reply({ embeds: [embed] });
};


module.exports.names = ["warns"]
module.exports.interaction = {
  name: 'warns',
  description: 'Посмотреть предупреждения игрока',
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