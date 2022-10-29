const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, clanMembers) => {
  if (!clanMembers) clanMembers = await clash.getClanMembers(bot.clanTag);

  for (const clanMember of clanMembers) {
    const player = await bot.Players.findById(clanMember.tag);
    const member = await clash.getPlayer(clanMember.tag);

    if (player == null) continue;
    if (Date.now() - player.lastVote < 86400000 * 7) continue; // с последнего голосования меньше недели - скип
    if (!member.isMember && !member.isElder) continue; //не мембер и не елдер - скип

    let action;
    let reason;

    const attacksRating = generalFunctions.getAttacksRating(player);

    
    // БЛОК С ПОНИЖЕНИЯМИ И ИЗГНАНИЯМИ
    
    if (attacksRating.countSkippedAttacks / attacksRating.countAttacks > 0.30) { //доля пропущенных атак больше 30%
      if (member.isMember) action = 'Изгнать';
      else if (member.isElder) action = 'Понизить';
      else continue;
      reason = `Доля пропущенных атак больше 30% (пропущено ${attacksRating.countSkippedAttacks} из ${attacksRating.countAttacks})\nДанные по атакам:\n${attacksRating.attacksTable}`;

      await publishVote(bot, member, action, reason, 'RED');
      await player.set({ lastVote: new Date() });
      await player.save();
      continue;
    }

    if (attacksRating.rating < 200) { //средний рейтинг атак меньше 200
      if (member.isMember) action = 'Изгнать';
      else if (member.isElder) action = 'Понизить';
      else continue;
      reason = `Средний рейтинг атак ниже 200\nДанные по атакам:\n${attacksRating.attacksTable}`;

      await publishVote(bot, member, action, reason, 'RED');
      await player.set({ lastVote: new Date() });
      await player.save();
      continue;
    }


    // БЛОК С ПОВЫШЕНИЯМИ

    if (!member.isMember) continue; //если не мембер - скип
    if (Date.now() - player.date < 86400000 * 30) continue; //если меньше месяца в клане - скип

    if (member.league.id == 29000022) { //легендарная лига
      action = 'Повысить';
      reason = 'Легендарная лига';

      await publishVote(bot, member, action, reason, 'GREEN');
      await player.set({ lastVote: new Date() });
      await player.save();
      continue;
    }

    if (member.donations > 15000) { //15.000+ доната
      action = 'Повысить';
      reason = `${member.donations} доната войск`;

      await publishVote(bot, member, action, reason, 'GREEN');
      await player.set({ lastVote: new Date() });
      await player.save();
      continue;
    }

    if (attacksRating.countAttacks > 5 && attacksRating.rating > 800) {//высокий рейтинг атак
      action = 'Повысить';
      reason = `Высокий средний рейтинг атак (${attacksRating.rating})\nДанные по атакам:\n${attacksRating.attacksTable}`;

      await publishVote(bot, member, action, reason, 'GREEN');
      await player.set({ lastVote: new Date() });
      await player.save();
      continue;
    }  
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