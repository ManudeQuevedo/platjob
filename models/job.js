const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema({
  companyName: Array,
  title: String,
  description: String,
  function: String,
  objective: String,
  qualifications: String,
  Benefits: String,
  email: String,
  resume: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;