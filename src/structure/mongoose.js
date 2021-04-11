const mongoose = require("mongoose");
const logging = require("../structure/logging.js");
const config = require("../../config.json");

module.exports = {
    init: (client) => {
        const database_options = {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            poolSize: 5,
            connectTimeoutMS: 5000,
            family: 4
        };
        mongoose.connect(config.BOT_SETTINGS.MONGODB_URL, database_options);
        mongoose.set('useFindAndModify', false);
        mongoose.Promise = global.Promise;
        mongoose.connection.on('connected', () => {
            logging.info(client, 'Successfully logged into MongoDB!');
        });
        mongoose.connection.on('err', (error) => {
            logging.error(client, `There was a error with MongoDB:\n${error}`);
        });
        mongoose.connection.on('disconnected', () => {
            logging.warn(client, `Disconnected from MongoDB!`);
        });
    }
}