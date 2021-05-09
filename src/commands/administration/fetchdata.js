const Discord = require('discord.js');
const config = require('../../../config.json');
const punishents_model = require('../../database_models/punishment.js');
const donations_model = require('../../database_models/donation.js');
const logging = require('../../structure/logging.js');

module.exports = {
    commands: ['fetchdata', 'fdata', 'fd'],
    expected_args: '',
    min_args: 0,
    max_args: 0,
    permissions: [],
    required_roles: ["Owner", "Manager", "Developer", "Admin"],
    async callback(client, message, arguments, raw_text) {
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
        const message_embed = new Discord.MessageEmbed()
            .setAuthor(`Fetched Data`, message.author.avatarURL())
            .setDescription(`There were ${punished.length} punishments and ${donators.length} donations fetched!`)
            .setFooter(config.BOT_SETTINGS.EMBED_AUTHOR)
            .setColor(config.BOT_SETTINGS.EMBED_COLORS.MAIN);
        
        message.channel.send(message_embed);
    }
}