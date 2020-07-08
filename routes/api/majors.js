const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const Major = require('../../models/Major');
const { route } = require('./payments');

// Method: GET
// URI: /api/majors
// Desc: Get All Majors
router.get('/', (req, res) => {
  Major.find()
    .then(majors => res.json(majors))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  Major.findOne({_id})
    .then(major => res.json(major))
})

// Method: POST
// URI: /api/majors
// Desc: Create Major
router.post('/', async (req, res) => {
  const { name, allias } = req.body;

  const majorExist = await Major.findOne({ name });
  if(majorExist) return res.status(400).send({msg: 'Major already exist'});

  const major = new Major({ name, allias })

  try {
    const newMajor = await major.save();
    res.send({major: newMajor})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/majors/{id}
// Desc: Update Major
router.put('/:id', async (req, res) => {
  const {name, allias} = req.body;
  const _id = req.params.id;
  try {
    const newMajor = await Major.findOneAndUpdate({_id}, {name, allias}, {new: true});
    res.send({major: newMajor})
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
    await Major.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})

router.patch('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const newMajor = await Major.findOneAndUpdate({_id}, req.body, {new: true});
    res.send({major: newMajor})
  } catch(error) {
    res.status(400).send(error);
  }
})

// router.post('/test-inject', async (req, res) => {
//   const major = await Major.findOne({ _id: req.body.id })
//   major.tes = 'asdasds';
//   await major.save().then(resp => res.send(resp));
// })

router.post('/get/all', async (req, res) => {
  const major = await Major.findOne({ allias: req.body.allias })
  major.allias = 'tes';
  const newMajor = await major.save();
  res.send({newMajor})
})


module.exports = router;