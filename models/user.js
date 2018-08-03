const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    username: String,
    password: String,
    role: {
        type: String,
        enum: ['COMPANY', 'IRONHACKER', 'ADMIN'],
        default: 'IRONHACKER'
    },
    session: String,
    last_login: {
        type: Date,
        default: ""
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    },
});

const User = mongoose.model("User", userSchema);
module.exports = User;