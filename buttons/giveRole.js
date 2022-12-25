const { MessageEmbed } = require('discord.js');

module.exports = async (bot, clash, interaction, args) => {

    let role = interaction.guild.roles.cache.find(role => role.id === args[0]);

    if (!interaction.member.roles.cache.find(role => role.id === args[0])){
        interaction.member.roles.add(role)
        interaction.reply({ content: 'Роль успешно выдана\nМожете удалить данное сообщение', ephemeral: true });
    }
    else {
        interaction.member.roles.remove(role);
        interaction.reply({ content: 'Роль успешно снята\nМожете удалить данное сообщение', ephemeral: true });
    }
};