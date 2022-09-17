const { MessageEmbed } = require('discord.js')
const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash) => {
  generalFunctions.checkDiscordAPI(bot);
  
  const clanMembers = await clash.getClanMembers(bot.clanTag); //текущие участники

  //ищем новичков
  for (const clanMember of clanMembers) {
    const player = await bot.Players.findById(clanMember.tag);
    const member = await clash.getPlayer(clanMember.tag);

    if (player == null) { //новичок
      const embed = new MessageEmbed()
        .setColor('GREEN')
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
        .setColor('GREEN')
        .setTitle(`Старый знакомый - ${member.name}`)
        .setThumbnail(member.league.icon.url)
        .setDescription(`**Краткая информация**\nУровень ТХ: ${member.townHallLevel}\nТрофеев: ${member.trophies}\nУровень: ${member.expLevel}\n\nПокинул клан: ${generalFunctions.formatDate(player.date)}`)
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

  for (let player of players) { //ищем ливнувших
    /*
    await player.set({ lastVote: 0 });
    await player.save();
    console.log(player.nickname);
    */
    const member = clanMembers.find(m => m.tag === player._id);
    if (member == null && !player.hide) {
      bot.channels.cache.get(bot.logChannel).send(`Игрок ${player.nickname} покинул клан. Был участником с ${generalFunctions.formatDate(player.date)}.`);
      await player.set({ hide: true });
      await player.set({ lastVote: 0 });
      await player.set({ date: new Date() });
      await player.save();
    }
  }
}