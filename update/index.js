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

  /*
  const updateMembers = new CronJob(
    '*5 * * * *',
    () => require('./updateMembers')(bot, clash, bot.stability),
    null,
    true
  );

  const updateMembersAcademy = new CronJob(
    '*5 * * * *',
    () => require('./updateMembers')(bot, clash, bot.academy),
    null,
    true
  );

  const updateMembersJunior = new CronJob(
    '*5 * * * *',
    () => require('./updateMembers')(bot, clash, bot.junior),
    null,
    true
  );

  const updateWar = new CronJob(
    '*10 * * * *',
    () => require('./updateWar')(bot, clash, bot.stability.tag, bot.stability.warChannel, true),
    null,
    true
  );

  const updateWarAcademy = new CronJob(
    '*10 * * * *',
    () => require('./updateWar')(bot, clash, bot.academy.tag, bot.academy.warChannel, false),
    null,
    true
  );

  const updateWarJunior = new CronJob(
    '*10 * * * *',
    () => require('./updateWar')(bot, clash, bot.junior.tag, bot.junior.warChannel, false),
    null,
    true
  );

  const roleManagement = new CronJob(
    '30 6 * * *',
    () => require('./roleManagement')(bot, clash, null, 'daily'),
    null,
    true
  );*/

};
