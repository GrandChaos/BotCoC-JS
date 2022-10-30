const CronJob = require('cron').CronJob

module.exports = (bot, clash) => {

  const updateMembers = new CronJob(
    '*/5 * * * *',
    () => require('./updateMembers')(bot, clash),
    null,
    true
  );

  const updateWar = new CronJob(
    '*/10 * * * *',
    () => require('./updateWar')(bot, clash, bot.clanTag, bot.warChannel, true),
    null,
    true
  );

  const updateWarAcademy = new CronJob(
    '*/10 * * * *',
    () => require('./updateWar')(bot, clash, bot.academyTag, bot.warAcademyChannel, false),
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
