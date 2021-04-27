const Discord = require('discord.js');
const config = require('../../../config.json');
const reaction_role_model = require('../../database_models/reactionrole.js');
const logging = require('../../structure/logging');

module.exports = {
    commands: ['reactionrole', 'rrole'],
    expected_args: '(create/delete) (channel id) (message id) (role id) (emoji id)',
    min_args: 5,
    max_args: 5,
    permissions: [],
    required_roles: ["Owner", "Manager", "Developer", "Admin"],
    async callback(client, message, arguments, raw_text) {
        let guild = client.guilds.cache.get(config.BOT_SETTINGS.GUILD_ID);
        let channel = client.channels.cache.get(arguments[0]);
        if(!channel) {
            const message_embed = new Discord.MessageEmbed()
                .setAuthor(`ERROR`, message.author.avatarURL())
                .setDescription(`${arguments[0]} isn't a valid channel id!`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

            return message.channel.send(message_embed);
        }
        let emoji = guild.emojis.cache.find(check_emoji => check_emoji.id === arguments[3]);
        if(!emoji) {
            const message_embed = new Discord.MessageEmbed()
                .setAuthor(`ERROR`, message.author.avatarURL())
                .setDescription(`${arguments[3]} isn't a valid emoji id!`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

            return message.channel.send(message_embed);
        }
        let role = guild.roles.cache.find(check_role => check_role.id === arguments[2]);
        if(!role) {
            const message_embed = new Discord.MessageEmbed()
                .setAuthor(`ERROR`, message.author.avatarURL())
                .setDescription(`${arguments[2]} isn't a valid role id!`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

            return message.channel.send(message_embed);
        }
        let reaction_message = await channel.messages.fetch(arguments[1]);
        if(!reaction_message) {
            const message_embed = new Discord.MessageEmbed()
                .setAuthor(`ERROR`, message.author.avatarURL())
                .setDescription(`${arguments[1]} isn't a valid message id!`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

            return message.channel.send(message_embed);
        }
        else {
            let model = new reaction_role_model({
                message_id: reaction_message.id,
                emoji_id: emoji.id,
                role_id: role.id
            });
            try {
                model.save().then(() => {
                    const message_embed = new Discord.MessageEmbed()
                        .setAuthor(`SUCCESS`, message.author.avatarURL())
                        .setDescription(`You created a reaction role for ${role}!`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.SUCCESS);

                    message.channel.send(message_embed);
                    return logging.info(client, `Made a reaction role for ${role.name}.`);
                });
            } catch(error) {
                const message_embed = new Discord.MessageEmbed()
                    .setAuthor(`ERROR`, message.author.avatarURL())
                    .setDescription(`There was a error with MongoDB, Try again later.`)
                    .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                    .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                message.channel.send(message_embed);
                return logging.error(client, `Failed to make a reaction role.\n\nERROR\n${error}`);
            }
        }
    }
}