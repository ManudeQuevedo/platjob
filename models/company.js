const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
  companyName: Array,
  foundation: String,
  username: Array,
  email: String,
  password: String,
  address: String,
  phoneNumber: String,
  role: {
      type: String,
      default: 'COMPANY'
    }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

CompanySchema.virtual('isCompany').get(function () {
  return this.role == "COMPANY";
});

const Job = mongoose.model("Job", CompanySchema);
module.exports = Job;