const { DiscordAPIError, MessageActionRow, MessageSelectMenu} = require('discord.js');
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, message, args, argsF) => {
    let player;

    if (!message.member.permissions.has('BAN_MEMBERS') || !args.slash || message.author.bot) {
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

    let countBans = 0;
    let options = [];

    for (const ban of player.bans) {
      if (ban.dateBegin != null && ban.dateEnd == null) {
        countBans++;
        options.push({
          label: `Вечная | ${ban.reason}`,
          value: `${player._id}_${ban._id.toString()}_${message.author.id}`
        });
      }
      else if (ban.dateBegin != null && ban.dateEnd > Date.now()) {
        countBans++;
        options.push({
          label: `${generalFunctions.formatDateFull(ban.dateEnd)} | ${ban.reason}`,
          value: `${player._id}_${ban._id.toString()}_${message.author.id}`
        });
      }
    }

    if (countBans == 0) {
        message.reply(`У игрока ${player.nickname} нет блокировок`);
        return;
    }

    const row = new MessageActionRow()
        .addComponents([
            new MessageSelectMenu()
            .setCustomId(`unban`)
            .setPlaceholder(`Выбери блокировку`)
            .addOptions(options)
            .setMaxValues(1)
    ]);

    message.reply({ content: 'Выбери блокировку, которую необходимо снять', components: [row], ephemeral: true });
};


module.exports.names = ["unban"]
module.exports.interaction = {
  name: 'unban',
  description: 'Снять блокировку с игрока',
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