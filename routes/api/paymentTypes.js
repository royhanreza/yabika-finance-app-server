const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const PaymentType = require('../../models/PaymentType');
const { route } = require('./payments');

// Method: GET
// URI: /api/payment-types
// Desc: Get All Payment Types
router.get('/', verify, (req, res) => {
  PaymentType.find()
    .then(paymentTypes => res.json(paymentTypes))
})

// Method: GET
// URI: /api/payment-types/{id}
// Desc: Get Payment Type By Id
router.get('/:id', verify, (req, res) => {
  const _id = req.params.id;
  PaymentType.findOne({_id})
    .then(paymentType => res.json(paymentType))
})

// Method: POST
// URI: /api/payment-types
// Desc: Create Payment Type
router.post('/', verify, async (req, res) => {
  const { name } = req.body;

  const paymentTypeExist = await PaymentType.findOne({ name: name.toLowerCase() });
  if(paymentTypeExist) return res.status(400).send({msg: 'Tipe pembayaran sudah ada'});

  const paymentType = new PaymentType({ name: name.toLowerCase() })

  try {
    const newPaymentType = await paymentType.save();
    res.send({paymentType: newPaymentType})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/payment-types/{id}
// Desc: Update Payment Type
router.put('/:id', verify, async (req, res) => {
  const {name} = req.body;
  const _id = req.params.id;
  try {
    const newPaymentType = await PaymentType.findOneAndUpdate({_id}, {name}, {new: true});
    res.send({paymentType: newPaymentType})
  } catch(error) {
    res.status(400).send(error);
  }
})

router.patch('/:id', verify, async (req, res) => {
  const _id = req.params.id;

  if(req.body.isNewName) {
    const paymentTypeExist = await PaymentType.findOne({ name: req.body.name.toLowerCase() });
    if(paymentTypeExist) return res.status(400).send({msg: 'Tipe pembayaran sudah ada'});
  }

  try {
    const newPaymentType = await PaymentType.findOneAndUpdate({_id}, req.body, {new: true});
    res.send({paymentType: newPaymentType})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: DELETE
// URI: /api/payment-types/{id}
// Desc: Delete Payment Type
router.delete('/:id', verify, async (req, res) => {
  const _id = req.params.id;
  try {
    await PaymentType.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;