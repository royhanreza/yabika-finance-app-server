const express = require('express');
const axios = require('axios');

const router = express.Router();
const verify = require('../../middleware/verify');
const Payment = require('../../models/Payment');
const Transaction = require('../../models/Transaction');
const midtransClient = require('midtrans-client')
const util = require('../../resources/utils');
const { response } = require('express');
const { base } = require('../../models/Transaction');
const Bill = require('../../models/Bill');
const { route } = require('./students');

const MIDTRANS_BASE_URL = (process.env.MODE == 'dev') ? 'https://api.sandbox.midtrans.com' : 'https://api.midtrans.com';

const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
})

// Method: GET
// URI: /api/majors
// Desc: Get All Majors
router.get('/', (req, res) => {
  Payment.find()
    .then(payments => res.json(payments))
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  Payment.findOne({_id})
    .then(payment => res.json(payment))
})

// Method: POST
// URI: /api/majors
// Desc: Create Major
router.post('/', async (req, res) => {
  const { student, payment_method, month, school_year, type_of_payment, administrator, transaction_number, method, amount, canceled_at, approved_at, denied_at, refunded_at, expire_at } = req.body;

  const studentExist = await Payment.findOne({ student });
  const typeOfPaymentExist = await Payment.findOne({ type_of_payment });
  const monthExist = await Payment.findOne({ month });
  const schoolYearExist = await Payment.findOne({ school_year });
  if(studentExist && typeOfPaymentExist && monthExist && schoolYearExist) return res.status(400).send({msg: 'Payment already exist'});

  const payment = new Payment({ student, payment_method, month, school_year, type_of_payment, administrator, transaction_number, method, amount, canceled_at, approved_at, denied_at, refunded_at, expire_at })

  try {
    const newPayment = await payment.save();
    res.send({payment: newPayment})
  } catch(error) {
    res.status(400).send(error);
  }
})

async function dataExist(req) {
  const { student, month, school_year, type_of_payment } = req.body;
  let index = [];
  for(let i = 0; i < req.body.length; i++) {
    const studentExist = await Payment.findOne({ student });
    const typeOfPaymentExist = await Payment.findOne({ type_of_payment });
    const monthExist = await Payment.findOne({ month });
    const schoolYearExist = await Payment.findOne({ school_year });
    if(studentExist && typeOfPaymentExist && monthExist && schoolYearExist) {
      index.push(i)
      console.log(i)
    }
  }
  return index;
}

