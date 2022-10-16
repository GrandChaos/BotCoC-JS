const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

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
    if (player.clan) date = `Состоит в клане с ${generalFunctions.formatDate(player.date)}`;
    else date = `Покинул клан ${generalFunctions.formatDate(player.date)}`;

    const attacksRating = generalFunctions.getAttacksRating(player);

    let color = 'RED';
    if (attacksRating.rating >= 1000) color = 'PURPLE';
    else if (attacksRating.rating >= 800) color = 'BLUE';
    else if (attacksRating.rating >= 600) color = 'GREEN';
    else if (attacksRating.rating >= 400) color = 'YELLOW';
    else if (attacksRating.rating >= 200) color = 'ORANGE';

    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`${player.nickname}`)
      .setThumbnail(member.league.icon.url)
      .setDescription(`Тег: ${player.id}\n${date}\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\nРоль: ${member.role}\nВсего атак: ${attacksRating.countAttacks}\n`)
      .setFooter(bot.version)
      .setTimestamp()

    if (attacksRating.countAttacks > 0) {
      embed
        .setDescription(`Тег: ${player.id}\n${date}\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\nРоль: ${member.role}\nВсего атак: ${attacksRating.countAttacks}\nСредний показатель: ${attacksRating.rating}\n\nДанные по атакам:\n${attacksRating.attacksTable}`)
    }

    if (player.clan) {
      const clan = await clash.getClan(player.clan);
      console.log(clan)
      embed.setTitle(`${player.nickname} - ${clan.name}`);
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