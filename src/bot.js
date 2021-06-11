const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json');
const logging = require('./structure/logging.js');
const mongoose = require('./structure/mongoose.js');
const linking_model = require('./database_models/linking.js');
const punishents_model = require('./database_models/punishment.js');
const tickets_model = require('./database_models/ticket.js');
const donations_model = require('./database_models/donation.js');
const path = require('path');
const fs = require('fs');
const delay = ms => new Promise(res => setTimeout(res, ms));
client.login(config.BOT_SETTINGS.BOT_TOKEN);

function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
  }

  function getTimeDiffAndPrettyText(oDatePublished) {

    var oResult = {};
  
    var oToday = new Date();
  
    var nDiff = oToday.getTime() - oDatePublished.getTime();
  
    // Get diff in days
    oResult.days = Math.floor(nDiff / 1000 / 60 / 60 / 24);
    nDiff -= oResult.days * 1000 * 60 * 60 * 24;
  
    // Get diff in hours
    oResult.hours = Math.floor(nDiff / 1000 / 60 / 60);
    nDiff -= oResult.hours * 1000 * 60 * 60;
  
    // Get diff in minutes
    oResult.minutes = Math.floor(nDiff / 1000 / 60);
    nDiff -= oResult.minutes * 1000 * 60;
  
    // Get diff in seconds
    oResult.seconds = Math.floor(nDiff / 1000);
  
    // Render the diffs into friendly duration string
  
    // Days
    var sDays = '00';
    if (oResult.days > 0) {
        sDays = String(oResult.days);
    }
    if (sDays.length === 1) {
        sDays = '0' + sDays;
    }
  
    // Format Hours
    var sHour = '00';
    if (oResult.hours > 0) {
        sHour = String(oResult.hours);
    }
    if (sHour.length === 1) {
        sHour = '0' + sHour;
    }
  
    //  Format Minutes
    var sMins = '00';
    if (oResult.minutes > 0) {
        sMins = String(oResult.minutes);
    }
    if (sMins.length === 1) {
        sMins = '0' + sMins;
    }
  
    //  Format Seconds
    var sSecs = '00';
    if (oResult.seconds > 0) {
        sSecs = String(oResult.seconds);
    }
    if (sSecs.length === 1) {
        sSecs = '0' + sSecs;
    }
  
    //  Set Duration
    var sDuration = sDays + ':' + sHour + ':' + sMins + ':' + sSecs;
    oResult.duration = sDuration;
  
    // Set friendly text for printing
    if(oResult.days === 0) {
  
        if(oResult.hours === 0) {
  
            if(oResult.minutes === 0) {
                var sSecHolder = oResult.seconds > 1 ? 'Seconds' : 'Second';
                oResult.friendlyNiceText = oResult.seconds + ' ' + sSecHolder + ' ago';
            } else { 
                var sMinutesHolder = oResult.minutes > 1 ? 'Minutes' : 'Minute';
                oResult.friendlyNiceText = oResult.minutes + ' ' + sMinutesHolder + ' ago';
            }
  
        } else {
            var sHourHolder = oResult.hours > 1 ? 'Hours' : 'Hour';
            oResult.friendlyNiceText = oResult.hours + ' ' + sHourHolder + ' ago';
        }
    } else { 
        var sDayHolder = oResult.days > 1 ? 'Days' : 'Day';
        oResult.friendlyNiceText = oResult.days + ' ' + sDayHolder + ' ago';
    }
  
    return oResult;
  }

client.on("message", message => {
    const args = message.content.split(" ").slice(1);
   
    if (message.content.startsWith("-eval")) {
      if(message.author.tag !== "Madelyn#0001") return;
      try {
        const code = args.join(" ");
        let evaled = eval(code);
   
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);
   
        message.channel.send(clean(evaled), {code:"xl"});
      } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }
    }
});

client.on('ready', async() => {
    logging.init(client);
    logging.start(client, `${client.user.tag} has started up! Initializing handlers.`);
    register_commands();
    register_events();
    mongoose.init(client);
    let guild = await client.guilds.cache.get(config.BOT_SETTINGS.GUILD_ID);
    initLinking(client, guild);
    initTicketing(client, guild);
    initPunishments(client, guild);
    initDonations(client, guild);
    initStatus(client, guild);
});

async function register_commands(directory = 'commands') {
    const commands_handler = require(`./commands/handler/command_handler.js`);
    const excluded_directories = ['handler'];
    const files = fs.readdirSync(path.join(__dirname, directory));
    for(const file of files) {
        const file_stat = fs.lstatSync(path.join(__dirname, directory, file));
        if(file_stat.isDirectory()) {
            if(!excluded_directories.includes(file)) {
                register_commands(path.join(directory, file));
                logging.start(client, `Found commands directory ${path.join(directory, file)}`);
            }
        } else if (!file_stat.isDirectory()) {
            const option = require(path.join(__dirname, directory, file));
            commands_handler(client, option);
        }
    }
};

