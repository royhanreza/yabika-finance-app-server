const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const d = new Date();
const currentYear = d.getFullYear();

const StudentSchema = new Schema({
  nis: {
    type: String,
    required: true,
    unique: true,
  },
  nisn: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  place_of_birth: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
    default: Date.now,
  },
  gender: {
    type: String,
    required: true,
  },
  religion: {
    type: String,
    required: true,
    default: 'Islam'
  },
  student_class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    // required: true,
  },
  major: { // jurusan
    type: Schema.Types.ObjectId,
    ref: 'Major',
  },
  status: { // 0: Berhenti 1: Aktif 2: Lulus
    type: Number,
    required: true, 
    default: 1,
  },
  wali: {
    type: String,
  },
  year_of_entry: { // tahun masuk
    type: Number,
    required: true,
    default: currentYear,
  },
  address: {
    type: String,
    required: true,
  },
  transportation: { // 0: Tidak menggunakan transportasi , 1: Menggunakan transportasi
    type: Number,
    required: true,
    default: 0,
  },
  transportation_location: {
    type: Schema.Types.ObjectId,
    ref: 'TransportationLocation',
  },
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    sparse: true
  },
  init_username: {
    type: String,
  },
  init_password: {
    type: String,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
  },
  photo: {
    type: String,
    default: 'student-placeholder.png'
  },
  expo_push_token: {
    type: String,
  }
})

module.exports = Student = mongoose.model('Student', StudentSchema);