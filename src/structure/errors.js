const Discord = require('discord.js');
const logging = require('../structure/logging.js');
const config = require('../../config.json');

module.exports = {
    cant_dm: async(client, member) => {
        let channel = client.channels.cache.get(config.CHANNELS.BOT_COMMANDS);
        const message_embed = new Discord.MessageEmbed()
            .setAuthor(`ERROR`, member.user.avatarURL())
            .setDescription(`I couldn't DM you <@${member.id}>, Please enable your DMs!`)
            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
            .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

        return channel.send(message_embed).then(message => {
            message.channel.send(`<@${member.id}>`).then(message => {
                setTimeout(async() => {
                    message.delete();
                }, 5000);
            });
        });
    }
}