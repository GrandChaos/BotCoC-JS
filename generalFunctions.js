function formatDate(date) {

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


module.exports = {
  formatDate: formatDate,
  getAttacksRating: getAttacksRating,
  asyncTimeout: asyncTimeout,
};