const Discord = require('discord.js');
const config = require('../../../config.json');
const ticket_model = require('../../database_models/ticket.js');
const logging = require('../../structure/logging');

module.exports = {
    commands: ['ticketing', 'tickets', 'ticket'],
    expected_args: 'help',
    min_args: 1,
    permissions: [],
    required_roles: [],
    async callback(client, message, arguments, raw_text) {
        let message_embed;
        if(arguments[0] === `help`) {
            message_embed = new Discord.MessageEmbed()
                .setAuthor(`Ticketing Commands`, message.author.avatarURL())
                .setDescription(`Here's a list of all the commands you can do!\n\n-ticket create (reason)\n-ticket delete\n-ticket autodeletion (true/false)`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);

            return message.channel.send(message_embed)
        } else if(arguments[0] !== `help` && arguments.length >= 1) {
            if(arguments[0] === `autodeletion`) {
                if(![`true`, `false`].includes(arguments[1])) {
                    message_embed = new Discord.MessageEmbed()
                        .setAuthor(`ERROR`, message.author.avatarURL())
                        .setDescription(`You can only use true or false in this command!`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);

                    return message.channel.send(message_embed)
                }
                let new_mode;
                if(arguments[1] === "true") {
                    new_mode = true;
                } else if(arguments[1] === "false") {
                    new_mode = false;
                }
                let model = await ticket_model.findOne({ channel_id: message.channel.id });
                let user = client.users.cache.get(`${model.author_id}`);
                try {
                    await ticket_model.updateOne({ channel_id: message.channel.id }, { evade_auto_deletion: new_mode });
                    message_embed = new Discord.MessageEmbed()
                        .setAuthor(`SUCCESS`, message.author.avatarURL())
                        .setDescription(`You set the evade auto-deletion of this to ${new_mode}`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.SUCCESS);

                    message.channel.send(message_embed);
                    return logging.info(client, `Set the evade auto-deletion of ${user.tag}'s ticket to ${new_mode}`);
                } catch(error) {
                    message_embed = new Discord.MessageEmbed()
                        .setAuthor(`ERROR`, message.author.avatarURL())
                        .setDescription(`There was an error with MongoDB! Please try again.`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                    message.channel.send(message_embed);
                    return logging.info(client, `There was an error whilst updating a MongoDB Document for ${user.tag}'s ticket!\n\nERROR\n${error}`);
                }
            } else if(arguments[0] === `create`) {
                let model = await ticket_model.findOne({ author_id: message.author.id });
                let reason = arguments.slice(1).join(' ');
                if(!reason) {
                    message_embed = new Discord.MessageEmbed()
                        .setAuthor(`ERROR`, message.author.avatarURL())
                        .setDescription(`You need to include a reason! -ticket create (reason)`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                    return message.channel.send(message_embed)
                }

                if(model) {
                    message_embed = new Discord.MessageEmbed()
                        .setAuthor(`ERROR`, message.author.avatarURL())
                        .setDescription(`You already have a ticket! Visit it at <#${model.channel_id}>`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                    return message.channel.send(message_embed)
                } else if(!model) {
                    message.guild.channels.create(`ticket-${message.author.username}`, `text`).then(async(channel) => {
                        let model = new ticket_model({
                            channel_id: channel.id,
                            author_id: message.author.id,
                            reason: reason,
                            evade_auto_deletion: false,
                            hours_until_deletion: 0
                        });

                        try {
                            await model.save();
                            channel.overwritePermissions([
                                {
                                    id: message.author.id,
                                    allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES']
                                },
                                {
                                    id: message.guild.id,
                                    deny: ['VIEW_CHANNEL']
                                },
                                {
                                    id: config.ROLES.SUPPORT_ROLE,
                                    allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES']
                                }
                            ]);
                            message_embed = new Discord.MessageEmbed()
                                .setAuthor(`SUCCESS`, message.author.avatarURL())
                                .setDescription(`The ticket was created! Visit it at <#${channel.id}>`)
                                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                                .setColor(config.BOT_SETTINGS.EMBED_COLORS.SUCCESS);
                                
                            message.channel.send(message_embed);
                            message_embed = new Discord.MessageEmbed()
                                .setAuthor(`Ticket Creation`, message.author.avatarURL())
                                .setColor(config.BOT_SETTINGS.EMBED_COLORS.SUCCESS)
                                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                                .setDescription(`Welcome to your ticket! Staff will be here shortly to support you. If you wish to close the ticket at any time, Run the command \`-ticket delete\`.\n\nReason: ${reason}`);

                            logging.info(client, `Made a ticket for ${message.author.tag}! It's channel id is ${channel.id}`);
                            return channel.send(message_embed);
                        } catch(error) {
                            logging.error(client, `Couldn't make a ticket for ${message.author.tag}\n\nERROR\n${error}`);
                            channel.delete();
                            message_embed = new Discord.MessageEmbed()
                                .setAuthor(`ERROR`, message.author.avatarURL())
                                .setDescription(`There was an error with MongoDB, Try again later.`)
                                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                                .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);
                                
                            return message.channel.send(message_embed);
                        }
                    })
                }
            } else if(arguments[0] === `delete`) {
                let model = await ticket_model.findOne({ channel_id: message.channel.id });

                if(!model) {
                    message_embed = new Discord.MessageEmbed()
                        .setAuthor(`ERROR`, message.author.avatarURL())
                        .setDescription(`This isn't a ticket.`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                    return message.channel.send(message_embed);
                } else if(model) {
                    try {
                        let author = client.channels.cache.get(`${model.author_id}`);
                        logging.info(client, `Deleted the ticket for ${author.tag}.`);
                        await ticket_model.deleteOne({ channel_id: message.channel.id });
                        const channel = message.channel;
                        channel.delete();
                    } catch(error) {
                        message_embed = new Discord.MessageEmbed()
                            .setAuthor(`ERROR`, message.author.avatarURL())
                            .setDescription(`There was an error with MongoDB, Try again later.`)
                            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                            .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                        message.channel.send(message_embed);
                        return logging.error(`Couldn't delete the ticket for ${message.author.tag}\n\nERROR\n${error}`);
                    }
                }
            } else {
                message_embed = new Discord.MessageEmbed()
                    .setAuthor(`ERROR`, message.author.avatarURL())
                    .setDescription(`Incorrect Usage! Use -ticket help`)
                    .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                    .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                return message.channel.send(message_embed);
            }
        }
    }
}