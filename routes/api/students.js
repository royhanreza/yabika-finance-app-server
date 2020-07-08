const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('../../middleware/verify');
const Student = require('../../models/Student');
const Bill = require('../../models/Bill');
const Payment = require('../../models/Payment');
const Transaction = require('../../models/Transaction');

// Method: GET
// URI: /api/students
// Desc: Get All Students
router.get('/', verify, (req, res) => {
  Student.find()
    .then(students => res.json(students))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', verify, (req, res) => {
  const _id = req.params.id;
  Student.findOne({_id})
    .then(student => res.json(student))
})

router.get('/login/data', verify, (req, res) => {
  Student.findById(req.student.id).populate('student_class')
    .then(student => res.json(student))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id/bills', verify, (req, res) => {
  const _id = req.params.id;
  Bill.find({student: _id}).populate('type_of_payment').populate('school_year')
    .then(bills => res.json(bills))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Student Bills Based on type of payment
router.get('/:studentId/bills/type-of-payments/:typeOfPaymentId', verify, (req, res) => {
  const studentId = req.params.studentId;
  const typeOfPaymentId = req.params.typeOfPaymentId;
  Bill.find({student: studentId, type_of_payment: typeOfPaymentId}).populate('type_of_payment').populate('school_year')
    .then(bills => res.json(bills))
})

router.get('/:studentId/history', async (req, res) => {
  const studentId = req.params.studentId;
  Transaction.find({student: studentId, completed: 1})
    .populate('payment_method')
    .sort({'date': -1})
    .then(payment => res.json(payment))
})

router.get('/:studentId/transactions', async (req, res) => {
  const studentId = req.params.studentId;
  Transaction.find({student: studentId})
    .populate('payment_method')
    .sort({'date': -1})
    .then(transaction => res.json(transaction))
})

router.get('/:studentId/payments', async (req, res) => {
  const studentId = req.params.studentId;
  Payment.find({student: studentId})
    .populate('payment_method')
    .populate('school_year')
    .populate('type_of_payment')
    .sort({'date': -1})
    .then(payment => res.json(payment))
})


// Method: POST
// URI: /api/students
// Desc: Create New Student
router.post('/', async (req, res) => {

  const {
    nis,
    name,
    place_of_birth,
    date_of_birth,
    religion,
    student_class,
    major,
    status,
    wali,
    year_of_entry,
    address,
    transportation,
    transportation_location,
    username,
    email,
    password,
    phone,
    photo,
    expo_push_token
  } = req.body;

  const nisExist = await Student.findOne({ nis });
  if(nisExist) return res.status(400).send({msg: 'NIS already exist'});

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt);

  const student = new Student({
    nis, 
    name, 
    place_of_birth, 
    date_of_birth, 
    religion,
    student_class, 
    major, 
    status, 
    wali, 
    year_of_entry, 
    address, 
    transportation, 
    transportation_location, 
    username, 
    email, 
    password: hashPassword, 
    phone, 
    photo, 
    expo_push_token
  })

  try {
    const newStudent = await student.save();
    res.send({student: newStudent})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/students/{id}
// Desc: Update Student
router.put('/:id', async (req, res) => {
  const {
    nis,
    name,
    place_of_birth,
    date_of_birth,
    religion,
    student_class,
    major,
    status,
    wali,
    year_of_entry,
    address,
    transportation,
    transportation_location,
    username,
    email,
    password,
    phone,
    photo,
    expo_push_token
  } = req.body;
  const _id = req.params.id;

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    const newStudent = await Student.findOneAndUpdate({_id}, { 
      nis,
      name,
      place_of_birth,
      date_of_birth,
      religion,
      student_class,
      major,
      status,
      wali,
      year_of_entry,
      address,
      transportation,
      transportation_location,
      username,
      email,
      password: hashPassword,
      phone,
      photo,
      expo_push_token }, 
      {new: true});
    res.send({student: newStudent})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: DELETE
// URI: /api/students/{id}
// Desc: Delete Student
router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    await Student.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PATCH
// URI: /api/students/{id}
// Desc: Update Student
router.patch('/:id', verify, async (req, res) => {
  const _id = req.params.id;
  try {
    const newStudent = await Student.findOneAndUpdate({_id}, req.body, 
      {new: true});
    res.send({student: newStudent})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: POST
// URI: /api/students/login
// Desc: Login Student
router.post('/login', async (req, res) => {
  const { identity, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;
  // Simple validation
  // if(!email || !password) {
  //   return res.status(400).json({msg: 'Please enter all fields'})
  // }

  const student = await Student.findOne({$or: [{username: identity}, {email: identity}]}).populate('student_class');
  if(!student) return res.status(400).send({msg: 'Username atau password salah'});

  // password is correct
  const studentPassword = await bcrypt.compare(password, student.password);
  if(!studentPassword) return res.status(400).send({msg: 'Username atau password salah'});

  const token = jwt.sign({id: student._id}, JWT_SECRET, {expiresIn: '1d'});

  // res.header('x-auth-token', token).send({token, user})
  res.json({token, student})
})

router.get('/find/:identity', async(req, res) => {
  const email = req.params.identity;
  const username = req.params.identity;
  Student.findOne({$or: [{username}, {email}]})
    .then(student => res.json(student))
})

module.exports = router;