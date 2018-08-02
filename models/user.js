const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
    rol: {
        type: String,
        enum: ['COMPANY', 'IRONHACKER', 'ADMIN'],
        default: 'IRONHACKER',
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