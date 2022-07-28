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

  let score = (1 + args.th - player.th + args.stars) * 2 + args.difficult;
  if (score < 0) score = 0;
  score = score * 100 + args.percent;

  if (player != null) {
    player.attacks.push({score: score});
    player.save();
  }
  else {
    message.reply("Игрок не найден!");
    return;
  }
 
  message.reply(`Игроку ${player.nickname} добавлена запись на ${score} очков.`);
};


module.exports.names = ["add_attack"]
module.exports.interaction = {
  name: 'add_attack',
  description: 'Добавить атаку в базу',
  options: [
    {
      name: "nickname",
      description: "Никнейм (или #тег) игрока в игре",
      type: "STRING",
      required: true
    },
    {
      name: "stars",
      description: "Звёзды за ",
      type: "INTEGER",
      min_value: 0,
      max_value: 3,
      required: true
    },
    {
      name: "percent",
      description: "Процент разрушения",
      type: "INTEGER",
      min_value: 0,
      max_value: 100,  
      required: true
    },
    {
      name: "th",
      description: "ТХ противника",
      type: "INTEGER", 
      required: true
    },
    {
      name: "difficult",
      description: "Прокачка противника",
      type: "INTEGER", 
      choices: [
        { name: "Рашерская", value: 0},
        { name: "Средняя", value: 1},
        { name: "Фулловая", value: 2},
      ],
      required: true
    },
  ],
  defaultPermission: true
};