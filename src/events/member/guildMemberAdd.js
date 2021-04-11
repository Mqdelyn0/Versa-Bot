const Discord = require('discord.js');
const config = require('../../../config.json');
const logging = require('../../structure/logging.js');

module.exports = async(client, member) => {
    let channel = client.channels.cache.get(config.CHANNELS.WELCOME_LEAVE);
    let guild = client.guilds.cache.get(config.BOT_SETTINGS.GUILD_ID);
    let count_channel = client.channels.cache.get(config.CHANNELS.MEMBER_COUNT);

    if(count_channel) {
        count_channel.setName(`🔒┃ Members: ${guild.memberCount}`);
    }

    const message_embed = new Discord.MessageEmbed()
        .setTitle(`Join [${guild.memberCount}]`)
        .setThumbnail(member.user.avatarURL())
        .setDescription(`Welcome <@${member.user.id}> to ${guild.name}! Read the rules and have fun!`)
        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
        .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);
    channel.send(message_embed);
    return logging.info(client, `${member.user.tag} joined ${guild.name}! There are ${guild.memberCount} members now.`);
}