const mongoose = require('mongoose');

const donation = mongoose.Schema({ 
    player_name: String,
    bought_item: String,
    moneyz_got: String,
    what_server: String,
});

module.exports = mongoose.model('donation', donation);