const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TransportationLocationSchema = new Schema({
  location: {
    type: String,
    required: true,
  },
  cost: { // ex: SMP, SMA, dll
    type: Number,
    required: true
  },
})

module.exports = TransportationLocation = mongoose.model('TransportationLocation', TransportationLocationSchema);