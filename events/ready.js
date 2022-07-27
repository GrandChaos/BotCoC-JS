module.exports = async (bot) => {
  console.log('\n', Date(), '\n')
  console.log(bot.user.username, '#', bot.user.discriminator, '\n')

  const commandsIT = bot.guilds.cache.get("961280288057593877").commands; //Или bot.application.commands - если команды будут глобальными
  await commandsIT.fetch(); //Найти все команды

  for (const command of bot.commands.any) {
    if(command.interaction) { //Если слэш команда есть
      const interaction = await commandsIT.cache.find(com=>com.name == command.interaction.name); //Найти команду в боте по названию
      if(!interaction) { //Если команда не была найдена в боте
        commandsIT.create(command.interaction); //Создать команду
      } else  //Если команда есть
      if(JSON.stringify(interaction.options) !== JSON.stringify(command.interaction.options)) {//И параметры команды не совпадают (т.е. команда была изменена)
        interaction.edit(command.interaction); //Редактируем эту команду
      }
    }
  }
};