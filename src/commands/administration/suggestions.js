const Discord = require('discord.js');
const config = require('../../../config.json');
const reaction_role_model = require('../../database_models/reaction_role.js');
const logging = require('../../structure/logging');

module.exports = {
    commands: ['suggestions', 'suggest'],
    expected_args: '(suggest/deny) (message id) (reason)',
    min_args: 3,
    max_args: 3,
    permissions: [],
    required_roles: ["Owner", "Manager", "Developer", "Admin"],
    async callback(client, message, arguments, raw_text) {

    }
}