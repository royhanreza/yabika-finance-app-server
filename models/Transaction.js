const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  paymentsDetails: [],
  payment_method: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  midtrans_transaction_id: {
    type: String
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
  completed: {
    type: Number,
    default: 0,
  },
  completed_at: {
    type: Date,
  },
  total: {
    type: Number,
    required: true,
  },
  method: { // 0 : Langsung || 1 : Online
    type: Number,
    default: 0,
  },
  va_number: {
    type: String,
  },
  biller_code: {
    type: String,
  },
  bill_key: {
    type: String,
  },
  gopay_qr_code_url: {
    type: String,
  },
  gopay_deeplink_url: {
    type: String,
  },
  gopay_get_status_url: {
    type: String,
  },
  gopay_cancel_url: {
    type: String,
  },
  cstore_payment_code: {
    type: String,
  }

})

module.exports = Transaction = mongoose.model('Transaction', TransactionSchema);