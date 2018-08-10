const mongoose     = require("mongoose");
const Schema       = mongoose.Schema;
// const UserSchema   = require("./user");

const JobSchema = new Schema({
  companyName: Array,
  title: String,
  description: String,
  duties: String,
  objective: String,
  qualifications: String,
  Benefits: String,
  email: String,
  resume: String,
  owner: UserSchema,
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Job = mongoose.model("Job", JobSchema);
module.exports = Job;