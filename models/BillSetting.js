const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const BillSettingSchema = new Schema({
  automate: {
    type: Number,
    required: true,
  },
  mi_cost: {
    type: Number,
    required: true,
  },
  mts_cost: {
    type: Number,
    required: true,
  },
  ma_cost: {
    type: Number,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = BillSetting = mongoose.model('BillSetting', BillSettingSchema);