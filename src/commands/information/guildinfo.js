const Discord = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    commands: ['guildinfo'],
    expected_args: '',
    min_args: 0,
    max_args: 0,
    permissions: [],
    required_roles: [],
    callback(client, message, arguments, raw_text) {
        let guild = client.guilds.cache.get(config.BOT_SETTINGS.GUILD_ID);

        const message_embed = new Discord.MessageEmbed()
            .setAuthor(`Guild Info`, message.member.user.avatarURL())
            .addFields(
                { name: 'Name', value: `${guild.name}`, inline: true },
                { name: 'Owner', value: `${guild.owner}`, inline: true },
                { name: 'Creation', value: `${guild.createdAt.toDateString()}`, inline: true },
                { name: 'All Members', value: `${guild.members.cache.size}`, inline: true },
                { name: 'All Humans', value: `${guild.members.cache.filter(member => !member.user.bot).size}`, inline: true },
                { name: 'All Bots', value: `${guild.members.cache.filter(member => member.user.bot).size}`, inline: true },
                { name: `Text Channels`, value: `${guild.channels.cache.filter(channel => channel.type === 'text').size}`, inline: true },
                { name: `Voice Channels`, value: `${guild.channels.cache.filter(channel => channel.type === 'voice').size}`, inline: true },
                { name: `Roles`, value: `${guild.roles.cache.size}`, inline: true },
            )
            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
            .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);

        return message.channel.send(message_embed);
    }
}