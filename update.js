const { MessageEmbed } = require('discord.js')

module.exports = (bot, clash) => {
  setInterval(updateMembers, 600000, bot, clash) // 600000 = 10 min
  setInterval(updateWar, 600000, bot, clash)
};


async function updateMembers(bot, clash) {
  const clanMembers = await clash.getClanMembers(bot.clanTag); //текущие участники

  //ищем новичков
  for (const clanMember of clanMembers) {
    const player = await bot.Players.findById(clanMember.tag);
    const member = await clash.getPlayer(clanMember.tag);

    if (player == null) { //новичок
      const embed = new MessageEmbed()
        .setColor('DARK_RED')
        .setTitle(`Новичок - ${member.name}`)
        .setThumbnail(member.league.icon.url)
        .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}`)
        .setFooter(bot.version)
        .setTimestamp()

      bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });

      const newPlayer = new bot.Players({
        _id: member.tag,
        nickname: member.name,
      })
      await newPlayer.save();
    }

    else if (player.hide) { //уже был в клане
      const embed = new MessageEmbed()
        .setColor('DARK_RED')
        .setTitle(`Старый знакомый - ${member.name}`)
        .setThumbnail(member.league.icon.url)
        .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\n\nПокинул клан: ${formatDate(player.date)}`)
        .setFooter(bot.version)
        .setTimestamp()

      bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });

      await player.set({ hide: false });
      await player.set({ date: new Date() });
      await player.save();
    }

    else if (member.name != player.nickname && !player.hide) { //смена никнейма
      bot.channels.cache.get(bot.logChannel).send(`${player.nickname} сменил никнейм на ${member.name}`);
      await player.set({ nickname: member.name });
      await player.save();
    }
  }


  players = await bot.Players.find(); //участники в базе

  for (player of players) { //ищем ливнувших
    const member = clanMembers.find(m => m.tag === player._id);
    if (member == null && !player.hide) {
      bot.channels.cache.get(bot.logChannel).send(`Игрок ${player.nickname} покинул клан. Был участником с ${formatDate(player.date)}.`);
      await player.set({ hide: true });
      await player.set({ date: new Date() });
      await player.save();
    }
  }
}



async function updateWar(bot, clash) {
  let curWar;
  let lastWar;
  try {
    curWar = await clash.getCurrentWar(bot.clanTag) //текущая война
    lastWar = await bot.Wars.find().limit(1).sort({ $natural: -1 }) //последний противник
    lastWar = lastWar[0];
    //console.log(lastWar);
    //console.log(curWar);
  }
  catch (err) {
    console.log(err);
    return;
  }

  if (curWar == null || lastWar == null) return;

  if (curWar.state == 'warEnded' && lastWar.done) return; //если война окончена и уже обработано - выходим

  if (curWar.state != 'warEnded' && curWar.opponent.tag == lastWar.opponent) return; //если не завершена, и текущая война уже внесена - выходим

  if (curWar.state != 'warEnded' && curWar.opponent.tag != lastWar.opponent && !curWar.isCWL) {//если не заврешена, и текущая война не внесена - вносим и выходим
    const newWar = new bot.Wars({
      opponent: curWar.opponent.tag
    })
    await newWar.save();

    return;
  }

  if (curWar.state == 'warEnded' && !lastWar.done) { //война окончена, но не обработана    
    await summarizeWar(bot, curWar);
    await saveWarToDB(curWar, lastWar);

    return;
  }

  if (curWar.state == 'inWar' && curWar.isCWL && curWar.opponent.tag != lastWar.opponent) { //если начался следующий раунд ЛВК
    if (!lastWar.done) {
      const prevRound = await clash.getCurrentWar({ clanTag: bot.clanTag, round: 'PREVIOUS_ROUND' }); //берём предыдущий
      await summarizeWar(bot, prevRound); //обрабатыевем
      await saveWarToDB(prevRound, lastWar);
    }
    const newWar = new bot.Wars({ //записываем новый раунд
      opponent: curWar.opponent.tag
    })
    await newWar.save();

    return;
  }
}



async function summarizeWar(bot, war) { // подведение итогов
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

  des += `\nЗавершена: ${formatDate(war.endTime)}`;

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


  const members = await war.clan.members;
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

        await player.attacks.push({ score: score, date: war.endTime });
        await player.save();

        fieldValue += score + '\n';
      }
    }

    let countAttacks = 0;
    if (attacks != null) countAttacks = attacks.length;

    for (var i = countAttacks; i < war.attacksPerMember; i++) { //пропущенные атаки
      await player.attacks.push({ score: 0, date: war.endTime });
      await player.save();

      fieldValue += 0 + '\n';
    }

    countMembers++;
    if (countMembers <= 25) embedMembers_1.addFields({ name: member.name, value: fieldValue, inline: true });
    else embedMembers_2.addFields({ name: member.name, value: fieldValue, inline: true });

  }
  if (countMembers <= 25) {
    embedMembers_1.setTimestamp().setFooter(bot.version);
    bot.channels.cache.get(bot.warChannel).send({ embeds: [embedWar, embedMembers_1] });
    return;
  }
  else {
    embedMembers_2.setTimestamp().setFooter(bot.version);
    bot.channels.cache.get(bot.warChannel).send({ embeds: [embedWar, embedMembers_1, embedMembers_2] });
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

function formatDate(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yyyy = date.getFullYear();

  return dd + '.' + mm + '.' + yyyy;
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