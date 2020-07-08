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
  }
})

module.exports = Bill = mongoose.model('Bill', BillSchema);