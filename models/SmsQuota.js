const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const SmsQuotaSchema = new Schema({
  nis: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
})

module.exports = SmsQuota = mongoose.model('SmsQuota', SmsQuotaSchema);