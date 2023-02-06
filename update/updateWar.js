const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, /*clanTag, channel, toRecord*/ clan) => {

  const clanTag = clan.tag;
  const channel = clan.warChannel;

  await generalFunctions.asyncTimeout(Math.floor(Math.random() * 60000));

  await updateWar(bot, clash, clanTag, channel, /*toRecord*/);
  
  async function updateWar(bot, clash, clanTag, channel, /*toRecord*/) {
    let curWar;
    let lastWar;
    try {
      curWar = await clash.getCurrentWar(clanTag) //текущая война
      lastWar = await bot.Wars.find({ clan: clanTag }).limit(1).sort({ $natural: -1 }) //последний противник
      lastWar = lastWar[0];
      //console.log(curWar);
    }
    catch (err) {
      //console.log(err);
      return;
    }
  
    if (curWar == null || lastWar == null) return;
    
    if (curWar.state == 'warEnded' && lastWar.done) return; //если война окончена и уже обработано - выходим
  
    if (curWar.state != 'warEnded' && curWar.opponent.tag == lastWar.opponent) return; //если не завершена, и текущая война уже внесена - выходим
  
    if (curWar.state != 'warEnded' && curWar.opponent.tag != lastWar.opponent && !curWar.isCWL) {//если не заврешена, и текущая война не внесена - вносим и выходим
      const newWar = new bot.Wars({
        clan: clanTag,
        opponent: curWar.opponent.tag
      })
      await newWar.save();
  
      return;
    }
  
    if (curWar.state == 'warEnded' && !lastWar.done) { //война окончена, но не обработана    
      await summarizeWar(bot, curWar, channel, /*toRecord*/);
      await saveWarToDB(curWar, lastWar);
      //if (toRecord) require('./roleManagement')(bot, clash, curWar.clan.members, 'after war');
      return;
    }
  
    if (curWar.state == 'inWar' && curWar.isCWL && curWar.opponent.tag != lastWar.opponent) { //если начался следующий раунд ЛВК
      if (!lastWar.done) {
        const prevRound = await clash.getCurrentWar({ clanTag: clanTag, round: 'PREVIOUS_ROUND' }); //берём предыдущий
        await summarizeWar(bot, prevRound, channel, /*toRecord*/); //обрабатыевем
        await saveWarToDB(prevRound, lastWar);
        //if (toRecord) require('./roleManagement')(bot, clash, curWar.clan.members, 'after war');
      }
      const newWar = new bot.Wars({ //записываем новый раунд
        clan: clanTag,
        opponent: curWar.opponent.tag
      })
      await newWar.save();
  
      return;
    }
  }
  
  async function summarizeWar(bot, war, channel, /*toRecord*/) { // подведение итогов
    if (war.state != 'warEnded') return; //не закончена - вышли
  
    let des;
    let color = 'GRAY';
    if (war.clan.stars > war.opponent.stars) {
      des = '**Победа**';
      color = 'GREEN'
    }
    else if (war.clan.stars < war.opponent.stars) {
      des = '**Поражение**';
      color = 'RED'
    }
    else if (war.clan.destruction.toFixed(2) > war.opponent.destruction.toFixed(2)) {
      des = '**Победа**';
      color = 'GREEN'
    }
    else if (war.clan.destruction.toFixed(2) < war.opponent.destruction.toFixed(2)) {
      des = '**Поражение**';
      color = 'RED'
    }
    else des = '**Ничья**';
  
    des += `\nЗавершена: ${generalFunctions.formatDateFull(war.endTime)}`;
  
    const embedWar = new MessageEmbed() //итоги по войне
      .setColor(color)
      .setTitle('Итоги войны')
      .setDescription(des)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/6695/6695008.png')
      .addFields(
        { name: war.clan.name, value: `Звёзды: ${war.clan.stars}\nРазрушение: ${war.clan.destruction.toFixed(2)}%\nАтак использовано: ${war.clan.attackCount}`, inline: true },
        { name: war.opponent.name, value: `Звёзды: ${war.opponent.stars}\nРазрушение: ${war.opponent.destruction.toFixed(2)}%\nАтак использовано: ${war.opponent.attackCount}`, inline: true },
      )
  
  
    let embedMembers_1 = new MessageEmbed() //итоги по атакам 1-25
      .setColor(color)
      .setTitle('Результаты участников войны')
      .setDescription('=======================================================')
  
  
    let embedMembers_2 = new MessageEmbed() //итоги по атакам 25-50
      .setColor(color)
      .setDescription('=======================================================')
  

    let minThNotDistr = 99999;
    for (const opponentMember of war.opponent.members) {
      if (minThNotDistr > opponentMember.townHallLevel) {
        minThNotDistr = opponentMember.townHallLevel;
      }
    }


    const members = war.clan.members;
    members.sort((a, b) => a.mapPosition - b.mapPosition);

    let countMembers = 0;
  
    for (const member of members) {
      if (member == null) continue;
  
      const player = await bot.Players.findById(member.tag);
  
      if (player == null) {
        continue;
      }
  
      let fieldValue = '';
  
      const attacks = member.attacks;
  
      if (attacks != null) {
        for (const attack of attacks) { //атаки
  
          const score = calculateAttackScore(attack);
  
          /*if (toRecord) {
            await player.attacks.push({ score: score, stars: attack.stars, date: war.endTime, training: false });
            await player.save();
          }
          else {*/
            await player.attacks.push({ score: score, stars: attack.stars, date: war.endTime/*, training: true */});
            await player.save();
          //}
  
          fieldValue += `${score} (${attack.stars} зв.)` + '\n';
        }
      }
  
      let countAttacks = 0;
      if (attacks != null) countAttacks = attacks.length;
  
      for (var i = countAttacks; i < war.attacksPerMember; i++) { //пропущенные атаки

        /*if (toRecord) {
          await player.attacks.push({ score: 0, stars: 0, date: war.endTime, training: false });
          await player.set({ lastVote: 0 });
          await player.save();
        }
        else {
          await player.attacks.push({ score: 0, stars: 0, date: war.endTime, training: true});
          await player.save();
        }*/

        if (member.townHallLevel >= minThNotDistr || attacks == null) {
          await player.attacks.push({ score: 0, stars: 0, date: war.endTime});
          await player.save();
        }
        else { //на случай если некого бить - атака не пропущена, но очки минимальные
          await player.attacks.push({ score: 1, stars: 0, date: war.endTime});
          await player.save();
        }
  
        fieldValue += "0 (0 зв.)" + '\n';
      }




      const attacksRating = generalFunctions.getAttacksRating(player);
      let warnReason = null;

      if (attacks == null) warnReason = 'Пропуск атак';
      else if (attacksRating.countSkippedAttacks / attacksRating.countAttacks > 0.30 && attacksRating.countAttacks >= 3) warnReason = '30%+ пропусков атак';

      let playerClan = await bot.Clans.find({ tag: war.clan.tag });
      playerClan = playerClan[0];
  
      if (playerClan.autoWarns && warnReason != null) {
        require('./giveWarn')(bot, player, 1, warnReason, '#ST Ultimate' );
      }



      countMembers++;
      if (countMembers <= 25) embedMembers_1.addFields({ name: `${countMembers}. ${member.name}`, value: fieldValue, inline: true });
      else embedMembers_2.addFields({ name: `${countMembers}. ${member.name}`, value: fieldValue, inline: true });
  
    }
    if (countMembers <= 25) {
      embedMembers_1.setTimestamp().setFooter(bot.version);
      bot.channels.cache.get(channel).send({ embeds: [embedWar, embedMembers_1] });
      return;
    }
    else {
      embedMembers_2.setTimestamp().setFooter(bot.version);
      bot.channels.cache.get(channel).send({ embeds: [embedWar, embedMembers_1, embedMembers_2] });
      return;
    }
  }
  
  async function saveWarToDB(war, warDB) {
    await warDB.set({ done: true });
    await warDB.set({ date: war.endTime });
    await warDB.set({ stars: war.clan.stars });
    await warDB.set({ destruction: war.clan.destruction.toFixed(2) });
    await warDB.set({ attackCount: war.clan.attackCount });
    await warDB.set({ opponentStars: war.opponent.stars });
    await warDB.set({ opponentDestruction: war.opponent.destruction.toFixed(2) });
    await warDB.set({ opponentAttackCount: war.opponent.attackCount });
    await warDB.set({ isCWL: war.isCWL });
  
    await warDB.save();
  }
  
  function calculateAttackScore(attack) {
    const member = attack.attacker;
    const memberTh = member.townHallLevel;
    const memberPos = member.mapPosition;
    
    const opponent = attack.defender;
    const opponentTh = opponent.townHallLevel;
    const opponentPos = opponent.mapPosition;
  
    let rate =  900 + attack.destruction; //коэффициент разрушения
    if (attack.stars == 2) rate -= 200;
    else if (attack.stars == 1) rate -= 600;
    else if (attack.stars == 0) rate -= 900;
    rate /= 1000;
  
    let difficult = 1000 + (opponentTh - memberTh) * 200; //сложность атаки, по уровням ратуши
    
    const insensitivity = 2; //кол-во невоспринмаемых позиций
    const posCost = 50; //цена позиции
    const maxPenaltyPos = 4; //максимально позиций для штрафа
    let posDiff = opponentPos - memberPos; //разность позиций
  
    if (Math.abs(posDiff) < insensitivity) { //если разница позиций меньше пороговой - обнуляем
      posDiff = 0;
    }
    else if (posDiff > 0) { //если положительная - вычитаем пороговое
      posDiff -= insensitivity;
    }
    else posDiff += insensitivity; //если отрицательная - прибавляем пороговое
    
    if (posDiff > maxPenaltyPos) difficult -= maxPenaltyPos * posCost; //вычитаем не более максимума за атаку вниз
    else difficult -= posDiff * posCost; //вычитаем 
  
    if (rate < 0.1) rate = 0.1; //минимальные
    if (difficult < 100) difficult = 100;
  
    return Math.trunc(rate * difficult);
  }
}
