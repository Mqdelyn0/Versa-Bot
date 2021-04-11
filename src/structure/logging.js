const fs = require('fs').promises;
const config = require('../../config.json');

module.exports = {
    init: async(client) => {
        if(!client) {
            return;
        }
        let channel = client.channels.cache.get(config.CHANNELS.GENVERSA_LOGGING);
        channel.send(`**[INIT]** Logging initialized`);
        console.log(`\x1b[32m[INIT] \x1b[39mLogging initialized`);
    },
    info: async(client, message) => {
        if(!client || !message) {
            return;
        }
        let channel = client.channels.cache.get(config.CHANNELS.GENVERSA_LOGGING);
        console.log(`\x1b[32m[INFO] \x1b[39m${message}`);
        channel.send(`**[INFO]:** ${message}`);
    },
    error: async(client, message) => {
        if(!client || !message) {
            return;
        }
        let channel = client.channels.cache.get(config.CHANNELS.GENVERSA_LOGGING);
        console.log(`\x1b[31m[ERROR] \x1b[39m${message}`);
        channel.send(`**[ERROR]:** ${message}`);
    },
    debug: async(client, message) => {
        if(!client || !message) {
            return;
        }
        let channel = client.channels.cache.get(config.CHANNELS.GENVERSA_LOGGING);
        console.log(`\x1b[33m[DEBUG] \x1b[39m${message}`);
        channel.send(`**[DEBUG]:** ${message}`);
    },
    warn: async(client, message) => {
        if(!client || !message) {
            return;
        }
        let channel = client.channels.cache.get(config.CHANNELS.GENVERSA_LOGGING);
        console.log(`\x1b[33m[WARN] \x1b[39m${message}`);
        channel.send(`**[WARN]:** ${message}`);
    },
    start: async(client, message) => {
        if(!client || !message) {
            return;
        }
        let channel = client.channels.cache.get(config.CHANNELS.GENVERSA_LOGGING);
        console.log(`\x1b[32m[START] \x1b[39m${message}`);
        channel.send(`**[START]:** ${message}`);
    }
};