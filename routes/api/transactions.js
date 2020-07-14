const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const Transaction = require('../../models/Transaction');
const util = require('../../resources/utils')

router.get('/', (req, res) => {
  Transaction.find().populate('student').populate('payment_method')
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
  // const { payment, payment_method, order_id, transaction_number, method, amount, canceled_at, approved_at, denied_at, refunded_at, expire_at, total } = req.body;

  // try {
  //   const newMajor = await major.save();
  //   const newArr = randomArray.map(arr => newMajor._id)
  //   const transaction = new Transaction({ payments: {payment: newArr}, payment_method, order_id, transaction_number, method, amount, canceled_at, approved_at, denied_at, refunded_at, expire_at, total })

  //   const newTransaction = await transaction.save()
  //   res.send({transaction: newTransaction, major: newMajor})
    
  // } catch(error) {
  //   res.status(400).send(error);
  // }

  try {
    const billResponse = await Bill.updateMany({ _id: req.body.selectedBills }, { transaction_number: req.body.paymentRequest[0].transaction_number, status: 2 });
    const payments = await Payment.insertMany(req.body.paymentRequest);
    // const tomorrow = util.getTomorrowTime(response.transaction_time)

    const populatedPayments = payments.map(async (p) => await Payment.findById(p._id).populate('payment_method').populate('school_year').populate('type_of_payment'))
    Promise.all(populatedPayments).then( async (result) => {
      const finalRes = [];
      result.forEach( element => {
        finalRes.push({
          _id: element._id,
          student: element.student,
        //   payment_method: {
        //     image: element.payment_method.image,
        //     _id:  element.payment_method._id,
        //     name:  element.payment_method.name,
        //     transaction_fee_type:  element.payment_method.transaction_fee_type,
        //     transaction_fee:  element.payment_method.transaction_fee,
        //     __v:  element.payment_method.__v,
        //     midtrans_payment_type: element.payment_method.midtrans_payment_type,
        //     bank: element.payment_method.bank
        // },
          month: element.month,
          school_year: {
            _id: element.school_year._id,
            name: element.school_year.name,
            yearStart: element.school_year.yearStart,
            yearEnd: element.school_year.yearEnd,
            __v: element.school_year.__v
          },
          type_of_payment: {
            _id: element.type_of_payment._id,
            name: element.type_of_payment.name,
            payment_type: element.type_of_payment.payment_type,
            cost: element.type_of_payment.cost,
            __v: element.type_of_payment.__v
          },
          transaction_number: element.transaction_number,
          method: element.method,
          amount: element.amount,
          created_at: element.created_at,
          __v: element.__v
            
        })
      });
      const transaction = new Transaction({ 
        ...req.body.transactionRequest, 
        paymentsDetails: finalRes, 
        // order_id: response.order_id, 
        // midtrans_transaction_id: response.transaction_id, 
        // created_at: response.transaction_time,
        // expire_at: tomorrow,
        // va_number: response.va_numbers[0].va_number
      })
      const newTransaction = await transaction.save().then(t => t.populate('payment_method').execPopulate())
      res.send({payments, transaction: newTransaction, billResponse})
    })
    
  } catch(error) {
    res.status(400).send(error);
  }

  // res.send(req.body)

})

module.exports = router;