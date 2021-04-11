const Discord = require('discord.js');
const config = require('../../../config.json');
const suggestions_model = require('../../database_models/suggestion.js');
const tickets_model = require('../../database_models/ticket.js');
const logging = require('../../structure/logging.js');

module.exports = async (client, message) => {
    if(message.author.bot)
        return;
    if(message.channel.id === config.CHANNELS.SUGGESTIONS_CREATE) {
        const message_embed = new Discord.MessageEmbed()
            .setAuthor(`SUGGESTION`, message.author.avatarURL())
            .setDescription(`${message}`)
            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
            .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);
        message.channel.send(message_embed).then(msg => {
            msg.react(`802504459292377090`);
            msg.react(`802504446969643029`);
            let model = new suggestions_model({ suggestion: message, author_id: message.author.id, message_id: msg.id });
            try {
                model.save();
            } catch(error) {
                logging.error(`There was a error making a suggestion document!\nERROR:\n${error}`);
                msg.delete();
            }
        });
        message.delete();
    } else {
        let model = await tickets_model.findOne({ channel_id: message.channel.id });
        if(model) {
            let author = client.users.cache.get(model.author_id);
            if(model.hours_until_deletion >= 24) {
                let message_embed = new Discord.MessageEmbed()
                    .setAuthor(`Cancelled Auto-Deletion`, message.author.avatarURL())
                    .setDescription(`You cancelled the auto-deletion of this ticket!`)
                    .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                    .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);
                message.channel.send(message_embed);
                tickets_model.updateOne({ channel_id: model.channel_id }, { hours_until_deletion: 0 }, (error) => {
                    if(error) {
                        message.delete();
                        let message_embed = new Discord.MessageEmbed()
                            .setAuthor(`ERROR`, message.author.avatarURL())
                            .setDescription(`There was an error with MongoDB, Auto-Deletion couldn't be cancelled!`)
                            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                            .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);
                        
                        message.channel.send(message_embed);
                        logging.error(client, `Couldn't cancel the Auto-Deletion for ${author.tag}'s ticket!\n\nERROR\n${error}`);
                    } else if(!error) {
                        logging.info(client, `Cancelled the Auto-Deletion for ${author.tag}'s ticket!`);
                    }
                });
            }
        }
    }
}