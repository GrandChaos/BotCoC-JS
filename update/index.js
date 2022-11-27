const CronJob = require('cron').CronJob

module.exports = (bot, clash) => {

  const checkApi = new CronJob(
    '* * * * *',
    () => require('./checkApi')(bot),
    null,
    true
  );

  const updateMembers = new CronJob(
    '* * * * *',
    () => require('./updateMembers')(bot, clash, bot.stability),
    null,
    true
  );

  const updateMembersAcademy = new CronJob(
    '* * * * *',
    () => require('./updateMembers')(bot, clash, bot.academy),
    null,
    true
  );

  const updateMembersJunior = new CronJob(
    '* * * * *',
    () => require('./updateMembers')(bot, clash, bot.junior),
    null,
    true
  );

  const updateWar = new CronJob(
    '*/10 * * * *',
    () => require('./updateWar')(bot, clash, bot.stability.tag, bot.stability.warChannel, true),
    null,
    true
  );

  const updateWarAcademy = new CronJob(
    '*/10 * * * *',
    () => require('./updateWar')(bot, clash, bot.academy.tag, bot.academy.warChannel, false),
    null,
    true
  );

  const roleManagement = new CronJob(
    '30 6 * * *',
    () => require('./roleManagement')(bot, clash, null, 'daily'),
    null,
    true
  );

};
