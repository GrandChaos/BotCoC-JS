module.exports = async (bot, clash, message, args, argsF) => {
    const channel = '1043444739430690876';
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

    let dateEnd = null;
    if (args.duration != 0) {
        dateEnd = new Date();
        dateEnd.setDate(dateEnd.getDate() + args.duration);
    }

    await player.bans.push({ dateEnd: dateEnd, reason: `${args.reason} (${message.author.username})` });
    await player.save();

    if (args.duration != 0) {
        bot.channels.cache.get(channel).send(`${message.author.toString()} заблокировал на ${args.duration} дней игрока **${player.nickname}** *(${player._id})* по причине: "${args.reason}"`);
        message.reply(`Игрок ${player.nickname} заблокирован на ${args.duration} дней\nПричина: "${args.reason}"`);
    }
    else {
        bot.channels.cache.get(channel).send(`${message.author.toString()} заблокировал навсегда игрока **${player.nickname}** *(${player._id})* по причине: "${args.reason}"`);
        message.reply(`Игрок ${player.nickname} заблокирован навсегда\nПричина: "${args.reason}"`);
    }

    require('../update/checkPunish')(bot, clash, player);
};


module.exports.names = ["ban"]
module.exports.interaction = {
  name: 'ban',
  description: 'Заблокировать игрока',
  options: [
    {
      name: "nickname",
      description: "Никнейм или #ТЕГ игрока",
      type: "STRING",
      required: true
    },
    {
      name: "duration",
      description: "Продолжительность блокировки в днях (0 для вечной блокировки)",
      type: "INTEGER",
      required: true
    },
    {
      name: "reason",
      description: "Причина",
      type: "STRING",
      required: true
    }
  ],
  defaultPermission: true
};