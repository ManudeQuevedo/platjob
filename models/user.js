const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
    role: {
        type: String,
        enum: ['IronHacker', 'Employer', 'SuperUser'],
        default: 'IronHacker'
    },
    pic: String
});

const User = mongoose.model("User", userSchema);
module.exports = User;