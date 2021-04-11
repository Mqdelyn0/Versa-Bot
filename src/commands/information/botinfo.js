const Discord = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    commands: ['botinfo'],
    expected_args: '',
    min_args: 0,
    max_args: 0,
    permissions: [],
    required_roles: [],
    callback(client, message, arguments, raw_text) {
        const ram_used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
        const ram_max = Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100;

        let uptime = (client.uptime / 1000);
        let uptime_days = Math.floor(uptime / 86400);
        uptime %= 86400;
        let uptime_hours = Math.floor(uptime / 3600);
        uptime %= 3600;
        let uptime_minutes = Math.floor(uptime / 60);
        let uptime_seconds = Math.floor(uptime % 60);

        const message_embed = new Discord.MessageEmbed()
            .setAuthor(`Bot Info`, message.member.user.avatarURL())
            .addFields(
                { name: 'Uptime', value: `${uptime_days}d ${uptime_hours}h ${uptime_minutes}m ${uptime_seconds}s`, inline: true },
                { name: 'DJS Version', value: `${Discord.version}`, inline: true },
                { name: 'Ram Usage', value: `${ram_used}MB/${ram_max}MB`, inline: true },
                { name: 'Bot Tag', value: `${client.user.tag}`, inline: true },
                { name: `Developer`, value: '<@758392553610805308>', inline: true },
                { name: 'Ping', value: `${client.ws.ping}ms`, inline: true }
            )
            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
            .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);

        return message.channel.send(message_embed);
    }
}