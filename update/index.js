const CronJob = require('cron').CronJob

module.exports = async (bot, clash) => {

  const checkApi = new CronJob(
    '*/3 * * * *',
    () => require('./checkApi')(bot, clash),
    null,
    true
  );

  const updateClans = new CronJob(
    '*/5 * * * *',
    () => checkClans(bot, clash),
    null,
    true
  );

  async function checkClans(bot, clash) {
    const clans = await bot.Clans.find();

    for (const clan of clans) {
      require('./updateMembers')(bot, clash, clan, clans);
      require('./updateWar')(bot, clash, clan);
    }
  }
};
