const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
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

    const attacksRating = generalFunctions.getAttacksRating(player, member);

    let dateDes;
    if (player.clan != null) dateDes = `Состоит в клане с ${generalFunctions.formatDateFull(player.date)}`;
    else dateDes = `Покинул клан ${generalFunctions.formatDateFull(player.date)}`;

    let des;
    if (player.clan != null) {
      des = `
Тег: ${player.id}
${dateDes}
Уровень ТХ: ${member.townHallLevel}
Трофеев: ${member.trophies}
Уровень: ${member.expLevel}
Роль: ${member.role}`;
    }
    else {
      des = `
Тег: ${player.id}
${dateDes}
Уровень ТХ: ${member.townHallLevel}
Трофеев: ${member.trophies}
Уровень: ${member.expLevel}`;
    }

    const punishments = generalFunctions.getPunishments(player);
    let punishmentsDes;
    if (punishments.countBans > 0 && attacksRating.countExtraLimits == 0) {
      punishmentsDes = `
**ЗАБЛОКИРОВАН**
Предупреждений: ${punishments.countWarns}/${player.warnsLimit}`;
    }
    else if (punishments.countBans == 0 && attacksRating.countExtraLimits == 0) {
      punishmentsDes = `
Предупреждений: ${punishments.countWarns}/${player.warnsLimit}`;
    }
    else if (punishments.countBans > 0 && attacksRating.countExtraLimits > 0) {
      punishmentsDes = `
**ЗАБЛОКИРОВАН**
Предупреждений: ${punishments.countWarns}/${player.warnsLimit}(+1)`;
    }
    else if (punishments.countBans == 0 && attacksRating.countExtraLimits > 0) {
      punishmentsDes = `
Предупреждений: ${punishments.countWarns}/${player.warnsLimit}(+1)`;
    }

    let attacksDes;
    if (attacksRating.countAttacks == 0 && attacksRating.totalAttacks == 0) {
      attacksDes = `
Атак в альянсе: ${attacksRating.totalAttacks}`;
    }
    else if (attacksRating.countAttacks == 0 && attacksRating.totalAttacks > 0) {
      attacksDes = `
Атак в альянсе: ${attacksRating.totalAttacks}
Звёзд в альянсе: ${attacksRating.totalStars}`;
    }
    else if (attacksRating.countAttacks > 0) {
      attacksDes = `
Атак в альянсе: ${attacksRating.totalAttacks}
Звёзд в альянсе: ${attacksRating.totalStars}
Звёзд за атаку: ${attacksRating.starsRatio}
Средний рейтинг: ${attacksRating.rating}

Данные по атакам:\n${attacksRating.attacksTable}`;
    }

    let color = 'GREY';
    if (attacksRating.rating >= 1000) color = 'PURPLE';
    else if (attacksRating.rating >= 800) color = 'BLUE';
    else if (attacksRating.rating >= 600) color = 'GREEN';
    else if (attacksRating.rating >= 400) color = 'YELLOW';
    else if (attacksRating.rating >= 200) color = 'ORANGE';
    else if (attacksRating.rating < 200) color = 'RED';

    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`${player.nickname}`)
      .setThumbnail(member.league.icon.url)
      .setDescription(`
${des}
${punishmentsDes}
${attacksDes}`)
      .setFooter(bot.version)
      .setTimestamp()
    
    if (player.clan) {
      const clan = await clash.getClan(player.clan);
      embed.setTitle(`${player.nickname} - ${clan.name}`);
    }

    const row = new MessageActionRow()
    .addComponents([ 
      new MessageButton()
        .setCustomId(`getPunishments_${player._id}`)
        .setLabel('Наказания')
        .setStyle(2),
    ]);

    if (punishments.countBans > 0 || punishments.countWarns > 0){
      message.reply({ embeds: [embed], components: [row] });
    }
    else {
      message.reply({ embeds: [embed] });
    }
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