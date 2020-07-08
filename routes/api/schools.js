const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const School = require('../../models/School');

// Method: GET
// URI: /api/majors
// Desc: Get All Majors
router.get('/', (req, res) => {
  School.find()
    .then(schools => res.json(schools))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  School.findOne({_id})
    .then(school => res.json(school))
})

// Method: POST
// URI: /api/majors
// Desc: Create Major
router.post('/', async (req, res) => {
  const { npsn, name, address, city, province } = req.body;

  const nameExist = await School.findOne({ name });
  if(nameExist) return res.status(400).send({msg: 'School already exist'});

  const school = new School({ npsn, name, address, city, province })

  try {
    const newSchool = await school.save();
    res.send({school: newSchool})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/majors/{id}
// Desc: Update Major
router.put('/:id', async (req, res) => {
  const {npsn, name, address, city, province} = req.body;
  const _id = req.params.id;
  try {
    const newSchool = await School.findOneAndUpdate({_id}, { npsn, name, address, city, province }, {new: true});
    res.send({school: newSchool})
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
    await School.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;