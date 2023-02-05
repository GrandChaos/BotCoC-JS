const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, player, amount, reason, author) => {
    const channel = '1043444739430690876';

    if (amount <= 0) {
        console.warn('giveWarn() - неверный параметр amount');
        return;
    }

    await player.warns.push({ amount: amount, reason: `${reason} (${author})` });
    await player.save();
  
    bot.channels.cache.get(channel).send(`Автоматически выдано ${amount} предупреждений игроку **${player.nickname}** *(${player._id})* по причине: "${reason}"`);

    require('./checkPunish')(bot, player);
}