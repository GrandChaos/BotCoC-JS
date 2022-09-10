const Discord = require('discord.js'),
      fs = require('fs'),
      config = require('./config.json');
config.cfg.intents = new Discord.Intents(config.cfg.intents);


//Запуск бота 
const bot = new Discord.Client(config.cfg);
bot.login(config.token)
  .then(()=>{console.log('Bot is running!\n')})
  .catch((err)=>{console.log(`Bot error: ${err}`)});
bot.version = {text: 'CW Rating Bot, v2.2'};
bot.warChannel = '1007633975910613022';
bot.logChannel = '1005059293592174743';
bot.voteChannel = '1014928743153795104';
bot.clanTag = '#28QCVRVVL';


//Подключение к БД
const mongoose = require('mongoose');
const mongo_uri = `mongodb+srv://${config.mongo_username}:${config.mongo_password}@botdb.9ekmvd5.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(mongo_uri)
  .then(()=>{console.log('Database connected!\n')})
  .catch((err)=>{console.log(`DB error: ${err}`)});

const Player = mongoose.Schema({
  _id: String,
  nickname: String,
  hide: {type: Boolean, default: false},
  attacks: [{date: {type: Date, default: Date.now}, score: Number}],
  warns: [{date: {type: Date, default: Date.now}, reason: String, value: Number}],
  lastVote: {type: Date, default: 0},
  date: {type: Date, default: Date.now}
})
const model = mongoose.model('Player', Player, 'Players');
bot.Players = model;

const War = mongoose.Schema({
  opponent: String,
  done: {type: Boolean, default: false},
  date: Date,
  stars: Number,
  destruction: Number,
  attackCount: Number,
  opponentStars: Number,
  opponentDestruction: Number,
  opponentAttackCount: Number,
  isCWL: Boolean,
})
const model_1 = mongoose.model('War', War, 'Wars');
bot.Wars = model_1;


//Api клеша
const { Client } = require('clashofclans.js');
const clash = new Client();
clash.login({email: config.clash_email, password: config.clash_password});


//HTTP cервер
//require('./keep_alive.js')


//Cобытия discord
require('./events')(bot, clash);


//Действия по расписанию
require('./update')(bot, clash);


//Подгрузка комманд discord
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
