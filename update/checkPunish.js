const generalFunctions = require('../generalFunctions.js')

module.exports = async (bot, player) => {
    let punish = generalFunctions.getPunishments(player);
    const logChannel = '1043444739430690876';
    const alertChannel = '1043848031470092398';

    if (punish.countWarns >= player.warnsLimit && punish.countBans == 0) {
        let dateEnd = new Date();
        dateEnd.setDate(dateEnd.getDate() + 30);

        await player.bans.push({ dateEnd: dateEnd, reason: `${punish.countWarns}/${player.warnsLimit} предупреждений (#ST Ultimate)` });
        await player.save();

        bot.channels.cache.get(logChannel).send(`Автоматически заблокирован игрок **${player.nickname}** *(${player._id})* по причине: "${punish.countWarns}/${player.warnsLimit} предупреждений"`);
        punish = generalFunctions.getPunishments(player);
    }

    if (player == null || player.clan == null) return;

    if (punish.countBans > 0 && player.clan != null) {
        const clans = await bot.Clans.find();
        for (const clan of clans) {
            if (clan.tag == player.clan) {
                let role = bot.guilds.cache.get('935908971955494942').roles.cache.find(role => role.id === clan.role);
                bot.channels.cache.get(alertChannel).send(`${role.toString()}\nЗаблокированный игрок **${player.nickname}** *(${player._id})* в клане\nАктивные блокировки:\n${punish.bansTable}`);
                break;
            }
        }
    }
}