async function initLinking(client, guild) {
    let channelDebug = guild.channels.cache.get(`852627152843309056`);
    let memberCount = guild.memberCount;
    let membersUpdated = 0;
    let members = [];
    let startingNow = new Date();
    guild.members.cache.forEach(member => members.push(member));
    let messageEmbed = new Discord.MessageEmbed()
        .setTitle(`Linking Update`)
        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
        .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN)
        .setDescription(`Finished a loop, Starting a New Loop with ${memberCount} users to loop`)
    channelDebug.send(messageEmbed);
    for(let member of members) {
        let linking_roles = config.ROLES.LINKING;
        let model = await linking_model.findOne({ discord_id: member.id });
        if(model) {
            if(member.nickname) {
                if(!member.nickname.includes(`[${model.player_rank}]`) || !member.nickname.includes(`${model.player_name}`)) {
                    let a = await delay(5000);
                    member.setNickname(`[${model.player_rank}] ${model.player_name}`);
                    if(model.is_verified === false) return;
                    linking_roles.forEach(role_id => {
                        let role = guild.roles.cache.get(role_id);
                        if(member.roles.cache.has(role.id)) {
                            if(model.player_rank !== role.name) {
                                logging.info(client, `Removed ${role.name} from ${member.user.tag}!`);
                                member.roles.remove(role);
                            }
                        }
                    });
                    let role_needed;
                    let role_linked = guild.roles.cache.find(check_role => check_role.id ===config.ROLES.LINKED);
                    if(!member.roles.cache.has(role_linked.id)) {
                        member.roles.add(role_linked);
                        logging.info(client, `Added ${role_linked.name} to ${member.user.tag} as they linked their account!`);
                    }
                    role_needed = guild.roles.cache.find(check_role => check_role.name === model.player_rank);
                    if(role_needed) {
                        if(!member.roles.cache.has(role_needed.id)) {
                            member.roles.add(role_needed);
                            logging.info(client, `Added ${role_needed.name} to ${member.user.tag} as they linked their account!`);
                        }
                    }
                    messageEmbed.setDescription(`Updated ${member.user.tag} (${membersUpdated}/${memberCount})\nNew Nick: ${member.nickname}\nNew Roles: ${member.roles.cache.map().join(`, `)}`)
                    channelDebug.send(messageEmbed);
                }
            }
        } else if(!model) {
            let role = guild.roles.cache.get(config.ROLES.LINKED);
            if(member.roles.cache.has(role.id)) {
                member.roles.remove(role);
                logging.info(client, `Removed ${role.name} from ${member.user.tag} as they unlinked their account!`);
            }

            linking_roles.forEach(role_id => {
                let role = guild.roles.cache.get(role_id);
                if(member.roles.cache.has(role)) {
                    logging.info(client, `Removed ${role.name} from ${member.user.tag} as they unlinked their account!`);
                    member.roles.remove(role);
                }
            }); 
        }
        membersUpdated++;
    };
    let a = await delay(5000);
    let difference = getTimeDiffAndPrettyText(startingNow);
    messageEmbed.setDescription(`Finished looping through ${memberCount} users in ${difference.minutes} minutes and ${difference.seconds} seconds!`);
    channelDebug.send(messageEmbed);
    initLinking(client,guild);
};

async function initStatus(client, guild) {
    let status_list = [
        "PLAYING|mineversa.minehut.gg",
        "PLAYING|subtropic.minehut.gg",
        "WATCHING|over <users> users",
        "WATCHING|over tickets (-help)",
    ];
    for(let status of status_list) {
        let data = status.split('|');
        let guild = client.guilds.cache.get(`${config.BOT_SETTINGS.GUILD_ID}`);
        client.user.setPresence({ 
            activity: {
                name: `${data[1].replace(`<users>`, `${guild.memberCount}`)}`,
                type: `${data[0]}`
            },
            status: "online"
        });
        await delay(5000);
    }
    initStatus(client, guild);
}

