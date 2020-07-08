const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const PaymentMethod = require('../../models/PaymentMethod');
const { route } = require('./typeOfPayments');

// Method: GET
// URI: /api/payment-methods
// Desc: Get All Payment Methods
router.get('/', (req, res) => {
  PaymentMethod.find()
    .then(paymentMethods => res.json(paymentMethods))
})

// Method: GET
// URI: /api/payment-methods/{id}
// Desc: Get Payment Method By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  PaymentMethod.findOne({_id})
    .then(paymentMethod => res.json(paymentMethod))
})

// Method: POST
// URI: /api/payment-methods
// Desc: Create Payment Method
router.post('/', async (req, res) => {
  const { name, transaction_fee_type, transaction_fee, image } = req.body;

  const nameExist = await PaymentMethod.findOne({ name });
  if(nameExist) return res.status(400).send({msg: 'Payment method already exist'});

  const paymentMethod = new PaymentMethod({ name, transaction_fee_type, transaction_fee, image })

  try {
    const newPaymentMethod = await paymentMethod.save();
    res.send({paymentMethod: newPaymentMethod})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/payment-methods/{id}
// Desc: Update Payment Method
router.put('/:id', async (req, res) => {
  const { name, transaction_fee_type, transaction_fee, image } = req.body;
  const _id = req.params.id;
  try {
    const newPaymentMethod = await PaymentMethod.findOneAndUpdate({_id}, {name, transaction_fee_type, transaction_fee, image}, {new: true});
    res.send({paymentMethod: newPaymentMethod})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/payment-methods/{id}
// Desc: Update Payment Method
router.patch('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const newPaymentMethod = await PaymentMethod.findOneAndUpdate({_id}, req.body, {new: true});
    res.send({paymentMethod: newPaymentMethod})
  } catch(error) {
    res.status(400).send(error);
  }
})


// Method: DELETE
// URI: /api/payment-methods/{id}
// Desc: Delete Payment Method
router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    await PaymentMethod.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;