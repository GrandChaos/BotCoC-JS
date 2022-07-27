const Discord = require('discord.js'),
      fs = require('fs'),
      config = require('./config.json');
config.cfg.intents = new Discord.Intents(config.cfg.intents);


//Запуск бота 
const bot = new Discord.Client(config.cfg);
//console.log(process.env['TOKEN'])
bot.login(process.env['TOKEN'])
  .then(()=>{console.log('Bot is running!\n')})
  .catch((err)=>{console.log(`Bot error: ${err}`)});
bot.version = {text: 'CW Rating Bot, v1.0'};


//Подключение к БД
//https://cloud.mongodb.com/v2/62d300eeb3bf144d48a206bc#clusters
const mongoose = require('mongoose');
const mongo_uri = `mongodb+srv://${process.env['MONGO_USERNAME']}:${process.env['MONGO_PASSWORD']}@botdb.9ekmvd5.mongodb.net/?retryWrites=true&w=majority`;
//console.log(mongo_uri);
mongoose.connect(mongo_uri)
  .then(()=>{console.log('Database connected!\n')})
  .catch((err)=>{console.log(`DB error: ${err}`)});
const Player = mongoose.Schema({
  _id: String,
  nickname: String,
  th: Number,
  attacks: [{date: {type: Date, default: Date.now}, score: Number}],
  date: {type: Date, default: Date.now}
})
const model = mongoose.model('Player', Player, 'Players');
bot.Players = model;


//HTTP cервер
require('./keep_alive.js')


//Cобытия
require('./events')(bot);


//Подгрузка комманд
bot.commands = new Discord.Collection();
bot.commands.any = [];
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  command.names.forEach(el => {
    bot.commands.set(el, command);
  });
  bot.commands.any.push(command);
}
//console.log('\n\nCollection of found commands:\n', bot.commands);