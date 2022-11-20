const { DiscordAPIError, MessageActionRow, MessageSelectMenu} = require('discord.js');
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, message, args, argsF) => {
    let player;

    if (!message.member.permissions.has('MUTE_MEMBERS') || !args.slash || message.author.bot) {
        message.reply("Недостаточно прав для использования команды!");
        return;
    }

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

    let actualWarnsCount = 0;
    let options = [];

    for (const warn of player.warns) {
        if (warn.date != null && Date.now() - warn.date < 86400000 * 60) {
            actualWarnsCount += warn.amount;
            options.push({
                label: `${generalFunctions.formatDate(warn.date)} | ${warn.reason}`,
                value: `${player._id}_${warn._id.toString()}_${message.author.id}`

            });
        }
    }

    if (actualWarnsCount == 0) {
        message.reply(`У игрока ${player.nickname} нет предупреждений`);
        return;
    }

    const row = new MessageActionRow()
        .addComponents([
            new MessageSelectMenu()
                .setCustomId(`unwarn`)
                .setPlaceholder(`Выбери предупреждение`)
                .addOptions(options)
                .setMaxValues(1)
    ]);

    message.reply({ content: 'Выбери предупреждение, которое необходимо снять', components: [row], ephemeral: true });

    
};


module.exports.names = ["unwarn"]
module.exports.interaction = {
  name: 'unwarn',
  description: 'Снять предупреждения с игрока',
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