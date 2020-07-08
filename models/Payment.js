const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  payment_method: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  month:{ //!NUMBER OR OBJECTID decide!!! => FINAL = NUMBER
    type: Number,
  },
  school_year: {
    type: Schema.Types.ObjectId,
    ref: 'SchoolYear',
  },
  type_of_payment: { // jenis pembayaran
    type: Schema.Types.ObjectId,
    ref: 'TypeOfPayment',
  },
  administrator: {
    type: Schema.Types.ObjectId,
    ref: 'Administrator'
  },
  transaction_number: {
    type: String,
    required: true,
  },
  transaction_status: {
    type: String,
  },
  order_id: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  canceled_at: {
    type: Date,
  },
  approved_at: {
    type: Date,
  },
  denied_at: {
    type: Date,
  },
  refunded_at: {
    type: Date,
  },
  expire_at: {
    type: Date,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: { // 0 : Langsung || 1 : Online
    type: Number,
    required: true
  },
  payment_status: {  // 0: Lunas || Belum Lunas
    type: Number,
    required: true,
    default: 0,
  },
})

module.exports = Payment = mongoose.model('Payment', PaymentSchema);