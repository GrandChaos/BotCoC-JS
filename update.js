const { MessageEmbed } = require('discord.js')

module.exports = (bot, clash) => {
  setInterval(updateMembers, 600000, bot, clash) // 600000 = 10 min
  setInterval(updateWar, 600000, bot, clash)
};


async function updateMembers(bot, clash) {
  const clanMembers = await clash.getClanMembers(bot.clanTag); //текущие участники

  //ищем новичков
  for (const member of clanMembers) {
    const player = await bot.Players.findById(member.tag);

    if (player == null) { //новичок
      bot.channels.cache.get(bot.defaultChannel).send(`Приветствуем новичка ${member.name} в нашем клане! Добро пожаловать!`);
      const newPlayer = new bot.Players({
        _id: member.tag,
        nickname: member.name,
      })
      await newPlayer.save();
    }

    else if (player.hide) { //уже был в клане
      bot.channels.cache.get(bot.defaultChannel).send(`Старый знакомый ${member.name} вновь в нашем клане! Покинул клан ${formatDate(player.date)}. Интересно, что привело его вновь?`);
      await player.set({ hide: false });
      await player.set({ date: new Date()});
      await player.save();
    }

    else if (member.name != player.nickname) { //смена никнейма
      bot.channels.cache.get(bot.defaultChannel).send(`${player.nickname} сменил никнейм на ${member.name}`);
      await player.set({ nickname: member.name });
      await player.save();
    }
  }


  players = await bot.Players.find(); //участники в базе

  for (player of players) { //ищем ливнувших
    const member = clanMembers.find(m => m.tag === player._id);
    if (member == null && !player.hide) {
      bot.channels.cache.get(bot.defaultChannel).send(`Игрок ${player.nickname} покинул клан. Был участником клана с ${formatDate(player.date)}.`);
      await player.set({ hide: true });
      await player.set({ date: new Date()});
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
  }
  catch (err) {
    console.log(err);
    return;
  }

  if (curWar == null || lastWar == null) return; //если войны нет - выходим

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
    await summarize(bot, curWar);

    await lastWar.set({ done: true }) //сохраняем, что обработан
    await lastWar.save();

    return;
  }

  if (curWar.state == 'inWar' && curWar.isCWL && curWar.opponent.tag != lastWar.opponent) { //если начался следующий раунд ЛВК
    const prevRound = await clash.getCurrentWar({ clanTag: bot.clanTag, round: 'PREVIOUS_ROUND' }); //берём предыдущий
    await summarize(bot, prevRound); //обрабатыевем

    await lastWar.set({ done: true }) //сохраняем, что обработан
    await lastWar.save();

    const newWar = new bot.Wars({ //записываем новый раунд
      opponent: curWar.opponent.tag
    })
    await newWar.save();

    return;
  }
}





async function summarize(bot, war) { // подведение итогов
  if (war.state != 'warEnded') return; //не закончена - вышли

  let des;
  if (war.clan.stars > war.opponent.stars) des = '**Победа**';
  else if (war.clan.stars < war.opponent.stars) des = '**Поражение**';
  else if (war.clan.destruction > war.opponent.destruction) des = '**Победа**';
  else if (war.clan.destruction < war.opponent.destruction) des = '**Поражение**';
  else des = '**Ничья**';


  const embedWar = new MessageEmbed() //итоги по войне
    .setColor('DARK_RED')
    .setTitle('Итоги войны')
    .setDescription(des)
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/6695/6695008.png')
    .addFields(
      { name: war.clan.name, value: `Звёзды: ${war.clan.stars}\nРазрушение: ${war.clan.destruction.toFixed(2)}%\nАтак использовано: ${war.clan.attackCount}`, inline: true },
      { name: war.opponent.name, value: `Звёзды: ${war.opponent.stars}\nРазрушение: ${war.opponent.destruction.toFixed(2)}%\nАтак использовано: ${war.clan.attackCount}`, inline: true },
    )


  let embedMembers_1 = new MessageEmbed() //итоги по атакам 1-25
    .setColor('DARK_RED')
    .setTitle('Результаты участников войны')
    .setDescription('=======================================================')


  let embedMembers_2 = new MessageEmbed() //итоги по атакам 25-50
    .setColor('DARK_RED')
    .setDescription('=======================================================')


  const members = await war.clan.members;
  let countMembers = 0;

  for (const member of members) {
    //console.log(member);

    if (member == null) continue;

    const player = await bot.Players.findById(member.tag);

    if (player == null) {
      //console.log(member);
      //console.log("ИГРОКА НЕТ В БАЗЕ!!!!!");
      continue;
    }

    let fieldValue = '';

    const th = member.townHallLevel;
    const pos = member.mapPosition;
    const attacks = member.attacks;

    //console.log(attacks);

    if (attacks != null) {
      for (const attack of attacks) { //атаки
        //console.log(attack);

        const defender = await attack.defender;

        //console.log(defender);

        const opTh = defender.townHallLevel;
        const opPos = defender.mapPosition;

        let rate = (attack.stars * 300 + attack.destruction) / 1000; //коэффициент разрушения
        
        let difficult = 1000 + (opTh - th) * 200; //сложность атаки
        if (opPos - pos > 5) difficult -= 250; //вычитаем не более 250 очков за атаку ниже
        else difficult -= (opPos - pos) * 50;
        
        if (rate < 0.1) rate = 0.1;
        if (difficult < 100) difficult = 100;

        const score = Math.trunc(rate * difficult);

        await player.attacks.push({ score: score });
        await player.save();

        fieldValue += score + '\n';
      }
    }

    let countAttacks = 0;
    if (attacks != null) countAttacks = attacks.length;

    for (var i = countAttacks; i < war.attacksPerMember; i++) { //пропущенные атаки
      await player.attacks.push({ score: 0 });
      await player.save();

      fieldValue += 0 + '\n';
    }

    countMembers++;
    if (countMembers <= 25) embedMembers_1.addFields({ name: member.name, value: fieldValue, inline: true });
    else embedMembers_2.addFields({ name: member.name, value: fieldValue, inline: true });

  }
  if (countMembers <= 25) {
    embedMembers_1.setTimestamp().setFooter(bot.version);
    bot.channels.cache.get(bot.defaultChannel).send({ embeds: [embedWar, embedMembers_1] });
  }
  else {
    embedMembers_2.setTimestamp().setFooter(bot.version);
    bot.channels.cache.get(bot.defaultChannel).send({ embeds: [embedWar, embedMembers_1, embedMembers_2] });
  }
}

function formatDate(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yyyy = date.getFullYear();

  return dd + '.' + mm + '.' + yyyy;
}