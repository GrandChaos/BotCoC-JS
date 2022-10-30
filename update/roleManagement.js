const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, clanMembers, reason) => {
  if (!clanMembers) {
    try {
      clanMembers = await clash.getClanMembers(bot.clanTag);
    }
    catch (err) {
      console.log(err);
      return;
    }
  }

  for (const clanMember of clanMembers) {
    let player;
    let member;
    try {
      player = await bot.Players.findById(clanMember.tag);
      member = await clash.getPlayer(clanMember.tag);
    }
    catch (err) {
      console.log(err);
      return;
    }

    if (player == null || player.clan == null) continue;
    if (Date.now() - player.lastVote < 86400000 * 7) continue; // с последнего голосования меньше недели - скип
    if (!member.isMember && !member.isElder) continue; //не мембер и не елдер - скип

    if (reason == 'after war') voteAfterWar(bot, player, member);
    else if (reason == 'daily') voteDaily(bot, player, member);
  }
}

async function voteAfterWar(bot, player, member) {
  let action;
  let reason;

  const attacksRating = generalFunctions.getAttacksRating(player);

  // БЛОК С ПОНИЖЕНИЯМИ И ИЗГНАНИЯМИ
  
  if (attacksRating.countSkippedAttacks / attacksRating.countAttacks > 0.30) { //доля пропущенных атак больше 30%
    if (member.isMember) action = 'Изгнать';
    else if (member.isElder) action = 'Понизить';
    else return;
    reason = `Доля пропущенных атак больше 30% (пропущено ${attacksRating.countSkippedAttacks} из ${attacksRating.countAttacks})\n\
    Данные по атакам:\n${attacksRating.attacksTable}`;

    await publishVote(bot, member, action, reason, 'RED');
    await player.set({ lastVote: new Date() });
    await player.save();
    return;
  }

  if (attacksRating.rating < 200) { //средний рейтинг атак меньше 200
    if (member.isMember) action = 'Изгнать';
    else if (member.isElder) action = 'Понизить';
    else return;
    reason = `Средний рейтинг атак ниже 200\nДанные по атакам:\n${attacksRating.attacksTable}`;

    await publishVote(bot, member, action, reason, 'RED');
    await player.set({ lastVote: new Date() });
    await player.save();
    return;
  }


  // БЛОК С ПОВЫШЕНИЯМИ

  if (!member.isMember) return; //если не мембер - скип
  if (Date.now() - player.date < 86400000 * 30) return; //если меньше месяца в клане - скип

  if (attacksRating.countAttacks > 5 && attacksRating.rating > 800) {//высокий рейтинг атак
    action = 'Повысить';
    reason = `Высокий средний рейтинг атак (${attacksRating.rating})\nДанные по атакам:\n${attacksRating.attacksTable}`;

    await publishVote(bot, member, action, reason, 'GREEN');
    await player.set({ lastVote: new Date() });
    await player.save();
    return;
  }  
}

async function voteDaily(bot, player, member) {
  let action;
  let reason;

  const attacksRating = generalFunctions.getAttacksRating(player);

  // БЛОК С ПОВЫШЕНИЯМИ
  if (!member.isMember) return; //если не мембер - скип
  if (Date.now() - player.date < 86400000 * 30) return; //если меньше месяца в клане - скип

  if (member.league.id == 29000022) { //легендарная лига
    action = 'Повысить';
    reason = 'Легендарная лига';

    await publishVote(bot, member, action, reason, 'GREEN');
    await player.set({ lastVote: new Date() });
    await player.save();
    return;
  }

  if (member.donations > 10000) { //10.000+ доната
    action = 'Повысить';
    reason = `${member.donations} доната войск`;

    await publishVote(bot, member, action, reason, 'GREEN');
    await player.set({ lastVote: new Date() });
    await player.save();
    return;
  }
}


async function publishVote(bot, member, action, reason, color) {
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(`${action} игрока ${member.name}`)
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/1148/1148842.png')
    .setDescription(`${reason}`)
    .setFooter(bot.version)
    .setTimestamp()

  const message = await bot.channels.cache.get(bot.voteChannel).send({ embeds: [embed] });
  message.react('✅');
  message.react('⛔');
  message.startThread({name: `Обсуждение ${action} ${member.name}`, autoArchiveDuration: 1440});
}