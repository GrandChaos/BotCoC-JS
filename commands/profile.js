const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js');

module.exports = async (bot, clash, message, args, argsF) => {
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

    const member = await clash.getPlayer(player._id);

    let date;
    if (!player.hide) date = `Состоит в клане с ${generalFunctions.formatDate(player.date)}`;
    else date = `Покинул клан ${generalFunctions.formatDate(player.date)}`;

    let description = "```Очки | Дата\n"

    let rating = 0;
    let countAttacks = 0;

    for (const attack of player.attacks) {
      if (Date.now() - attack.date > 86400000 * 60) continue;
      rating += attack.score;
      countAttacks++;

      if (attack.score >= 1000) description += attack.score + " | ";
      else if (attack.score >= 100) description += "\u00A0" + attack.score + " | ";
      else if (attack.score >= 10) description += "\u00A0" + attack.score + "\u00A0 | ";
      else description += "\u00A0\u00A0" + attack.score + "\u00A0 | ";

      description += generalFunctions.formatDate(attack.date) + "\n";
    }
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
      .setThumbnail(member.league.icon.url)
      //.setAuthor({name: 'Рейтинг эффективности на КВ и ЛВК', iconURL: 'https://cdn-icons-png.flaticon.com/512/6695/6695008.png'})
      .setDescription(`Тег: ${player.id}\n${date}\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\nРоль: ${member.role}\nВсего атак: ${countAttacks}\n`)
      .setFooter(bot.version)
      .setTimestamp()

    if (countAttacks > 0) {
      embed
        .setDescription(`Тег: ${player.id}\n${date}\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\nРоль: ${member.role}\nВсего атак: ${countAttacks}\nСредний показатель: ${rating}\n\nДанные по атакам:\n` + description)
        //.addFields(fields)
    }

    message.reply({ embeds: [embed] });
  }

  else {
    message.reply("Игрок не найден! Попробуйте использовать #тег.");
    return;
  }
};

module.exports.names = ["profile"]
module.exports.interaction = {
  name: 'profile',
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