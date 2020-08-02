const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const verify = require('../../middleware/verify');
const verifyAdmin = require('../../middleware/verifyAdmin');
const Administrator = require('../../models/Administrator');
const jwt = require('jsonwebtoken')

// Method: GET
// URI: /api/majors
// Desc: Get All Majors
router.get('/', verify, (req, res) => {
  Administrator.find()
    .then(administrators => res.json(administrators))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', verify, (req, res) => {
  const _id = req.params.id;
  Administrator.findOne({_id})
    .then(administrator => res.json(administrator))
})

// Method: POST
// URI: /api/majors
// Desc: Create Major
router.post('/', verify, async (req, res) => {
  const { nip, name, access_rights, position, address, username, email, password, phone } = req.body;

  const usernameExist = await Administrator.findOne({ username });
  if(usernameExist) return res.status(400).send({msg: 'Username telah digunakan'});

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt);

  const administrator = new Administrator({ nip, name, access_rights, position, address, username, email, password: hashPassword, phone })

  try {
    const newAdministrator = await administrator.save();
    res.send({administrator: newAdministrator})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/majors/{id}
// Desc: Update Major
router.put('/:id', verify, async (req, res) => {
  const { nip, name, access_rights, position, address, username, email, password, phone } = req.body;
  const _id = req.params.id;

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    const newAdministrator = await Administrator.findOneAndUpdate({_id}, { nip, name, access_rights, position, address, username, email, password: hashPassword, phone }, {new: true});
    res.send({administrator: newAdministrator})
  } catch(error) {
    res.status(400).send(error);
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;
  // Simple validation
  // if(!email || !password) {
  //   return res.status(400).json({msg: 'Please enter all fields'})
  // }

  const admin = await Administrator.findOne({$or: [{username: username}, {email: username}]})
  if(!admin) return res.status(400).send({msg: 'Username atau password salah'});

  // password is correct
  const adminPassword = await bcrypt.compare(password, admin.password);
  if(!adminPassword) return res.status(400).send({msg: 'Username atau password salah'});

  const token = jwt.sign({id: admin._id}, JWT_SECRET, {expiresIn: '1d'});

  // res.header('x-auth-token', token).send({token, user})
  res.json({token, user: admin})
})

router.get('/login/data', verify, (req, res) => {
  Administrator.findById(req.user.id)
    .then(admin => res.json(admin))
})

router.patch('/:id', async (req, res) => {
  const _id = req.params.id;

  const { old_password, new_password } = req.body;

  let request = req.body;

  if(new_password !== undefined) {
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(new_password, salt);
    request = {...req.body, password: hashPassword}
  }

  if(req.body.isNewUsername) {
    const usernameExist = await Administrator.findOne({ username: req.body.username })
    if(usernameExist) {
      return res.status(400).send({msg: 'Username telah digunakan'});
    } else {
      request = {...req.body, username: req.body.username}
    }
    
  }

  const admin = await Administrator.findById(_id)
  
  const adminPassword = await bcrypt.compare(old_password, admin.password);
  if(!adminPassword) return res.status(400).send({msg: 'Password salah'});

  try {
    const newAdministrator = await Administrator.findOneAndUpdate({_id}, request, {new: true});
    res.send({administrator: newAdministrator})
  } catch(error) {
    res.status(400).send(error);
  }
})

router.patch('/actions/edit-administrator/:id', verify, async (req, res) => {
  const _id = req.params.id;

  try {
    const newAdministrator = await Administrator.findOneAndUpdate({_id}, req.body, {new: true});
    res.send({administrator: newAdministrator})
  } catch(error) {
    res.status(400).send(error);
  }
})
// Method: DELETE
// URI: /api/majors/{id}
// Desc: Delete Major
router.delete('/:id', verify, async (req, res) => {
  const _id = req.params.id;
  try {
    await Administrator.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;