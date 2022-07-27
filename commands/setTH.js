module.exports = async (bot, message, args, argsF) => {
  if (message.author.bot || !message.member.permissions.has('BAN_MEMBERS') || !args.slash) {
    message.reply("Недостаточно прав для использования команды!");
    return;
  }

  let player;
  
  if (argsF.nickname[0] == '#'){
    player = await bot.Players.findById(args.nickname.toUpperCase());
  }
  else {
    player = await bot.Players.find({nickname: argsF.nickname});
    if (player.length > 1) {
      message.reply("Найдено несколько игроков, используйте #тег!");
      return;
    }
    player = player[0];
  }

  if (player != null) {
    player.set({th: args.th});
    player.save();
  }
  else {
    message.reply("Игрок не найден!");
    return;
  }
 
  message.reply(`ТХ игрока ${player.nickname} установлен на ${player.th} уровень.`);
};

module.exports.names = ["set_th"]
module.exports.interaction = {
  name: 'set_th',
  description: 'Сменить уровень ТХ игрока',
  options: [
    {
      name: "nickname",
      description: "Никнейм или #тег игрока в игре",
      type: "STRING",
      required: true
    },
    {
      name: "th",
      description: "Уровень тх игрока",
      type: "INTEGER",
      required: true
    },
  ],
  defaultPermission: true
};