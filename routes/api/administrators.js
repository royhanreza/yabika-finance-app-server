const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const verify = require('../../middleware/verify');
const Administrator = require('../../models/Administrator');

// Method: GET
// URI: /api/majors
// Desc: Get All Majors
router.get('/', (req, res) => {
  Administrator.find()
    .then(administrators => res.json(administrators))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  Administrator.findOne({_id})
    .then(administrator => res.json(administrator))
})

// Method: POST
// URI: /api/majors
// Desc: Create Major
router.post('/', async (req, res) => {
  const { nip, name, access_rights, position, address, username, email, password, phone } = req.body;

  const usernameExist = await Administrator.findOne({ username });
  if(usernameExist) return res.status(400).send({msg: 'Username or Email already exist'});

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
router.put('/:id', async (req, res) => {
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

// Method: DELETE
// URI: /api/majors/{id}
// Desc: Delete Major
router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    await Administrator.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;