const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const SchoolYear = require('../../models/SchoolYear');

// Method: GET
// URI: /api/school-years
// Desc: Get All School years
router.get('/', verify, (req, res) => {
  SchoolYear.find()
    .then(schoolYears => res.json(schoolYears))
})

// Method: GET
// URI: /api/school-years/{id}
// Desc: Get School Year By Id
router.get('/:id', verify, (req, res) => {
  const _id = req.params.id;
  SchoolYear.findOne({_id})
    .then(schoolYear => res.json(schoolYear))
})

// Method: POST
// URI: /api/school-years
// Desc: Create School Year
router.post('/', verify, async (req, res) => {
  const { yearStart, yearEnd } = req.body;
  const name = yearStart + '/' + yearEnd; 

  const schoolYearExist = await SchoolYear.findOne({ name });
  if(schoolYearExist) return res.status(400).send({msg: 'Tahun ajaran ' + name + ' sudah ada'});

  const schoolYear = new SchoolYear({ name, yearStart, yearEnd })

  try {
    const newSchoolYear = await schoolYear.save();
    res.send({schoolYear: newSchoolYear})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/school-years/{id}
// Desc: Update School Year
router.put('/:id', verify, async (req, res) => {
  const {name} = req.body;
  const _id = req.params.id;
  try {
    const newSchoolYear = await SchoolYear.findOneAndUpdate({_id}, {name}, {new: true});
    res.send({schoolYear: newSchoolYear})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/school-years/{id}
// Desc: Update School Year
router.patch('/:id', verify, async (req, res) => {

  const schoolYearExist = await SchoolYear.findOne({ name: req.body.name });
  if(schoolYearExist) return res.status(400).send({msg: 'Tahun ajaran ' + req.body.name + ' sudah ada'});

  const _id = req.params.id;
  try {
    const newSchoolYear = await SchoolYear.findOneAndUpdate({_id}, req.body, {new: true});
    res.send({schoolYear: newSchoolYear})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: DELETE
// URI: /api/school-years/{id}
// Desc: Delete School Year
router.delete('/:id', verify, async (req, res) => {
  const _id = req.params.id;
  try {
    await SchoolYear.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;