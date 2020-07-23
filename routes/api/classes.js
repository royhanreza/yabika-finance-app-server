const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const Class = require('../../models/Class');

// Method: GET
// URI: /api/classes
// Desc: Get All Classes
router.get('/', (req, res) => {
  Class.find().sort('name')
    .then(classes => res.json(classes))
})

// Method: GET
// URI: /api/classes/{id}
// Desc: Get Class By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  Class.findOne({_id})
    .then(studentClass => res.json(studentClass))
})

// Method: POST
// URI: /api/classes
// Desc: Create Class
router.post('/', async (req, res) => {
  const { name, grade } = req.body;

  const classExist = await Class.findOne({ name });
  if(classExist) return res.status(400).send({msg: 'Kelas telah terdaftar'});

  const studentClass = new Class({ name, grade })

  try {
    const newClass = await studentClass.save();
    res.send({class: newClass})
  } catch(error) {
    res.status(400).send(error);
  }
})

router.post('/actions/delete-many', async (req, res) => {
  const ids = req.body.ids
  try {
    const deletedClass = await Class.deleteMany({_id: ids});
    res.send(deletedClass);
  } catch (error) {
    res.status(400).send(error)
  }
})

// Method: PUT
// URI: /api/classes/{id}
// Desc: Update Class
router.put('/:id', async (req, res) => {
  const {name, grade} = req.body;
  const _id = req.params.id;
  try {
    const newClass = await Class.findOneAndUpdate({_id}, {name, grade}, {new: true});
    res.send({class: newClass})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/classes/{id}
// Desc: Update Class
router.patch('/:id', async (req, res) => {
  const _id = req.params.id;

  const name = req.body.name;

  const classExist = await Class.findOne({ name });
  if(classExist) return res.status(400).send({msg: 'Kelas telah terdaftar'});

  try {
    const newClass = await Class.findOneAndUpdate({_id}, req.body, {new: true});
    res.send({class: newClass})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: DELETE
// URI: /api/classes/{id}
// Desc: Delete Class
router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    // await Class.findOneAndUpdate({_id}, {name, grade}, {new: true});
    await Class.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;