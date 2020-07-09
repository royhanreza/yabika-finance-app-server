const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const Bill = require('../../models/Bill');

// Method: GET
// URI: /api/majors
// Desc: Get All Majors
router.get('/', (req, res) => {
  Bill.find()
    .then(bills => res.json(bills))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  Bill.findOne({_id})
    .then(bill => res.json(bill))
})

// Method: POST
// URI: /api/majors
// Desc: Create Major
router.post('/', async (req, res) => {
  const { student, type_of_payment, month, school_year, cost } = req.body;

  const studentExist = await Bill.findOne({ student });
  const typeOfPaymentExist = await Bill.findOne({ type_of_payment });
  const monthExist = await Bill.findOne({ month });
  const schoolYearExist = await Bill.findOne({ school_year });
  if(studentExist && typeOfPaymentExist && monthExist && schoolYearExist) return res.status(400).send({msg: 'Bill already exist'});

  const bill = new Bill({ student, type_of_payment, month, school_year, cost })

  try {
    const newBill = await bill.save();
    res.send({bill: newBill})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/majors/{id}
// Desc: Update Major
router.put('/:id', async (req, res) => {
  const {student, type_of_payment, month, school_year, cost} = req.body;
  const _id = req.params.id;
  try {
    const newBill = await Bill.findOneAndUpdate({_id}, {student, type_of_payment, month, school_year, cost}, {new: true});
    res.send({bill: newBill})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/majors/{id}
// Desc: Update Major
router.patch('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const newBill = await Bill.findOneAndUpdate({_id}, req.body, {new: true});
    res.send({bill: newBill})
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
    await Bill.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})

router.post('/update/many', async (req, res) => {
  const billIds = ['5f002b756d4fdb025009a635', '5f002b796d4fdb025009a636']
  try {
    const response = await Bill.updateMany({ _id: billIds }, { transaction_number: 'changed2' });
    res.send(response);
  } catch (error) {
    res.status(400).send(error);
  }
})


module.exports = router;