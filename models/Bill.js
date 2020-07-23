const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const BillSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  type_of_payment: { // jenis pembayaran
    type: Schema.Types.ObjectId,
    ref: 'TypeOfPayment',
    required: true,
  },
  month: {
    type: Number
  },
  school_year: {
    type: Schema.Types.ObjectId,
    ref: 'SchoolYear',
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  transaction_number: {
    type: String,
  },
  status: { // 0: Aktif/Belum Selesai/Dibatalkan, 1: Menunggu Pembayaran  , 2: Selesai
    type: Number,
    required: true,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = Bill = mongoose.model('Bill', BillSchema);