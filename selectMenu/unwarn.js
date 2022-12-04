const generalFunctions = require("../generalFunctions");

module.exports = async (bot, clash, interaction, args) => {
    const channel = '1043444739430690876';

    let player = await bot.Players.findById(args[0].toUpperCase());

    if (player == null) {
        interaction.reply("Игрок не найден");
        return;
    }

    let warn;

    for (warn of player.warns) {
        if (warn._id.toString() == args[1]){
            const user = bot.users.cache.find(user => user.id === args[2])
            bot.channels.cache.get(channel).send(`${user.toString()} снял предупреждения с игрока **${player.nickname}** *(${player._id})* от ${generalFunctions.formatDate(warn.date)} с причиной: "${warn.reason}"`);
            
            await warn.set({ date: null });
            await player.save();
            break;
        }
    }

    if (warn == null) {
        interaction.reply("Предупреждение не найдено");
        return;
    }

    interaction.reply(`Предупреждения с игрока ${player.nickname} сняты`);
};