// Method: POST
// URI: /api/majors
// Desc: Create Major
router.post('/online/checkout', async (req, res) => {

  // const response = {
  //   order_id: "123123",
  //   transaction_time: "2020-07-07T00:45:28.295Z",
  //   transaction_id: "2323"
  // }

  const midtransPaymentType = req.body.midtransPaymentType;

  core.charge(req.body.midtransRequest)
  .then( async (response) => {
    try {

      const billResponse = await Bill.updateMany({ _id: req.body.selectedBills }, { transaction_number: req.body.paymentRequest[0].transaction_number, status: 1 });
      const payments = await Payment.insertMany(req.body.paymentRequest);
      const bankTransferExpireTime = util.getTomorrowTime(response.transaction_time)
      const gopayExpireTime = util.getGopayExpireTime(response.transaction_time)
      const mandiriBillExpireTime = util.getMandiriBillExpireTime(response.transaction_time)
      const cstoreExpireTime = util.getCstoreExpireTime(response.transaction_time)

      const expireTime = (type) => {
        switch(type) {
          case 'bank_transfer':
            return bankTransferExpireTime
          case 'echannel':
            return mandiriBillExpireTime
          case 'gopay':
            return gopayExpireTime
          case 'cstore':
            return cstoreExpireTime
          default: 
            return null;
        }
      }

      const paymentTypeCode = (type) => {
        switch(type) {
          case 'bank_transfer':
            return {
              va_number: response.va_numbers[0].va_number
            }
          case 'echannel':
            return {
              biller_code: response.biller_code,
              bill_key: response.bill_key
            }
          case 'gopay':
            return {
              gopay_qr_code_url: response.actions[0].url,
              gopay_deeplink_url: response.actions[1].url,
              gopay_get_status_url: response.actions[2].url,
              gopay_cancel_url: response.actions[3].url,
            }
          case 'cstore':
            return {
              cstore_payment_code: response.payment_code
            }
          default: 
            return {};
        }
      }
  
      const populatedPayments = payments.map(async (p) => await Payment.findById(p._id).populate('payment_method').populate('school_year').populate('type_of_payment'))
      Promise.all(populatedPayments).then( async (result) => {
        const finalRes = [];
        result.forEach( element => {
          finalRes.push({
            _id: element._id,
            student: element.student,
            payment_method: {
              image: element.payment_method.image,
              _id:  element.payment_method._id,
              name:  element.payment_method.name,
              transaction_fee_type:  element.payment_method.transaction_fee_type,
              transaction_fee:  element.payment_method.transaction_fee,
              __v:  element.payment_method.__v,
              midtrans_payment_type: element.payment_method.midtrans_payment_type,
              bank: element.payment_method.bank
          },
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
          order_id: response.order_id, 
          midtrans_transaction_id: response.transaction_id, 
          created_at: response.transaction_time,
          expire_at: expireTime(midtransPaymentType),
          ...paymentTypeCode(response.payment_type)
        })
        const newTransaction = await transaction.save().then(t => t.populate('payment_method').execPopulate())
        res.send({payments, transaction: newTransaction, midtrans: response, billResponse})
      })
      
    } catch(error) {
      res.status(400).send(error);
    }
  })
  .catch(error => {
    res.status(400).send({error: error.ApiResponse, body: req.body})
  })

})

router.post('/online/cancel/:transactionId', async (req, res) => {
  const transactionId = req.params.transactionId;
  const config = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')
    }
  }
  axios.post(`${MIDTRANS_BASE_URL}/v2/${transactionId}/cancel`, req.body, config).then(response => {
    res.send({result: response.data})
  }).catch(err => {
    console.log(err.response)
  })
  
})

router.post('/match/signature', (req, res) => {
  const response = {
    "va_numbers": [
      {
        "bank": "bni",
        "va_number": "9888009257854576"
      }
    ],
    "payment_amounts": [],
    "transaction_time": "2020-07-07 12:32:12",
    "gross_amount": "300000.00",
    "currency": "IDR",
    "order_id": "order-ybk-1594099928763",
    "payment_type": "bank_transfer",
    "signature_key": "05d825136fa2f7c2edc2fcd1277d4743c89fc030688867a0ad828b4180166385054fb1771e730c72805d7f279ee95fb4610348fa64ed8689b82519e7f813a426",
    "status_code": "200",
    "transaction_id": "5729044a-4fb8-4ffa-9c0b-9061c9aebb39",
    "transaction_status": "cancel",
    "fraud_status": "accept",
    "status_message": "Success, transaction is found",
    "merchant_id": "G548180092"
  }

  const key = 'order-ybk-1594099928763' + '200' + '300000.00' + process.env.MIDTRANS_SERVER_KEY;
  const finalHash = util.toHash512(key);
  
  
  res.send(finalHash)
  // SHA512(order_id+status_code+gross_amount+serverkey)
})

