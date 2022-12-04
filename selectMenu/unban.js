const generalFunctions = require("../generalFunctions");

module.exports = async (bot, clash, interaction, args) => {
    const channel = '1043444739430690876';

    let player = await bot.Players.findById(args[0].toUpperCase());

    if (player == null) {
        interaction.reply("Игрок не найден");
        return;
    }

    let ban;

    for (ban of player.bans) {
        if (ban._id.toString() == args[1]){
            const user = bot.users.cache.find(user => user.id === args[2])
            if (ban.dateEnd != null) {
                bot.channels.cache.get(channel).send(`${user.toString()} снял блокировку с игрока **${player.nickname}** *(${player._id})* до ${generalFunctions.formatDateFull(ban.dateEnd)} с причиной: "${ban.reason}"`);
            }
            else {
                bot.channels.cache.get(channel).send(`${user.toString()} снял вечную блокировку с игрока **${player.nickname}** *(${player._id})* с причиной: "${ban.reason}"`);
            }

            await ban.set({ dateBegin: null });
            await player.save();
            break;
        }
    }

    if (ban == null) {
        interaction.reply("Блокировка не найдена");
        return;
    }

    interaction.reply(`Блокировка с игрока ${player.nickname} снята`);
};
