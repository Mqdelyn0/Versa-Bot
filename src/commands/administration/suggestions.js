const Discord = require('discord.js');
const config = require('../../../config.json');
const suggestion_model = require('../../database_models/suggestion.js');
const logging = require('../../structure/logging');

module.exports = {
    commands: ['suggestions', 'suggest'],
    expected_args: '(accept/deny) (message id) (reason)',
    min_args: 3,
    max_args: 99,
    permissions: [],
    required_roles: ["Owner", "Manager", "Developer", "Admin"],
    async callback(client, message, arguments, raw_text) {
        let reason = arguments.splice(3).join(' ');
        let model = await suggestion_model.findOne({ message_id: arguments[1] });
        if(model) {
            let result, channel, colour;
            let author = client.users.cache.get(model.author_id);
            if(arguments[0] === "accept") {
                result = "Accepted Suggestion";
                channel = client.channels.cache.get(config.CHANNELS.SUGGESTIONS_ACCEPT);
                colour = config.BOT_SETTINGS.EMBED_COLORS.SUCCESS;
            } else if(arguments[0] === "deny") {
                result = "Denied Suggestion";
                channel = client.channels.cache.get(config.CHANNELS.SUGGESTIONS_DENIED);
                colour = config.BOT_SETTINGS.EMBED_COLORS.ERROR;
            }
            let message_embed = new Discord.MessageEmbed()
                .setAuthor(`${result}`, author.avatarURL())
                .setDescription(`${model.suggestion}\n\n**Suggestion** <@${model.author_id}>\n**Reason** ${reason}`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(colour);
            channel.send(message_embed);
            suggestion_model.deleteOne({ message_id: arguments[1] }, (error) => {
                if(error) {
                    logging.error(`There was an error deleting a suggsetion made by ${author.tag}!\n\nERROR:\n${error}`);
                }
            });
        } else if(!model) {
            let message_embed = new Discord.MessageEmbed()
                .setAuthor(`ERROR`, message.author.avatarURL())
                .setDescription(`${arguments[1]} isn't a valid suggestion!`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);
            
            return message.channel.send(message_embed);
        }
    }
}