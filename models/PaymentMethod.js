const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PaymentMethodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  bank: {
    type: String,
  },
  store: {
    type: String,
  },
  midtrans_payment_type: {
    type: String,
    required: true,
  },
  transaction_fee_type: { // 0 = persen, 1 = angka
    type: Number,
    required: true,
  },
  transaction_fee: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: 'default_payment_method.png'
  },
  status: {
    type: Number
  }
})

module.exports = PaymentMethod = mongoose.model('PaymentMethod', PaymentMethodSchema);