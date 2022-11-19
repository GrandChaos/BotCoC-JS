module.exports = async (bot, clash, interaction) => {
  if (interaction.isCommand()) command(bot, clash, interaction);
  if (interaction.isButton()) button(bot, clash, interaction);
  if (interaction.isSelectMenu()) selectMenu(bot, clash, interaction);
 
  async function command (bot, clash, interaction) {
    const argsF = {}; //Создание аргументов
    argsF.slash = true;
    if(interaction.options._group) argsF.group = interaction.options. _group; //Если это группа - добавить в аргумент
    if(interaction.options._subcommand) argsF.subcommand = interaction.options._subcommand; //Если это sub группа - добавить в аргумент
    for (const it of interaction.options._hoistedOptions) argsF[it.name] = it.value; //Добавить опции в аргументы
    const CMD = await bot.commands.get(interaction.commandName); //Найти команды в боте
    const args = argsF; //Приравнивание функции*
    interaction.author = interaction.user;
    interaction.channel = bot.channels.cache.get(interaction.channelId);
    interaction.guild = interaction.member.guild;
    if(CMD) CMD(bot, clash, interaction, args, argsF) //Если есть команда - вызвать её.*****
    .catch(err => console.error(err));
  }

  async function button (bot, clash, interaction) {
    const args = interaction.customId.split('_');    
    require(`../buttons/${args.shift()}`)(bot, clash, interaction, args);
  }

  async function selectMenu (bot, clash, interaction) {  
    const args = interaction.values[0].split('_');
    require(`../selectMenu/${interaction.customId}`)(bot, clash, interaction, args);
  }
};