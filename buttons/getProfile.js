module.exports = async (bot, clash, interaction, args) => {
    let argsIn = {};
    argsIn.slash = true;
    argsIn.nickname = args[0];

    let argsFIn = {};
    argsFIn.nickname = args[0];
    require('../commands/profile')(bot, clash, interaction, argsIn, argsFIn)
};