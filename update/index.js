const CronJob = require('cron').CronJob

module.exports = (bot, clash) => {

  const updateMembers = new CronJob(
    '*/10 * * * *',
    () => require('./updateMembers')(bot, clash),
    null,
    true
  );

  const updateWar = new CronJob(
    '*/10 * * * *',
    () => require('./updateWar')(bot, clash),
    null,
    true
  );
};
