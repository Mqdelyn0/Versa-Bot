const Discord = require('discord.js');
const config = require('../../../config.json');
const linking_model = require('../../database_models/linking.js');

module.exports = {
    commands: ['linking', 'link'],
    expected_args: 'help',
    min_args: 1,
    max_args: 2,
    permissions: [],
    required_roles: [],
    async callback(client, message, arguments, raw_text) {
        if(arguments.length === 0 || arguments[0] === "help") {
            let message_embed = new Discord.MessageEmbed()
                .setAuthor("Linking Commands", message.author.avatarURL())
                .setDescription(`-linking (Code)\n-linking unlink\n-linking info`)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR);
            return message.channel.send(message_embed);
        } else if(arguments.length !== 0) {
            if(!["unlink", "info"].includes(arguments[0])) {
                let model = await linking_model.findOne({ linking_code: arguments[0] });
                if(model) {
                    if(model.linking_needs_confirmation === true || model.is_linked === true) {
                        let message_embed = new Discord.MessageEmbed()
                            .setAuthor("ERROR", message.author.avatarURL())
                            .setDescription(`Your account needs confirmation or is already linked! If you're linking, Do \`/link confirm\` ingame to finish!`)
                            .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR)
                            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR);
                        return message.channel.send(message_embed);
                    } else if(model.linking_needs_confirmation === false && model.is_linked === false) {
                        linking_model.updateOne({ linking_code: arguments[0] }, { linking_needs_confirmation: true, discord_tag: message.author.tag, discord_id: message.author.id}, (error) => {
                            if(error) {
                                return logger.error(`There was a error updating a Linking model for ${message.author.tag}!\n\nError: ${error}`);
                            } else if(!error) {
                                let message_embed = new Discord.MessageEmbed()
                                    .setAuthor("SUCCESS", message.author.avatarURL())
                                    .setDescription(`Please do \`/link confirm\` ingame to finish! You have 5 minutes to do this.`)
                                    .setColor(config.BOT_SETTINGS.EMBED_COLORS.SUCCESS)
                                    .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR);
                                return message.channel.send(message_embed);
                            }
                        });
                    } 
                } else if(!model) {
                    let message_embed = new Discord.MessageEmbed()
                        .setAuthor("ERROR", message.author.avatarURL())
                        .setDescription(`That isn't a valid command / code!`)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR);
                    return message.channel.send(message_embed);
                }
            } else if(["unlink", "info"].includes(arguments[0])) {
                if(arguments[0] === "unlink") {
                    if(model) {
                        linking_model.deleteOne({ discord_id: message.author.id }, (error) => {
                            if(error) {
                                let message_embed = new Discord.MessageEmbed()
                                    .setAuthor("ERROR", message.author.avatarURL())
                                    .setDescription(`Couldn't unlink you! Maybe you were never linked?`)
                                    .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR)
                                    .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR);
                                return message.channel.send(message_embed);
                            } else if (!error) {
                                let message_embed = new Discord.MessageEmbed()
                                    .setAuthor("SUCCESS", message.author.avatarURL())
                                    .setDescription(`Successfully unlinked you!`)
                                    .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR)
                                    .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR);
                                return message.channel.send(message_embed);
                            }
                        });
                    } else if(!model) {
                        let message_embed = new Discord.MessageEmbed()
                            .setAuthor("ERROR", message.author.avatarURL())
                            .setDescription(`Couldn't unlink you! Maybe you were never linked?`)
                            .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR)
                            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR);
                        return message.channel.send(message_embed);
                    }
                }
            }
        }
    }
}