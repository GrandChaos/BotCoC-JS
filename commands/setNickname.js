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
  if (player == null) {
    message.reply(`Игрок с тегом ${tag} не найден!`);
    return;
  }

  oldNickname = player.nickname;
  player.set({nickname: argsF.new_nickname});
  player.save();

  message.reply(`Никнейм ${oldNickname} изменён на ${player.nickname}.`)
  return;
};

module.exports.names = ["set_nickname"]
module.exports.interaction = {
  name: 'set_nickname',
  description: 'Сменить никнейм игрока',
  options: [
    {
      name: "tag",
      description: "#Тег игрока в игре",
      type: "STRING",
      required: true
    },
    {
      name: "new_nickname",
      description: "Новый никнейм",
      type: "STRING",
      required: true
    },
  ],
  defaultPermission: true
};