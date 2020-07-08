const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const AdministratorSchema = new Schema({
  nip: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  access_rights: { // 1: Super Admin, 0: Regular Admin
    type: Number,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  }
})

module.exports = Administrator = mongoose.model('Administrator', AdministratorSchema);