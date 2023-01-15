const { MessageActionRow, MessageButton } = require('discord.js');

function formatDate(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  return dd + '.' + mm;
}


function formatDateFull(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yyyy = date.getFullYear();

  return dd + '.' + mm + '.' + yyyy;
}


async function asyncTimeout (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


function getAttacksRating(player) {
  let attacksTable = "```Очки | Звёзды | Дата\n"
  let trainingAttacksTable = "```Очки | Звёзды | Дата\n"
  let rating = 0;
  let countAttacks = 0;
  let countTrainingAttacks = 0;
  let countSkippedAttacks = 0;
  let totalStars = 0;
  let stars = 0;
  let starsRatio = 0;

  for (const attack of player.attacks) {
    totalStars += attack.stars;
    if (!attack.training) {
      if (Date.now() - attack.date > 86400000 * 60) continue;
      rating += attack.score;
      stars += attack.stars;
      countAttacks++;
      if (attack.score == 0) countSkippedAttacks++;

      if (attack.score >= 1000) attacksTable += attack.score + " | ";
      else if (attack.score >= 100) attacksTable += "\u00A0" + attack.score + " | ";
      else if (attack.score >= 10) attacksTable += "\u00A0" + attack.score + "\u00A0 | ";
      else attacksTable += "\u00A0\u00A0" + attack.score + "\u00A0 | ";

      if (attack.stars != null) attacksTable += `\u00A0\u00A0\u00A0${attack.stars}\u00A0\u00A0 | `
      else attacksTable += '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 | '

      attacksTable += formatDate(attack.date) + "\n";
    }
    else {
      if (Date.now() - attack.date > 86400000 * 14) continue;
      stars += attack.stars;
      countTrainingAttacks++;

      if (attack.score >= 1000) trainingAttacksTable += attack.score + " | ";
      else if (attack.score >= 100) trainingAttacksTable += "\u00A0" + attack.score + " | ";
      else if (attack.score >= 10) trainingAttacksTable += "\u00A0" + attack.score + "\u00A0 | ";
      else trainingAttacksTable += "\u00A0\u00A0" + attack.score + "\u00A0 | ";

      if (attack.stars != null) trainingAttacksTable += `\u00A0\u00A0\u00A0${attack.stars}\u00A0\u00A0 | `
      else trainingAttacksTable += '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 | '

      trainingAttacksTable += formatDate(attack.date) + "\n";
    }
  }
  attacksTable += "```";
  trainingAttacksTable += "```";

  starsRatio = (stars / (countAttacks + countTrainingAttacks)).toFixed(2);

  rating = Math.trunc(rating / countAttacks);

  return {
    rating: rating,
    starsRatio: starsRatio,
    totalStars: totalStars,
    countAttacks: countAttacks,
    countTrainingAttacks: countTrainingAttacks,
    countSkippedAttacks: countSkippedAttacks,
    attacksTable: attacksTable,
    trainingAttacksTable: trainingAttacksTable
  }
}


function getPunishments(player) {

  if (player == null) return;

  let countWarns = 0;
  let countNotActualWarns = 0;
  let warnsTable = '``` Дата | Кол-во | Причина\n';
  let notActualWarnsTable = '```   Дата    | Кол-во | Причина\n';
  let countBans = 0;
  let countNotActualBans = 0;
  let bansTable = '```Дата оконч.| Причина\n';
  let notActualBansTable = '```Дата оконч.| Причина\n';

  for (const warn of player.warns) {
    if (warn.date == null) continue;
    if (Date.now() - warn.date < 86400000 * 30) {
      countWarns += warn.amount;
      warnsTable += `${formatDate(warn.date)} |    ${warn.amount}   | ${warn.reason}\n`;
    }
    else {
      countNotActualWarns += warn.amount;
      notActualWarnsTable += `${formatDateFull(warn.date)} |    ${warn.amount}   | ${warn.reason}\n`;
    }
  }
  warnsTable += '```';
  notActualWarnsTable += '```';

  for (const ban of player.bans) {
    if (ban.dateBegin == null) continue;
    if (ban.dateEnd == null) {
      countBans++;
      bansTable += `  Никогда  | ${ban.reason}\n`;
    }
    else if (Date.now() - ban.dateEnd < 0) {
      countBans++;
      bansTable += `${formatDateFull(ban.dateEnd)} | ${ban.reason}\n`;
    }
    else {
      countNotActualBans++;
      notActualBansTable += `${formatDateFull(ban.dateEnd)} | ${ban.reason}\n`;
    }
  }
  bansTable += '```';
  notActualBansTable += '```';

  return {
    countWarns: countWarns,
    countNotActualWarns: countNotActualWarns,
    warnsTable: warnsTable,
    notActualWarnsTable: notActualWarnsTable,
    countBans: countBans,
    countNotActualBans: countNotActualBans,
    bansTable: bansTable,
    notActualBansTable: notActualBansTable,
  }
}


function createChooseClanMessage(bot) {
  let channel = '1001388048799518741';

  let roleStability = '1056570053186822244';
  let roleAcademy = '1056572135369351218';
  let roleJunior = '1056573821592801291';

  const row = new MessageActionRow()
  .addComponents([ 
    new MessageButton()
      .setCustomId(`giveRole_${roleStability}`)
      .setLabel('#STABILITY')
      .setStyle(1),
      
    new MessageButton()
      .setCustomId(`giveRole_${roleAcademy}`)
      .setLabel('#ST Academy')
      .setStyle(1),

    new MessageButton()
      .setCustomId(`giveRole_${roleJunior}`)
      .setLabel('#ST Junior')
      .setStyle(1),

  ]);

  bot.channels.cache.get(channel).send({ content: 'Выбери клан (или кланы), в котором состоишь, чтобы получить соответствующую роль. Повторное нажатие снимет роль', components: [row] });
}


module.exports = {
  formatDate: formatDate,
  formatDateFull: formatDateFull,
  getAttacksRating: getAttacksRating,
  getPunishments: getPunishments,
  asyncTimeout: asyncTimeout,
  createChooseClanMessage: createChooseClanMessage,
};