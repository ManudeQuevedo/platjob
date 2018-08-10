const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
  companyName: Array,
  foundation: String,
  address: String,
  phoneNumber: String,
  email: String
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

const Job = mongoose.model("Job", CompanySchema);
module.exports = Job;