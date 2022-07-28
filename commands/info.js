const { MessageEmbed } = require('discord.js')

module.exports = async (bot, message, args, argsF) => {
  let player;

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

  if (player != null) {

    let fields = [
      { name: 'Очки', value: '', inline: true },
      { name: 'Дата', value: '', inline: true },
    ]

    let description = "```Очки | Дата\n"

    let rating = 0;
    let countAttacks = 0;

    player.attacks.forEach((attack) => {
      if (Date.now() - attack.date > 86400000 * 60) return;
      rating += attack.score;
      countAttacks++;
      //fields[0].value += attack.score + '\n';
      //fields[1].value += formatDate(attack.date) + '\n';

      if (attack.score >= 1000) description += attack.score + " | ";
      else if (attack.score >= 100) description += "\u00A0" + attack.score + " | ";
      else if (attack.score >= 10) description += "\u00A0" + attack.score + "\u00A0 | ";
      else description += "\u00A0\u00A0" + attack.score + "\u00A0 | ";

      description += formatDate(attack.date) + "\n";
    })
    description += "```";

    rating = Math.trunc(rating / countAttacks);

    let color = 'RED';
    if (rating >= 1000) color = 'PURPLE';
    else if (rating >= 800) color = 'BLUE';
    else if (rating >= 600) color = 'GREEN';
    else if (rating >= 400) color = 'YELLOW';
    else if (rating >= 200) color = 'ORANGE';

    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`Профиль игрока ${player.nickname}`)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/6695/6695008.png')
      //.setAuthor({name: 'Рейтинг эффективности на КВ и ЛВК', iconURL: 'https://cdn-icons-png.flaticon.com/512/6695/6695008.png'})
      .setDescription(`Тег: ${player.id}\nУровень ТХ: ${player.th}\nВсего атак: ${countAttacks}\n`)
      .setFooter(bot.version)
      .setTimestamp()

    if (countAttacks > 0) {
      embed
        .setDescription(`Тег: ${player.id}\nУровень ТХ: ${player.th}\nВсего атак: ${countAttacks}\nСредний показатель: ${rating}\n\nДанные по атакам:\n` + description)
        //.addFields(fields)
    }

    message.reply({ embeds: [embed] });
  }

  else {
    message.reply("Игрок не найден!");
    return;
  }
};

module.exports.names = ["info"]
module.exports.interaction = {
  name: 'info',
  description: 'Получить информацию о показателях игрока',
  options: [
    {
      name: "nickname",
      description: "Никнейм (или #тег) игрока в игре",
      type: "STRING",
      required: true
    },
  ],
  defaultPermission: true
};

function formatDate(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yyyy = date.getFullYear();

  return dd + '.' + mm + '.' + yyyy;
}