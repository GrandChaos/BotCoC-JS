const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash) => {
  generalFunctions.checkDiscordAPI(bot);

  let clan;
  let academy;
  try {
    clan = await clash.getClan(bot.clanTag); 
    academy = await clash.getClan(bot.academyTag); 
  }
  catch (err) {
    console.log(err);
    return;
  }

  // чек основы
  for (const clanMember of clan.members) {
    let member;
    let player;
    try {
      //console.log(clanMember.tag);
      member = await clash.getPlayer(clanMember.tag);
      player = await bot.Players.findById(clanMember.tag);
    }
    catch (err) {
      console.log(err);
      return;
    }

    if (player == null) { //новичок
      const embed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle(`${bot.stabilityEmoji} Новичок ${member.name} вступил в ${clan.name}`)
        .setThumbnail(member.league.icon.url)
        .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}`)
        .setFooter(bot.version)
        .setTimestamp()

      bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });

      const newPlayer = new bot.Players({
        _id: member.tag,
        nickname: member.name,
        clan: bot.clanTag,
        hide: false,
        th: member.townHallLevel
      })
      await newPlayer.save();
    }

    else if (player.clan == bot.academyTag) { //перешел из академа
      bot.channels.cache.get(bot.logChannel).send(`${bot.stabilityEmoji} Игрок ${player.nickname} перешёл в ${clan.name}`);

      await player.set({ clan: bot.clanTag });
      await player.set({ hide: false });
      await player.save();

      let memberToCheck = [];
      memberToCheck[0] = clanMember;
      require('./roleManagement')(bot, clash, memberToCheck);
    }

    else if (player.clan == null) { //был в клане раньше
      const embed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle(`${bot.stabilityEmoji} Старый знакомый ${member.name} вступил в ${clan.name}`)
        .setThumbnail(member.league.icon.url)
        .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\n\nПокинул клан: ${generalFunctions.formatDate(player.date)}`)
        .setFooter(bot.version)
        .setTimestamp()

      bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });

      await player.set({ clan: bot.clanTag });
      await player.set({ hide: false });
      await player.set({ date: new Date() });
      await player.set({ th: member.townHallLevel });
      await player.save();

      clanMember[0] = clanMember;
      require('./roleManagement')(bot, clash, clanMember);
    }

    else if (member.name != player.nickname && member.clan.tag == bot.clanTag) { //смена никнейма
      bot.channels.cache.get(bot.logChannel).send(`${bot.stabilityEmoji} ${player.nickname} сменил никнейм на ${member.name}`);
      await player.set({ nickname: member.name });
      await player.save();
    }

    else if (member.townHallLevel != player.th && member.clan.tag == bot.clanTag) { //ап тх
      bot.channels.cache.get(bot.logChannel).send(`${bot.stabilityEmoji} ${player.nickname} достиг ${member.townHallLevel} уровня ТХ`);
      await player.set({ th: member.townHallLevel });
      await player.save();
    }
  }

  //чек академа
  for (const clanMember of academy.members) {
    try {
      //console.log(clanMember.tag);
      member = await clash.getPlayer(clanMember.tag);
      player = await bot.Players.findById(clanMember.tag);
    }
    catch (err) {
      console.log(err);
      return;
    }

    if (player == null) { //новичок
      const embed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle(`${bot.academEmoji} Новичок ${member.name} вступил в ${academy.name}`)
        .setThumbnail(member.league.icon.url)
        .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}`)
        .setFooter(bot.version)
        .setTimestamp()

      bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });

      const newPlayer = new bot.Players({
        _id: member.tag,
        nickname: member.name,
        clan: bot.academyTag,
        hide: true,
        th: member.townHallLevel
      })
      await newPlayer.save();
    }

    else if (player.clan == bot.clanTag) { //перешел из основы
      bot.channels.cache.get(bot.logChannel).send(`${bot.academEmoji} Игрок ${player.nickname} перешёл в ${academy.name}`);

      await player.set({ clan: bot.academyTag });
      await player.set({ hide: true });
      await player.save();
    }

    else if (player.clan == null) { //был в клане раньше
      const embed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle(`${bot.academEmoji} Старый знакомый ${member.name} вступил в ${academy.name}`)
        .setThumbnail(member.league.icon.url)
        .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\n\nПокинул клан: ${generalFunctions.formatDate(player.date)}`)
        .setFooter(bot.version)
        .setTimestamp()

      bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });

      await player.set({ clan: bot.academyTag });
      await player.set({ hide: true });
      await player.set({ date: new Date() });
      await player.set({ th: member.townHallLevel });
      await player.save();
    }

    else if (member.name != player.nickname && member.clan.tag == bot.academyTag) { //смена никнейма
      bot.channels.cache.get(bot.logChannel).send(`${bot.academEmoji} ${player.nickname} сменил никнейм на ${member.name}`);
      await player.set({ nickname: member.name });
      await player.save();
    }

    else if (member.townHallLevel != player.th && member.clan.tag == bot.academyTag) { //ап тх
      bot.channels.cache.get(bot.logChannel).send(`${bot.academEmoji} ${player.nickname} достиг ${member.townHallLevel} уровня ТХ`);
      await player.set({ th: member.townHallLevel });
      await player.save();
    }
  }


  const clanPlayers = await bot.Players.find({ clan: bot.clanTag });
  const academyPlayers = await bot.Players.find({ clan: bot.academyTag });

  //чек ливнувших из основы
  for (let player of clanPlayers) {
    const member = clan.members.find(m => m.tag === player._id);
    if (member == null) {
      bot.channels.cache.get(bot.logChannel).send(`${bot.stabilityEmoji} Игрок ${player.nickname} покинул ${clan.name}. Был участником с ${generalFunctions.formatDate(player.date)}`);
      await player.set({ clan: null });
      await player.set({ hide: true });
      await player.set({ lastVote: 0 });
      await player.set({ date: new Date() });
      await player.save();
    }
  }

  //чек ливнувших из академа
  for (let player of academyPlayers) {
    const member = academy.members.find(m => m.tag === player._id);
    if (member == null) {
      bot.channels.cache.get(bot.logChannel).send(`${bot.academEmoji} Игрок ${player.nickname} покинул ${academy.name}. Был участником с ${generalFunctions.formatDate(player.date)}`);
      await player.set({ clan: null });
      await player.set({ hide: true });
      await player.set({ lastVote: 0 });
      await player.set({ date: new Date() });
      await player.save();
    }
  }
}