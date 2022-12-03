module.exports = async (bot, clash, message, args, argsF) => {
    const channel = '1043444739430690876';
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

    await player.warns.push({ amount: args.amount, reason: `${args.reason} (${message.author.username})` });
    await player.save();

    bot.channels.cache.get(channel).send(`${message.author.toString()} выдал ${args.amount} предупреждений игроку **${player.nickname}** *(${player._id})* по причине: "${args.reason}"`);
    message.reply(`Предупреждения игроку ${player.nickname} выданы\nПричина: "${args.reason}"`);
};


module.exports.names = ["warn"]
module.exports.interaction = {
  name: 'warn',
  description: 'Выдать предупреждения игроку',
  options: [
    {
      name: "nickname",
      description: "Никнейм или #ТЕГ игрока",
      type: "STRING",
      required: true
    },
    {
      name: "amount",
      description: "Количетство предупреждений",
      type: "INTEGER",
      min_value: 1,
      max_value: 3,
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