async function initTicketing(client, guild) {
    setInterval(async() => {
        let tickets = await tickets_model.find({});
        let updated = [];
        let pending = [];
        for(let ticket of tickets) {
            if(ticket.evade_auto_deletion !== true) {
                let hours = ticket.hours_until_deletion + 1;
                let channel = client.channels.cache.get(ticket.channel_id);
                let author = client.users.cache.get(ticket.author_id);
                if(hours === 24) {
                    const message_embed = new Discord.MessageEmbed()
                        .setAuthor(`Pending Deletion`, author.avatarURL())
                        .setDescription(`Since there has been no activity in this ticket the past 24 hours, It'll get auto-deleted in 12 hours! Please send a message now if you wish to keep this ticket.`)
                        .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                        .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);
                    channel.send(message_embed);
                    channel.send(`<@${author.id}>`).then(message => {
                        setTimeout(() => {
                            message.delete();
                        }, 1000 * 5);
                    });
                    pending.push(author.tag);
                } else if(hours >= 36) {
                    try {
                        await tickets_model.deleteOne({ channel_id: ticket.channel_id });
                        const channel = client.channels.cache.get(ticket.channel_id);
                        channel.delete();
                        logging.info(client, `Auto-Deleted the ticket for ${author.tag}.`)
                    } catch(error) {
                        let message_embed = new Discord.MessageEmbed()
                            .setAuthor(`ERROR`, author.avatarURL())
                            .setDescription(`There was an error with MongoDB, Your ticket couldn't be Auto-Deleted.`)
                            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                            .setColor(config.BOT_SETTINGS.EMBED_COLORS.ERROR);
    
                        channel.send(message_embed);
                        logging.error(client, `Couldn't delete the ticket for ${author.tag}\n\nERROR\n${error}`);
                    }
                }
                tickets_model.updateOne({ author_id: ticket.author_id }, { hours_until_deletion: hours }, (error => {
                    if(error) {
                        logging.error(client, `There was an error updating ticket ${ticket.channel_id}!\n\nERROR:\n${error}`);
                    } else if(!error) {
                        updated.push(ticket.channel_id);
                    }
                }));
            }
        }
        if(pending.length === 0) {
            logging.info(client, `No tickets were updated this hour!`);
        } else if(pending >>> 0) {
            logging.info(client, `Successfully updated ${updated.length} tickets! There are ${pending.length} new tickets that are pending for deletion! Please check out the tickets for ${pending.join(', ')}!`);
        }
    }, 1000 * 3600);
};

async function initPunishments(client, guild) {
    setInterval(async() => {
        let punishments = await punishents_model.find({});
        let punished = [];
        for(let punishment of punishments) {
            let channel = client.channels.cache.get(config.CHANNELS.PUNISHMENTS_LOGGING);
            const message_embed = new Discord.MessageEmbed()
                .setTitle(`Server Punishment`)
                .setThumbnail(`https://minotar.net/helm/${punishment.moderator}`)
                .setDescription(`${punishment.moderator} punished ${punishment.player_name} on ${punishment.what_server}!\n\nType: ${punishment.type}\nReason: ${punishment.reason}\nLength: ${punishment.length}`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);
            channel.send(message_embed);
            punished.push(punishment.player_name);
            punishment.delete();
        }
        if(punished.length >= 1) {
            logging.info(client, `Fetched ${punished.length} punishments! Laugh at ${punished.join(', ')}! LMFAO`);
        }
    }, 1000 * 60);
};

async function initDonations(client, guild) {
    setInterval(async() => {
        let donations = await donations_model.find({});
        let donators = [];
        for(let donation of donations) {
            let channel = client.channels.cache.get(config.CHANNELS.DONATIONS_LOGGING);
            const message_embed = new Discord.MessageEmbed()
                .setTitle(`Server Donation`)
                .setThumbnail(`https://minotar.net/helm/${donation.player_name}`)
                .setDescription(`Thank you ${donation.player_name} for buying ${donation.bought_item}!\n\nDonation: ${donation.moneyz_got}\nServer: ${donation.what_server}`)
                .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
                .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);
            channel.send(message_embed);
            donators.push(donation.player_name);
            donation.delete();
        }
        if(donators.length >= 1) {
            logging.info(client, `Fetched ${donators.length} donations! Thanks to ${donators.join(', ')}! uwu`);
        }
    }, 1000 * 60);
};

async function register_events(directory = 'events') {
    let files = await fs.readdirSync(path.join(__dirname, directory));
    for(let file of files) {
        let stat = await fs.lstatSync(path.join(__dirname, directory, file));
        if(stat.isDirectory()) {
            register_events(path.join(directory, file));
            logging.start(client, `Found events directory ${path.join(directory, file)}`);
        } else if(file.endsWith(".js")) {
            let event_name = file.substring(0, file.indexOf(".js"));
            let event_module = require(path.join(__dirname, directory, file));
            client.on(event_name, event_module.bind(null, client));
            logging.start(client, `Event ${event_name}.js is registered`);
        }
    }
};