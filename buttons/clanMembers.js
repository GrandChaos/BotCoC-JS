const { MessageEmbed, DiscordAPIError } = require('discord.js');

module.exports = async (bot, clash, interaction, args) => {

    const clan = await clash.getClan(args[1]);

    const members = await clan.fetchMembers();

    if (args[0] == 'byTH') {
        members.sort( (a, b) => b.townHallLevel - a.townHallLevel );
    }
    else if (args[0] == 'byName') {
        members.sort( (a, b) => a.name.localeCompare(b.name) );
    }

    let des = "**Участники клана:**```Трофеи\u00A0|\u00A0\u00A0\u00A0\u00A0Тег\u00A0\u00A0\u00A0\u00A0|\u00A0ТХ\u00A0|\u00A0Никнейм\n";
  
    for (const member of members) {
    
        if (member.trophies >= 1000) des += "\u00A0" + member.trophies + "\u00A0\u00A0|";
        else if (member.trophies >= 100) des += "\u00A0\u00A0" + member.trophies + "\u00A0\u00A0|";
        else if (member.trophies >= 10) des += "\u00A0\u00A0" + member.trophies + "\u00A0\u00A0\u00A0|";
        else des += "\u00A0\u00A0\u00A0" + member.trophies + "\u00A0\u00A0\u00A0|";

        if (member.tag.length == 11) des += member.tag + "|";
        else if (member.tag.length == 10) des += member.tag + "\u00A0|";
        else if (member.tag.length == 9) des += "\u00A0" + member.tag + "\u00A0|";
        else if (member.tag.length == 8) des += "\u00A0" + member.tag + "\u00A0\u00A0|";
        else if (member.tag.length == 7) des += "\u00A0\u00A0" + member.tag + "\u00A0\u00A0|";
        else if (member.tag.length == 6) des += "\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0|";
        else if (member.tag.length == 5) des += "\u00A0\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0|";
        else if (member.tag.length == 4) des += "\u00A0\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0\u00A0|";
        else if (member.tag.length == 3) des += "\u00A0\u00A0\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0\u00A0|";
        else  des += "\u00A0\u00A0\u00A0\u00A0" + member.tag + "\u00A0\u00A0\u00A0\u00A0|";

        if (member.townHallLevel >= 10) des += "\u00A0" + member.townHallLevel + "\u00A0|"
        else des += "\u00A0\u00A0" + member.townHallLevel + "\u00A0|"
        
        des += "\u00A0" + member.name;

        des += "\n";    
    }
    des += "```"


    const embed = new MessageEmbed()
        .setColor('DARK_RED')
        .setTitle(clan.name)
        .setDescription(des)
        .setFooter(bot.version)
        .setTimestamp()

    interaction.reply({ embeds: [embed] });

};

