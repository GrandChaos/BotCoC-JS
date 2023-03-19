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
            if (warn.date == null) {
                interaction.reply("Предупреждение уже снято");
                return;
            }
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

    let countWarns = generalFunctions.getPunishments(player).countWarns;

    const member = await clash.getPlayer(player._id);
    let extraLimits = 0;
    const attacksRating = generalFunctions.getAttacksRating(player, member);
    if (attacksRating.countExtraLimits > 0) extraLimits = 1;

    interaction.reply(`Предупреждения с игрока ${player.nickname} сняты\nОсталось предупреждений: ${countWarns}\nЛимит предупреждений: ${player.warnsLimit+extraLimits}`);
};
