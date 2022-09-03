function formatDate(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yyyy = date.getFullYear();

  return dd + '.' + mm + '.' + yyyy;
}


function getAttacksRating(player) {
  let attacksTable = "```Очки | Дата\n"
  let rating = 0;
  let countAttacks = 0;
  let countSkippedAttacks = 0;

  for (const attack of player.attacks) {
    if (Date.now() - attack.date > 86400000 * 60) continue;
    rating += attack.score;
    countAttacks++;
    if (attack.score == 0) countSkippedAttacks++;

    if (attack.score >= 1000) attacksTable += attack.score + " | ";
    else if (attack.score >= 100) attacksTable += "\u00A0" + attack.score + " | ";
    else if (attack.score >= 10) attacksTable += "\u00A0" + attack.score + "\u00A0 | ";
    else attacksTable += "\u00A0\u00A0" + attack.score + "\u00A0 | ";

    attacksTable += formatDate(attack.date) + "\n";
  }
  attacksTable += "```";

  rating = Math.trunc(rating / countAttacks);

  return {
    rating: rating,
    countAttacks: countAttacks,
    countSkippedAttacks: countSkippedAttacks,
    attacksTable: attacksTable
  }
}




module.exports = {
  formatDate: formatDate,
  getAttacksRating: getAttacksRating
};