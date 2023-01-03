require('dotenv').config();
const generalFunctions = require('./generalFunctions.js');

const Discord = require('discord.js'),
  fs = require('fs'),
  config = require('./config.json');
config.cfg.intents = new Discord.Intents(config.cfg.intents);


//Запуск бота 
const bot = new Discord.Client(config.cfg);
bot.login(process.env.TOKEN)
  .then(()=>{console.log('Bot is running!\n')})
  .catch((err)=>{console.log(`Bot error: ${err}`)});
bot.version = {text: '#ST Ultimate Bot, v2.12'};

bot.stability = {
  tag: '#28QCVRVVL',
  warChannel: '1007633975910613022',
  icon: 'https://i.imgur.com/DL6lXEi.png',
  url: 'https://alstability.ru/clubs/1-stability/',
  hide: false,
};

bot.academy = {
  tag: '#2G8YG0PV8',
  warChannel: '1026084888568414238',
  icon: 'https://i.imgur.com/CpWkcT9.png',
  url: 'https://alstability.ru/clubs/4-st-academy/',
  hide: true,
};

bot.junior = {
  tag: '#2LQQR8999',
  warChannel: '1046475189401157652',
  icon: 'https://i.imgur.com/Os3py3e.png',
  url: 'https://alstability.ru/clubs/4-st-academy/',
  hide: true,
};

bot.logChannel = '1005059293592174743';
bot.voteChannel = '1014928743153795104';


//Подключение к БД
const mongoose = require('mongoose');
const mongo_uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@botdb.9ekmvd5.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(mongo_uri)
  .then(()=>{console.log('Database connected!\n')})
  .catch((err)=>{console.log(`DB error: ${err}`)});

const Player = mongoose.Schema({
  _id: String,
  nickname: String,
  clan: String,
  th: Number,
  hide: { type: Boolean, default: true },
  attacks: [{
    date: { type: Date, default: Date.now }, 
    score: { type: Number, default: null }, 
    stars: { type: Number, default: null },
    training: { type: Boolean, default: false },
  }],
  warns: [{ date: { type: Date, default: Date.now }, reason: String, amount: Number }],
  warnsLimit: { type: Number, default: 2 },
  bans: [{ dateBegin: { type: Date, default: Date.now }, dateEnd: Date,  reason: String }],
  lastVote: { type: Date, default: 0 },
  date: { type: Date, default: Date.now },
})
const model = mongoose.model('Player', Player, 'Players');
bot.Players = model;

const War = mongoose.Schema({
  clan: String,
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
clash.login({email: process.env.CLASH_EMAIL, password: process.env.CLASH_PASSWORD});


//HTTP cервер
require('./keep_alive.js')


//Cобытия discord
require('./events')(bot, clash);


//Действия по расписанию
require('./update')(bot, clash);

//чек внешних интеграций
setTimeout(() => require('./update/checkApi')(bot, clash), 10000);


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

//Сообщение с выбором роли для клана
//setTimeout(() => generalFunctions.createChooseClanMessage(bot), 10000);


/*setTimeout((async () => {
  let players = await bot.Players.find();
  for (let player of players){
    player.warnsLimit = 2;
    player.save();
    console.log(player.nickname);
  }
}), 10000);*/