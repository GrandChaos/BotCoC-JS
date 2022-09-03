const CronJob = require('cron').CronJob

module.exports = (bot, clash) => {

  const updateMembers = new CronJob(
    '*/10 * * * *',
    () => require('./updateMembers')(bot, clash),
    null,
    true
  );

/*  const updateWar = new CronJob(
    '* * * * *',
    () => require('./updateWar')(bot, clash),
    null,
    true
  );*/

  const roleManagement = new CronJob(
    '30 6 * * *',
    () => require('./roleManagement')(bot, clash),
    null,
    true
  );

};
