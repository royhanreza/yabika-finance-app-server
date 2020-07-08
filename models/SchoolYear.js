const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const SchoolYearSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  yearStart: {
    type: Number,
    required: true,
  },
  yearEnd: {
    type: Number,
    required: true,
  }
})

module.exports = SchoolYear = mongoose.model('SchoolYear', SchoolYearSchema);