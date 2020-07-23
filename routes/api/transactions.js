const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const Transaction = require('../../models/Transaction');
const Payment = require('../../models/Payment');
const Bill = require('../../models/Bill');
const util = require('../../resources/utils')

router.get('/', (req, res) => {
  Transaction.find().populate({ path: 'student', populate: { path: 'student_class' } }).populate('payment_method').sort({created_at: -1})
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

  //-------------------------------------------------------------------------------------

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
        
      })
      const newTransaction = await transaction.save().then(t => t.populate('payment_method').execPopulate())
      if(req.body.doSendSms) {
        util.sendSms('YABIKA', req.body.phone, req.body.smsText).then(response => console.log(response)).catch(error => console.log(error))
      }
      res.send({payments, transaction: newTransaction, billResponse})
    })
    
  } catch(error) {
    res.status(400).send(error);
  }

  // res.send(req.body)

})

router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const transaction = await Transaction.findById(_id);
    const paymentDetails = transaction.paymentsDetails.map(payment => payment._id);
    const deletedPayments = await Payment.deleteMany({ _id: paymentDetails });
    const updatedBill = await Bill.updateMany({ transaction_number: transaction.transaction_number }, { status: 0, transaction_number: undefined });
    const deletedTransaction = await Transaction.findByIdAndDelete(_id);
    res.send({paymentDetails, updatedBill, deletedPayments, deletedTransaction})
  } catch (error) {
    console.log(error)
  }
})

router.patch('/action/update-to-settlement', async (req, res) => {
  try {
    const updatedTransaction = await Transaction.updateMany({ method: 0 }, { transaction_status: 'settlement' });
    res.send(updatedTransaction)
  } catch (error) {
    res.status(400).send('FAIL TO UPDATE')
  }
  
})

module.exports = router;