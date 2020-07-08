const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const Transaction = require('../../models/Transaction');
const util = require('../../resources/utils')

router.get('/', (req, res) => {
  Transaction.find()
    .then(transaction => res.json(transaction))
})

router.get('/:id', (req, res) => {
  Transaction.findById(req.params.id).populate('payments.payment')
    .then(transaction => res.json(transaction))
})
router.get('/without-populate/:id', (req, res) => {
  Transaction.findById(req.params.id)
    .then(transaction => res.json(transaction))
})

router.post('/', async (req, res) => {
  const { payment, payment_method, order_id, transaction_number, method, amount, canceled_at, approved_at, denied_at, refunded_at, expire_at, total, name, allias } = req.body;


  const major = new Major({ name, allias })

  const randomArray = [1,2,3,4,5]

  try {
    const newMajor = await major.save();
    // res.send({major: newMajor})
    const newArr = randomArray.map(arr => newMajor._id)
    const transaction = new Transaction({ payments: {payment: newArr}, payment_method, order_id, transaction_number, method, amount, canceled_at, approved_at, denied_at, refunded_at, expire_at, total })

    const newTransaction = await transaction.save()
    res.send({transaction: newTransaction, major: newMajor})
    
  } catch(error) {
    res.status(400).send(error);
  }

  // try {
    
   
    
  // } catch(error) {
  //   res.status(400).send(error);
  // }
})

module.exports = router;