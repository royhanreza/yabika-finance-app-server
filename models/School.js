const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const SchoolSchema = new Schema({
  npsn: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  province: {
    type: String,
  }
})

module.exports = School = mongoose.model('School', SchoolSchema);