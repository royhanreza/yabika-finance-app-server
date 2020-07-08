const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TypeOfPaymentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  payment_type: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentType',
    required: true,
  },
  cost: {
    type: Number,
  }
})

module.exports = TypeOfPayment = mongoose.model('TypeOfPayment', TypeOfPaymentSchema);