router.post('/midtrans/notification_handler', (req, res) => {
  let receivedJson = req.body;

  // try {
  //   JSON.parse(receivedJson);
  // } catch (e) {
  //   return res.status(400).send('Bad Request');
  // }

  core.transaction.notification(receivedJson)
    .then( async (transactionStatusObject) => {

      const currentDate = new Date();
      
      const orderId = transactionStatusObject.order_id;
      const transactionStatus = transactionStatusObject.transaction_status;
      const transactionTime = transactionStatusObject.transaction_time;
      const fraudStatus = transactionStatusObject.fraud_status;
      const statusCode = transactionStatusObject.status_code;
      const grossAmount = transactionStatusObject.gross_amount;

      const key = orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY;
      const finalKey = util.toHash512(key);
      if(transactionStatusObject.signature_key !== finalKey) {
        return res.status(400).send({status: 400, msg: 'You are not allowed to send notification'});
      } 
  
      let summary = `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}.<br>Raw notification object:<pre>${JSON.stringify(transactionStatusObject, null, 2)}</pre> STATUS CODE ${statusCode} GROSS AMOUNT ${grossAmount}`;

      const transaction = await Transaction.findOne({ order_id: orderId })
      // const user = await User.findById(payment.user);
      transaction.transaction_status = transactionStatus || '';
      // [5.B] Handle transaction status on your backend via notification alternatively
      // Sample transactionStatus handling logic
      if (transactionStatus == 'capture'){
        if (fraudStatus == 'challenge'){
          await transaction.save();
        } else if (fraudStatus == 'accept'){
          await transaction.save();
        }
      } else if (transactionStatus == 'settlement'){
        // TODO set transaction status on your databaase to 'success'
        // Note: Non-card transaction will become 'settlement' on payment success
        // Card transaction will also become 'settlement' D+1, which you can ignore
        // because most of the time 'capture' is enough to be considered as success
        util.sendPushNotification('ExponentPushToken[4z0nuTCjNQ-ATRh9w4qEar]', 'Pembayaran Berhasil', 'Pembayaran telah diterima')
        transaction.completed = 1;
        transaction.completed_at = currentDate;
        await transaction.save();
        await Payment.updateMany({ transaction_number: transaction.transaction_number }, { payment_status: 1 });
        await Bill.updateMany({ transaction_number: transaction.transaction_number }, { status: 2 });
        
      } else if (transactionStatus == 'cancel' ||
        transactionStatus == 'deny' ||
        transactionStatus == 'expire'){
        // TODO set transaction status on your databaase to 'failure'
        if(transactionStatus == 'cancel') {
          util.sendPushNotification('ExponentPushToken[4z0nuTCjNQ-ATRh9w4qEar]', 'Transaksi Dibatalkan', 'Transaksi telah dibatalkan')
          transaction.canceled_at = transactionTime
          
        } else if(transactionStatus == 'deny') {
          util.sendPushNotification('ExponentPushToken[4z0nuTCjNQ-ATRh9w4qEar]', 'Transaksi ditolak', 'Transaksi telah ditolak')
          transaction.denied_at = transactionTime
          
        }
        await Bill.updateMany({ transaction_number: transaction.transaction_number }, { status: 0, transaction_number: undefined }); 
        transaction.completed = 1;
        transaction.completed_at = currentDate;
        await transaction.save();
      } else if (transactionStatus == 'pending'){
        // TODO set transaction status on your databaase to 'pending' / waiting payment
        await transaction.save();
        
      } else if (transactionStatus == 'refund'){
        // TODO set transaction status on your databaase to 'refund'
        transaction.refunded_at = transactionTime;
        await transaction.save();
      }
      // console.log(summary);
      res.send(summary);
    }).catch(err => {
      res.send(err)
    })
})

// Method: PUT
// URI: /api/majors/{id}
// Desc: Update Major
router.put('/:id', async (req, res) => {
  const {student, payment_method, month, school_year, type_of_payment, administrator, transaction_number, method, amount, canceled_at, approved_at, denied_at, refunded_at, expire_at} = req.body;
  const _id = req.params.id;
  try {
    const newPayment = await Payment.findOneAndUpdate({_id}, {student, payment_method, month, school_year, type_of_payment, administrator, transaction_number, method, amount, canceled_at, approved_at, denied_at, refunded_at, expire_at}, {new: true});
    res.send({payment: newPayment})
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
    const newPayment = await Payment.findOneAndUpdate({_id}, req.body, {new: true});
    res.send({payment: newPayment})
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
    await Payment.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})

//============================================================================================================================

router.delete('/delete/all', async (req, res) => {
  await Payment.deleteMany({method: 1}).then(response => res.send('ALL PAYMENTS DELETED'))
})

router.delete('/delete/all-transactions', async (req, res) => {
  const completed = req.body.completed
  await Transaction.deleteMany({completed: completed}).then(response => res.send('ALL TRANSACTIONS DELETED'))
})

router.post('/notification/send/test', async(req, res) => {
  util.sendPushNotification('ExponentPushToken[4z0nuTCjNQ-ATRh9w4qEar]', 'Pembayaran Berhasil', 'Pembayaran telah diterima');
  res.status(204).send();
})

router.post('/online/checkout/cancel-request', async (req, res) => {
  setTimeout(() => {
    res.send(req.body)
  }, 5000)
})

module.exports = router;