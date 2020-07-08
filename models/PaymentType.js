const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PaymentTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
  }
})

module.exports = PaymentType = mongoose.model('PaymentType', PaymentTypeSchema);