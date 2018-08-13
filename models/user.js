const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
  companyName: String,
  address: String,
  phoneNumber: String,
  role: {
    type: String,
    enum: ['COMPANY', 'IRONHACKER', 'ADMIN'],
    default: 'IRONHACKER'
  },
  session: String,
  last_login: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  },
});

UserSchema.virtual('isAdmin').get(function () {
  return this.role == "ADMIN";
});

UserSchema.virtual('isUser').get(function () {
  return this.role == "IRONHACKER";
});

UserSchema.virtual('isCompany').get(function () {
  return this.role == "COMPANY";
});

const User = mongoose.model("User", UserSchema);
module.exports = User;