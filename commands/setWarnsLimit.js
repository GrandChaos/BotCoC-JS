const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, message, args, argsF) => {
    if (!message.member.permissions.has('BAN_MEMBERS') || !args.slash || message.author.bot) {
        message.reply("Недостаточно прав для использования команды!");
        return;
    }

  let player;
  const channel = '1043444739430690876';

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

    await player.set({ warnsLimit: args.amount });
    await player.save();
  
    bot.channels.cache.get(channel).send(`${message.author.toString()} изменил лимит предупреждений игрока **${player.nickname}** *(${player._id})* на ${args.amount}"`);
    message.reply(`Лимит игрока ${player.nickname} изменен на ${args.amount}`);
};

module.exports.names = ["limit"]
module.exports.interaction = {
  name: 'limit',
  description: 'Установить лимит предупреждений игроку',
  options: [
    {
      name: "nickname",
      description: "Никнейм (или #тег) игрока в игре",
      type: "STRING",
      required: true
    },
    {
        name: "amount",
        description: "Лимит предупреждений",
        type: "INTEGER",
        min_value: 2,
        max_value: 7,
        required: true
    },
  ],
  defaultPermission: true
};