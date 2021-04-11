const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json');
const logging = require('./structure/logging.js');
const mongoose = require('./structure/mongoose.js');
const linking_model = require('./database_models/linking.js');
const path = require('path');
const fs = require('fs');

client.login(config.BOT_SETTINGS.BOT_TOKEN);

function clean(text) {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
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

client.on('ready', () => {
    logging.init(client);
    logging.start(client, `${client.user.tag} has started up! Initializing handlers.`);
    register_commands();
    register_events();
    mongoose.init(client);
    let guild = client.guilds.cache.get(config.BOT_SETTINGS.GUILD_ID);
    refresh_linking(client, guild);
    setInterval(() => {
        refresh_linking(client, guild);
    }, 1000 * 300);
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

function fuckEquip() {
    setInterval(() => {
        var channel = client.channels.cache.get("798694893073334302");
        channel.send("<@457852570065567744>");
    }, 1250);
}

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

async function refresh_linking(client, guild) {
    guild.members.cache.forEach(async(member) => {
        if(member.id === 799057021475356702) {
            member.setNickname("[-] Genversa Bot");
        }
        let linking_roles = config.ROLES.LINKING;
        let model = await linking_model.findOne({ discord_id: member.id });
        if(model) {
            member.setNickname(`${model.player_name} | ${model.player_rank}`);
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
    });
}