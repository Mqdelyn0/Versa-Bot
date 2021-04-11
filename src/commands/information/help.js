const Discord = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    commands: ['help'],
    expected_args: '',
    min_args: 0,
    max_args: 0,
    permissions: [],
    required_roles: [],
    callback(client, message, arguments, raw_text) {
        let commands = [
            '-reactionrole | Create a reaction role',
            '-botinfo | View bot information',
            '-guildinfo | View guild information',
            '-ticket help | View ticketing help',
            '-suggest help | View suggestions help'
        ];

        const message_embed = new Discord.MessageEmbed()
            .setAuthor(`Elestra Commands`, message.author.avatarURL())
            .setDescription(`Here's a list of all the commands you can do!\n\n${commands.join('\n')}`)
            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
            .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN)

        return message.channel.send(message_embed)
    }
}