const mongoose  = require('mongoose');

const managerSchema = new mongoose.Schema({
    Username : {
        type : String,
        require : true,
    },

    email : {
        type : String,
        require : true,
    },
    password : {
        type : String,
        require : true
    },
});


module.exports = mongoose.models.manager || mongoose.model("manager", managerSchema);
