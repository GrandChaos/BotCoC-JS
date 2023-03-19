const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, clash, player) => {
    let punish = generalFunctions.getPunishments(player);
    const logChannel = '1043444739430690876';
    const alertChannel = '1043848031470092398';

    if (player == null) return;

    const member = await clash.getPlayer(player._id);

    let extraLimits = 0;
    const attacksRating = generalFunctions.getAttacksRating(player, member);
    if (attacksRating.countExtraLimits > 0) extraLimits = 1;

    if (punish.countWarns >= player.warnsLimit+extraLimits && punish.countBans == 0) {
        let dateEnd = new Date();
        dateEnd.setDate(dateEnd.getDate() + 30);

        await player.bans.push({ dateEnd: dateEnd, reason: `${punish.countWarns}/${player.warnsLimit+extraLimits} предупреждений (#ST Ultimate)` });
        await player.save();

        bot.channels.cache.get(logChannel).send(`Автоматически заблокирован игрок **${player.nickname}** *(${player._id})* по причине: "${punish.countWarns}/${player.warnsLimit+extraLimits} предупреждений"`);
        punish = generalFunctions.getPunishments(player);
    }

    if (player.clan == null) return;

    if (punish.countBans > 0 && player.clan != null) {
        const clans = await bot.Clans.find();
        for (const clan of clans) {
            if (clan.tag == player.clan) {
                let role = bot.guilds.cache.get('935908971955494942').roles.cache.find(role => role.id === clan.discordRole);
                if (punish.countWarns > 0){
                    bot.channels.cache.get(alertChannel).send(`${role.toString()}\nЗаблокированный игрок **${player.nickname}** *(${player._id})* в клане\nАктивные блокировки:\n${punish.bansTable}\nПредупреждения:\n${punish.warnsTable}`);
                }
                else bot.channels.cache.get(alertChannel).send(`${role.toString()}\nЗаблокированный игрок **${player.nickname}** *(${player._id})* в клане\nАктивные блокировки:\n${punish.bansTable}`);
                break;
            }
        }
    }
}
