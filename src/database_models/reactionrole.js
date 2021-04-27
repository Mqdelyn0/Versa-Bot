const mongoose = require('mongoose');

const reaction_roles = mongoose.Schema({ 
    role_id: String,
    message_id: String,
    emoji_id: String
});

module.exports = mongoose.model('reaction_roles', reaction_roles);