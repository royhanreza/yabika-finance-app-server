const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const TypeOfPayment = require('../../models/TypeOfPayment');

// Method: GET
// URI: /api/type-of-payments
// Desc: Get All Type Of Payments
router.get('/', (req, res) => {
  TypeOfPayment.find().populate('payment_type')
    .then(typeOfPayments => res.json(typeOfPayments))
})

// Method: GET
// URI: /api/type-of-payments
// Desc: Get All Type Of Payments
router.get('/type/monthly', (req, res) => {
  TypeOfPayment.find({payment_type: '5efef33565338931b43c8098'}).populate('payment_type')
    .then(typeOfPayments => res.json(typeOfPayments))
})

// Method: GET
// URI: /api/type-of-payments
// Desc: Get All Type Of Payments
router.get('/type/non-monthly', (req, res) => {
  TypeOfPayment.find({payment_type: '5efef33d65338931b43c8099'}).populate('payment_type')
    .then(typeOfPayments => res.json(typeOfPayments))
})

// Method: GET
// URI: /api/type-of-payments/{id}
// Desc: Get Type Of Payment By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  TypeOfPayment.findOne({_id})
    .then(typeOfPayment => res.json(typeOfPayment))
})

// Method: POST
// URI: /api/type-of-payments
// Desc: Create Type Of Payment
router.post('/', async (req, res) => {
  const { name, payment_type, cost } = req.body;

  const nameExist = await TypeOfPayment.findOne({ name });
  if(nameExist) return res.status(400).send({msg: 'Name type of payment already exist'});

  const typeOfPayment = new TypeOfPayment({ name, payment_type, cost })

  try {
    const newTypeOfPayment = await typeOfPayment.save();
    res.send({typeOfPayment: newTypeOfPayment})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/type-of-payments/{id}
// Desc: Update Type Of Payment
router.put('/:id', async (req, res) => {
  const { name, payment_type, cost } = req.body;
  const _id = req.params.id;
  try {
    const newTypeOfPayment = await TypeOfPayment.findOneAndUpdate({_id}, {name, payment_type, cost}, {new: true});
    res.send({typeOfPayment: newTypeOfPayment})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: DELETE
// URI: /api/type-of-payments/{id}
// Desc: Delete Type Of Payment
router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    await TypeOfPayment.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;