const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token : {
        type: String,
        required : [true, "token is required to be in blacklist"]
    }
});

const blacklistTokenModel = mongoose.model('token', tokenSchema);

module.exports = blacklistTokenModel;