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
  Student.find().populate('student_class').populate('transportation_location')
    .then(students => res.json(students))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', verify, (req, res) => {
  const _id = req.params.id;
  try {
    Student.findOne({_id}).populate('student_class').populate('transportation_location')
    .then(student => res.json(student))
  } catch (error) {
    res.status(400).send('Siswa tidak ditemukan')
  }
})

router.get('/login/data', verify, (req, res) => {
  Student.findById(req.user.id).populate('student_class').populate('transportation_location')
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

router.get('/:studentId/history', verify, async (req, res) => {
  const studentId = req.params.studentId;
  Transaction.find({student: studentId, completed: 1})
    .populate('payment_method')
    .sort({'completed_at': -1})
    .then(payment => res.json(payment))
})

router.get('/:studentId/transactions', verify, async (req, res) => {
  const studentId = req.params.studentId;
  Transaction.find({student: studentId})
    .populate('payment_method')
    .sort({'created_at': -1})
    .then(transaction => res.json(transaction))
})

router.get('/:studentId/payments', verify, async (req, res) => {
  const studentId = req.params.studentId;
  Payment.find({student: studentId})
    .populate('payment_method')
    .populate('school_year')
    .populate('type_of_payment')
    .sort({'date': -1})
    .then(payment => res.json(payment))
})

router.get('/:studentId/pay-data', verify, async (req, res) => {
  const studentId = req.params.studentId;
  const student = await Student.findOne({_id: studentId})
    .populate('student_class')
    .populate('major')
    .populate('transportation_location')

  const bills = await Bill.find({student: studentId, status: 0}).populate('type_of_payment').populate('school_year').sort({month: 'asc'})

  res.send({student, bills})
})


// Method: POST
// URI: /api/students
// Desc: Create New Student
router.post('/', verify, async (req, res) => {

  // res.send(req.body)

  const {
    nis,
    name,
    place_of_birth,
    date_of_birth,
    gender,
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
  const emailExist = await Student.findOne({ email });
  if(nisExist) return res.status(400).send({msg: 'Siswa dengan NIS ' + nis + ' telah terdaftar'});
  if(emailExist) return res.status(400).send({msg: 'Email ' + email + ' telah terdaftar, gunakan email yang berbeda'});

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt);

  const student = new Student({
    nis, 
    name, 
    place_of_birth, 
    date_of_birth, 
    gender,
    religion,
    student_class, 
    major, 
    status, 
    wali, 
    year_of_entry, 
    address, 
    transportation, 
    transportation_location,
    init_username: username, 
    username, 
    email,
    init_password: password, 
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

// Method: POST
// URI: /api/students
// Desc: Create New Student
router.post('/actions/insert-many', verify, async (req, res) => {
  const students = req.body.students;
  const finalStudents = await Promise.all(students.map( async (student) => {
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(student.password, salt);
    return {
      ...student,
      init_username: student.username,
      init_password: student.password, 
      password: hashPassword
   }
  })) 

  // res.send(finalStudents)
  // for(let i = 0; i < students; i++) {

  // }

  // res.send(req.body)

  // const {
  //   nis,
  //   name,
  //   place_of_birth,
  //   date_of_birth,
  //   gender,
  //   religion,
  //   student_class,
  //   major,
  //   status,
  //   wali,
  //   year_of_entry,
  //   address,
  //   transportation,
  //   transportation_location,
  //   username,
  //   email,
  //   password,
  //   phone,
  //   photo,
  //   expo_push_token
  // } = req.body;

  // // const nisExist = await Student.findOne({ nis });
  // // const emailExist = await Student.findOne({ email });
  // // if(nisExist) return res.status(400).send({msg: 'Siswa dengan NIS ' + nis + ' telah terdaftar'});
  // // if(emailExist) return res.status(400).send({msg: 'Email ' + email + ' telah terdaftar, gunakan email yang berbeda'});

  // const salt = await bcrypt.genSalt(10)
  // const hashPassword = await bcrypt.hash(password, salt);

  // const student = new Student({
  //   nis, 
  //   name, 
  //   place_of_birth, 
  //   date_of_birth, 
  //   gender,
  //   religion,
  //   student_class, 
  //   major, 
  //   status, 
  //   wali, 
  //   year_of_entry, 
  //   address, 
  //   transportation, 
  //   transportation_location,
  //   init_username: username, 
  //   username, 
  //   email,
  //   init_password: password, 
  //   password: hashPassword, 
  //   phone, 
  //   photo, 
  //   expo_push_token
  // })

  try {
    const insertedStudents = await Student.insertMany(finalStudents, { ordered: false });
    // const newStudent = await student.save();
    res.send({student: insertedStudents.length})
  } catch(error) {
    console.log(error)
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/students/{id}
// Desc: Update Student
router.put('/:id', verify, async (req, res) => {
  const {
    nis,
    name,
    place_of_birth,
    date_of_birth,
    gender,
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
      gender,
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
router.delete('/:id', verify, async (req, res) => {
  const _id = req.params.id;

  try {
    await Student.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


router.post('/actions/delete-many', verify, async (req, res) => {
  const ids = req.body.ids
  try {
    const deletedStudents = await Student.deleteMany({_id: ids});
    res.send(deletedStudents);
  } catch (error) {
    res.status(400).send(error)
  }
})

// Method: PATCH
// URI: /api/students/{id}
// Desc: Update Student
router.patch('/:id', verify, async (req, res) => {
  const _id = req.params.id;

  const { old_nis, old_email, nis, email } = req.body


  if(nis !== old_nis) {
    const nisExist = await Student.findOne({ nis });
    if(nisExist) return res.status(400).send({msg: 'Siswa dengan NIS ' + nis + ' telah terdaftar'});
  }

  if(email !== old_email) {
    const emailExist = await Student.findOne({ email });
    if(emailExist) return res.status(400).send({msg: 'Email ' + email + ' telah terdaftar, gunakan email yang berbeda'});
  }
  
  try {
    const newStudent = await Student.findOneAndUpdate({_id}, req.body, 
      {new: true});
    res.send({student: newStudent})
  } catch(error) {
    res.status(400).send(error);
  }
})

router.patch('/:id/actions/edit-account', verify, async (req, res) => {
  const _id = req.params.id;
  const { username, email, currentPassword, newPassword, isNewUsername, isNewEmail, isNewPassword, oldUsername, oldEmail } = req.body
  
  
  // TODO REQ.BODY
  // CHECK PASSWORD
  const student = await Student.findOne({$or: [{username: oldUsername}, {email: oldEmail}]});
  if(!student) return res.status(400).send({msg: 'User tidak ditemukan'});

  const studentPassword = await bcrypt.compare(currentPassword, student.password);
  if(!studentPassword) return res.status(400).send({msg: 'Password salah'});

  // CHECK SIMILAR USERNAME
  if(isNewUsername) {
    const usernameExist = await Student.findOne({ username });
    if(usernameExist) return res.status(400).send({msg: 'Username telah digunakan'});
  }

  // CHECK SIMILAR EMAIL
  if(isNewEmail) {
    const emailExist = await Student.findOne({ email });
    if(emailExist) return res.status(400).send({msg: 'Email telah digunakan'});
  }

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(newPassword, salt);

  const reqBody = (isNewPassword) ? { username, email, password: hashPassword } : { username, email }

  // res.send(reqBody)
  try {
    const newStudent = await Student.findOneAndUpdate({_id}, reqBody, 
      {new: true});
    const studentData = await Student.findById(newStudent._id).populate('student_class').populate('transportation_location');
    res.send({student: studentData})
  } catch(error) {
    res.status(400).send(error);
  }

})

router.patch('/:id/actions/save-expo-push-token', async (req, res) => {
  const _id = req.params.id;
  const expo_push_token= req.body.expo_push_token;
  try {
    const updatedStudent = await Student.findOneAndUpdate({ _id }, {expo_push_token}, {new: true});
    res.send(updatedStudent);
  } catch (error) {
    res.status(400).send(error)
  }
  // res.send({_id, expo_push_token})
})

router.patch('/:id/actions/update-expo-push-token', async (req, res) => {
  const _id = req.params.id;
  const expo_push_token= req.body.expo_push_token;
  try {
    const updatedStudent = await Student.findOneAndUpdate({ _id }, {expo_push_token}, {new: true});
    res.send(updatedStudent);
  } catch (error) {
    res.status(400).send(error)
  }
  // res.send({_id, expo_push_token})
})

router.patch('/actions/graduate', verify, async (req, res) => {
  const ids = req.body.ids;
  try {
    const updatedStudent = await Student.updateMany({_id: ids}, { status: 2 });
    res.send(updatedStudent)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.patch('/actions/grade-promote', verify, async (req, res) => {
  const ids = req.body.ids;
  const nextClassId = req.body.nextClassId;
  try {
    const updatedStudent = await Student.updateMany({_id: ids}, { student_class: nextClassId });
    res.send(updatedStudent)
  } catch (error) {
    res.status(400).send(error)
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

  const student = await Student.findOne({$or: [{username: identity}, {email: identity}]}).populate('student_class').populate('transportation_location');
  if(!student) return res.status(400).send({msg: 'Username atau password salah'});

  // password is correct
  const studentPassword = await bcrypt.compare(password, student.password);
  if(!studentPassword) return res.status(400).send({msg: 'Username atau password salah'});

  const token = jwt.sign({id: student._id}, JWT_SECRET, {expiresIn: '1d'});

  // res.header('x-auth-token', token).send({token, user})
  res.json({token, user: student})
})

router.get('/find/:identity', async(req, res) => {
  const email = req.params.identity;
  const username = req.params.identity;
  Student.findOne({$or: [{username}, {email}]})
    .then(student => res.json(student))
})

module.exports = router;