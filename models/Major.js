const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MajorSchema = new Schema({
  name: { // ex: ilmu Pengetahuan Alam
    type: String,
    required: true,
  },
  allias: { // ex: IPA, IPS
    type: String
  },
})

module.exports = Major = mongoose.model('Major', MajorSchema);