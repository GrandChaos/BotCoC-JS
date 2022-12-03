const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, clan) => {

  await generalFunctions.asyncTimeout(Math.floor(Math.random() * 60000));
  
  let clashClan;
  let players;
  const alliance = [bot.stability, bot.academy, bot.junior];

  try {
    clashClan = await clash.getClan(clan.tag);
    players = await bot.Players.find({ clan: clan.tag });
  } catch (err) {
    console.log(err);
    return;
  }

  setTimeout(newPlayers, 60000*0, bot, clash, clan, alliance, players, clashClan);
  setTimeout(leftPlayers, 60000*1, bot, clash, clan, alliance, players, clashClan);
  setTimeout(syncPlayers, 60000*2, bot, clan, players, clashClan);



  async function newPlayers(bot, clash, clan, alliance, players, clashClan ) {
    const notInPlayers = clashClan.members.filter(member => players.every(player => player._id != member.tag));

    for (const clanMember of notInPlayers) {
      await generalFunctions.asyncTimeout(1000);
      let member
      let player;
      try {
        member = await clash.getPlayer(clanMember.tag);
        player = await bot.Players.findById(clanMember.tag);
      } catch (err) {
        console.log('Функция новые игроки');
        console.log(err);
        return;
      }

      if (player == null) { //новичок
        const embed = new MessageEmbed()
          .setColor('GREEN')
          .setAuthor({ name: clashClan.name, iconURL: clan.icon, url: clan.url })
          .setTitle(`Новичок - ${member.name}`)
          .setThumbnail(member.league.icon.url)
          .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}`)
          .setFooter(bot.version)
          .setTimestamp()
  
        bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });
  
        let newPlayer = new bot.Players({
          _id: member.tag,
          nickname: member.name,
          clan: clan.tag,
          th: member.townHallLevel,
          hide: clan.hide,
        })
        await newPlayer.save();
      }

      else if (player.clan == null) { //был в альянсе раньше
        const embed = new MessageEmbed()
          .setColor('GREEN')
          .setAuthor({ name: clashClan.name, iconURL: clan.icon, url: clan.url })
          .setTitle(`Старый знакомый - ${member.name}`)
          .setThumbnail(member.league.icon.url)
          .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\n\nПокинул клан: ${generalFunctions.formatDate(player.date)}`)
          .setFooter(bot.version)
          .setTimestamp()
  
        bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });
        
        await player.set({ clan: clan.tag });
        await player.set({ date: new Date() });
        await player.set({ th: member.townHallLevel });
        await player.set({ hide: clan.hide });
        await player.save();
      }

      else {
        for (const otherClan of alliance) { //переход из других кланов альянса
          if (otherClan.tag == player.clan) {
            let prevClan;
            try {
              prevClan = await clash.getClan( otherClan.tag );
            } catch (err) {
              console.log(err);
              return;
            }
            const embed = new MessageEmbed()
              .setColor('GREEN')
              .setAuthor({ name: clashClan.name, iconURL: clan.icon, url: clan.url })
              .setTitle(`${member.name} перешел из клана ${prevClan.name}`)
              .setThumbnail(member.league.icon.url)
              .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}`)
              .setFooter(bot.version)
              .setTimestamp()
    
            bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });
            
            await player.set({ clan: clan.tag });
            await player.set({ hide: clan.hide })
            await player.save();
          }
        }
      }
    }
    return;
  };


  async function leftPlayers(bot, clash, clan, alliance, players, clashClan) {
    notInMembers = players.filter(player => clashClan.members.every(member => member.tag != player._id));

    for (let player of notInMembers) {
      await generalFunctions.asyncTimeout(1000);
      let member;
      try {
        member = await clash.getPlayer(player._id)
      } catch (err) {
        console.log('Функция ливнувшие игроки');
        console.log(err);
        return;
      }

      if (member.clan != null) {
        let found = false;
        for (const otherClan of alliance) {
          if (otherClan.tag == member.clan.tag) {
            found = true;
            continue;
          }
        }
        if (found) continue;
      }

      const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor({ name: clashClan.name, iconURL: clan.icon, url: clan.url })
        .setTitle(`${member.name} покинул клан`)
        .setThumbnail(member.league.icon.url)
        .setDescription(`Был участником с ${generalFunctions.formatDate(player.date)}`)
        .setFooter(bot.version)
        .setTimestamp()

      bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });

      await player.set({ clan: null });
      await player.set({ hide: true });
      await player.set({ lastVote: 0 });
      await player.set({ date: new Date() });
      await player.save();
    }
    return;
  };


  async function syncPlayers(bot, clan, players, clashClan) {
    for (let player of players) {
      await generalFunctions.asyncTimeout(500);
      let member;
      try {
        member = await clash.getPlayer(player._id);
      } catch (err) {
        console.log('Функция синхронизации');
        console.log(err);
        return;
      }

      if (player.nickname != member.name) {
        const embed = new MessageEmbed()
          .setColor('YELLOW')
          .setAuthor({ name: clashClan.name, iconURL: clan.icon, url: clan.url })
          .setThumbnail(member.league.icon.url)
          .setTitle(`${player.nickname} сменил никнейм на ${member.name}`)
          .setFooter(bot.version)
          .setTimestamp()

        bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });
        
        await player.set({ nickname: member.name })
        await player.save();
      }

      if (player.th != member.townHallLevel) {
        const embed = new MessageEmbed()
          .setColor('GREEN')
          .setAuthor({ name: clashClan.name, iconURL: clan.icon, url: clan.url })
          .setThumbnail(member.league.icon.url)
          .setTitle(`${player.nickname} перешел на ${member.townHallLevel} ТХ`)
          .setFooter(bot.version)
          .setTimestamp()

        bot.channels.cache.get(bot.logChannel).send({ embeds: [embed] });  

        await player.set({ th: member.townHallLevel })
        await player.save();
      }
    }
    return;
  }
}