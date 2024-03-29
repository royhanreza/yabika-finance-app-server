const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  grade: { // ex: SMP, SMA, dll
    type: String,
    required: true
  },
})

module.exports = Class = mongoose.model('Class', ClassSchema);