const mongoose = require('mongoose');

const suggestion = mongoose.Schema({
   author_id: String,
   suggestion: String,
   message_id: String
});

module.exports = mongoose.model('suggestion', suggestion);