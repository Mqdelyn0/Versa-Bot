const mongoose = require('mongoose');

const ticket = mongoose.Schema({
    channel_id: String,
    author_id: String,
    reason: String,
});

module.exports = mongoose.model('ticket', ticket);