const Discord = require('discord.js');
const config = require('../../../config.json');
const prefix = config.BOT_SETTINGS.PREFIX;
const logging = require('../../structure/logging.js');

const confirm_permissions = (permissions) => {

    const valid_permissions = [
        'ADMINISTRATOR','CREATE_INSTANT_INVITE','KICK_MEMBERS','BAN_MEMBERS','MANAGE_CHANNELS',
        'MANAGE_GUILD','ADD_REACTIONS','VIEW_AUDIT_LOG','VIEW_CHANNEL','READ_MESSAGES', 'SEND_MESSAGES',
        'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'EXTERNAL_EMOJIS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS',
        'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES',
        'MANAGE_ROLES_OR_PERMISSIONS', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS'
    ]

    for(const permission of permissions) {
        if(!valid_permissions.includes(permission)) {
            throw new TypeError(`Unkown Permission: ${permission}`);
        }
    }

}

module.exports = (client, command_options) => {

    let {
        commands,
        expected_args = '',
        min_args = 0,
        max_args = null,
        permissions = [],
        required_roles = [],
        callback
    } = command_options;

    if(typeof commands === 'string') {
        commands = [commands];
    }

    if(permissions.length) {
        if(typeof permissions === 'string') {
            permissions = [permissions];
        }

        confirm_permissions(permissions);
    }

    logging.start(client, `Command ${commands[0]} is registered!`);

    client.on('message', async(message) => {
        const { member, content, guild, channel } = message;
        if((!member || !content || !guild || !channel) || member.user.bot) {
            return
        };

        // Check if the ran cmd is a alias, or a command.
        for(const alias of commands) {
            if(content.toLowerCase().startsWith(`${prefix}${alias.toLowerCase()}`)) {
                
                // Make arguments split on any number of spaces.
                const arguments = content.split(/[ ]+/);
                                
                // Get rid of the command from the arguments.
                arguments.shift();

                // Log the executed command
                logging.info(client, `${member.user.tag} executed command: -${alias} ${arguments.join(' ')}`);

                // Check if the user has one of the required permissions.
                let perms = 0;
                let needed_perms = permissions.length;
                if(needed_perms === 0) {
                    needed_perms = 1;
                }
                for(const permission of permissions) {
                    if(!member.hasPermission(permission)) {
                        perms++;
                    }
                }

                if(perms >= needed_perms) {
                    const message_embed = new Discord.MessageEmbed()
                        .setAuthor(`ERROR`, member.user.avatarURL())
                        .setDescription(`You don't have the required permission(s) to execute this command!\nNeeded Permission(s): ${permissions.join(', ')}`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                    return channel.send(message_embed);
                }

                // Check if the user has one of the required roles.
                let roles = 0;
                let needed_roles = required_roles.length;
                if(needed_roles === 0) {
                    needed_roles = 1;
                }
                for(const required_role of required_roles) {
                    const role = guild.roles.cache.find(check_role => check_role.name === `${required_role}`);
                    if(!role || !member.roles.cache.has(role.id)) {
                        roles++;
                    }
                }

                if(roles >= needed_roles) {
                    const message_embed = new Discord.MessageEmbed()
                        .setAuthor(`ERROR`, member.user.avatarURL())
                        .setDescription(`You don't have the required role(s) to execute this command!\nNeeded Role(s): ${required_roles.join(', ')}`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                    return channel.send(message_embed);
                }

                // Make sure the amount of arguments is the right amount.
                if(arguments.length < min_args || (arguments.length > max_args && max_args !== null)) {
                    const message_embed = new Discord.MessageEmbed()
                        .setAuthor(`ERROR`, member.user.avatarURL())
                        .setDescription(`Incorrect Usage! Use ${prefix}${alias} ${expected_args}`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);

                    return channel.send(message_embed);
                }

                // Finally, Run the command's callback function.
                return callback(client, message, arguments, arguments.join(' '));
            }
        }
    });
}