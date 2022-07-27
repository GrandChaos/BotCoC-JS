const {MessageEmbed} = require('discord.js')

module.exports = async (bot, message, args, argsF) => {
  let player;
  
  if (argsF.nickname[0] == '#'){
    player = await bot.Players.findById(args.nickname.toUpperCase());
  }
  else {
    player = await bot.Players.find({nickname: argsF.nickname});
    if (player.length > 1) {
      message.reply("Найдено несколько игроков, используйте #тег!");
      return;
    }
    player = player[0];
  }

  if (player != null) {
    
    let fields = [
      {name: 'Очки', value:'', inline: true},
      {name: 'Дата', value:'', inline: true},
    ]
    
    let rating = 0;
    let countAttacks = 0;
    
    player.attacks.forEach((attack) => {
      if (Date.now() - attack.date > 86400000 * 60) return;
      rating += attack.score;
      countAttacks++;
      fields[0].value += attack.score + '\n';
      fields[1].value += formatDate(attack.date) + '\n';
    })
    
    rating /= countAttacks;
      
    let color = 'RED';
    if (rating >= 1000) color = 'PURPLE';
    else if (rating >= 800) color = 'BLUE';
    else if (rating >= 600) color = 'GREEN';
    else if (rating >= 400) color = 'YELLOW';
    else if (rating >= 200) color = 'ORANGE';
    
    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(`Рейтинг игрока ${player.nickname}`)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/6695/6695008.png')
      //.setAuthor({name: 'Рейтинг эффективности на КВ и ЛВК', iconURL: 'https://cdn-icons-png.flaticon.com/512/6695/6695008.png'})
      .setDescription(`Уровень ТХ: ${player.th}\nВсего атак: ${countAttacks}`)
      .setFooter(bot.version)
      .setTimestamp()

    if (countAttacks > 0) { embed
      .setDescription(`Уровень ТХ: ${player.th}\nСредний показатель: ${rating}\nВсего атак: ${countAttacks}\nДанные по атакам:`)
      .addFields(fields)     
    }
    
    message.reply({embeds:[embed]});
  }
    
  else {
    message.reply("Игрок не найден!");
    return;
  }
};

module.exports.names = ["info"]
module.exports.interaction = {
  name: 'info',
  description: 'Получить информацию о показателях игрока',
  options: [
    {
      name: "nickname",
      description: "Никнейм (или #тег) игрока в игре",
      type: "STRING",
      required: true
    },
  ],
  defaultPermission: true
};

function formatDate(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yyyy = date.getFullYear();

  return dd + '.' + mm + '.' + yyyy;
}