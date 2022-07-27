module.exports = async (bot, message, args, argsF) => {
  if (message.author.bot || !message.member.permissions.has('BAN_MEMBERS') || !args.slash) {
    message.reply("Недостаточно прав для использования команды!");
    return;
  }

  args.tag = args.tag.toUpperCase();
  if (args.tag[0] != '#' || args.tag.length != 10) {
    message.reply("Неверный формат тега!");
    return;
  }
  
  const player = await bot.Players.findById(args.tag);
  if (player != null) {
    message.reply(`Игрок с тегом ${tag} уже зарегистрирован!`);
    return;
  }

  const newPlayer = new bot.Players({
    _id: args.tag,
    nickname: argsF.nickname,
    th: args.th
  })
  newPlayer.save();
  message.reply(`Игрок ${args.tag} ${argsF.nickname} успешно внесён в базу.`);
};


module.exports.names = ["add_player"]
module.exports.interaction = {
  name: 'add_player',
  description: 'Внести игрока в базу',
  options: [
    {
      name: "tag",
      description: "Тег игрока в игре",
      type: "STRING",
      required: true
    },
    {
      name: "nickname",
      description: "Никнейм игрока в игре без спецсимволов, пробелы заменить на нижнее подчеркивание",
      type: "STRING",
      required: true
    },
    {
      name: "th",
      description: "Уровень ТХ игрока",
      type: "INTEGER",
      required: true
    },
  ],
  defaultPermission: true
};