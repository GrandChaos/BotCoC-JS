const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js');

module.exports = async (bot, clash, message, args, argsF) => {
    const channel = '1043444739430690876';

    if (!message.member.permissions.has('MUTE_MEMBERS') || !args.slash || message.author.bot) {
        message.reply("Недостаточно прав для использования команды!");
        return;
    }

    if (argsF.nickname[0] == '#') {
        player = await bot.Players.findById(args.nickname.toUpperCase());
    }
    else player = await bot.Players.find({ nickname: argsF.nickname });

    if (player.length > 1) {
        message.reply("Найдено несколько игроков, используйте #тег!");
        return;
    }

    player = player[0];

    if (player == null) {
        message.reply("Игрок не найден! Попробуйте использовать #тег.");
        return;
    }

    await player.warns.push({ amount: args.amount, reason: args.reason });
    await player.save();

    bot.channels.cache.get(channel).send(`${message.author.toString()} выдал ${args.amount} предупреждений игроку ${player.nickname} (${player._id}) по причине: ${args.reason}`);
    message.reply(`Предупреждения игроку ${player.nickname} выданы`);
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
      max_value: 5,
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