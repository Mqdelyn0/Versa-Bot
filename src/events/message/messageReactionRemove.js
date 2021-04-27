const Discord = require('discord.js');
const config = require('../../../config.json');
const errors = require('../../structure/errors.js');
const reaction_role_model = require('../../database_models/reactionrole.js');
const logging = require('../../structure/logging');

module.exports = async(client, reaction, user) => {
    let guild = client.guilds.cache.get(config.BOT_SETTINGS.GUILD_ID);
    let member = guild.members.cache.get(user.id);
    if(!client || !reaction || !user || !member) {
        return;
    }
    let model = await reaction_role_model.findOne({ message_id: reaction.message.id });

    if(!model) {
        return;
    } else if(model) {
        if (reaction.emoji.id === model.emoji_id) {
            let role = guild.roles.cache.get(model.role_id);

            if(!role) {
                return;
            }

            if(member.roles.cache.has(role.id)) {
                member.roles.remove(role);
                const message_embed = new Discord.MessageEmbed()
                    .setAuthor(`Reaction Roles`, member.user.avatarURL())
                    .setDescription(`${role.name} was removed from you!`)
                    .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                    .setColor(config.BOT_SETTINGS.EMBED_COLORS.SUCCESS);

                return member.send(message_embed).catch(error => {
                    errors.cant_dm(client, member);
                    return logging.warn(`Couldn't DM ${member.tag}!\n\nERROR\n${error}`);
                });
            }
        }
    }
}