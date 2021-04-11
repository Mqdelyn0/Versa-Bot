const mongoose = require('mongoose');

const punishment = mongoose.Schema({ 
    player_name: String,
    moderator: String,
    what_server: String,
    reason: String,
    type: String,
    length: String,
});

module.exports = mongoose.model('punishment', punishment);