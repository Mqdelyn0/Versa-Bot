const mongoose = require('mongoose');

const ticket = mongoose.Schema({
    channel_id: String,
    author_id: String,
    reason: String,
    hours_until_deletion: Number
});

module.exports = mongoose.model('ticket', ticket);