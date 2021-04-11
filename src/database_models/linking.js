const mongoose = require('mongoose');

const linking = mongoose.Schema({ 
    player_uuid: String,
    player_name: String,
    player_rank: String,
    linking_code: String,
    discord_tag: String,
    discord_id: String,
    linking_needs_confirmation: Boolean,
    is_linked: Boolean
});

module.exports = mongoose.model('linking', linking);