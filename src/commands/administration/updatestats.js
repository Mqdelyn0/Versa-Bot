const Discord = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    commands: ['updatestats', 'ustats', 'us'],
    expected_args: '',
    min_args: 0,
    max_args: 0,
    permissions: [],
    required_roles: ["Owner", "Manager", "Developer", "Admin", "S. Mod"],
    async callback(client, message, arguments, raw_text) {
        const guild = client.guilds.cache.get(config.BOT_SETTINGS.GUILD_ID);
        const channel = client.channels.cache.get(config.CHANNELS.MEMBER_COUNT);
        channel.setName(`🔒┃ Members: ${guild.memberCount}`);
        let message_embed = new Discord.MessageEmbed()
            .setAuthor(`Update Stats`, message.author.avatarURL())
            .setDescription(`Updated server stats!`)
            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
            .setColor(config.BOT_SETTINGS.EMBED_COLORS.SUCCESS);
        message.channel.send(message_embed);
    }
}