const express = require('express');
const router = express.Router();
const util = require('../../resources/utils');
const Student = require('../../models/Student');
const Bill = require('../../models/Bill');
const SmsQuota = require('../../models/SmsQuota')

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

router.post('/nexmo/send', async (req, res) => {
  const { from, to, text } = req.body;
  util.sendSms(from , to, text).then(response => {
    res.send({msg: response.msg, from, to, response: response.responseData})
  }).catch(error => {
    res.status(400).send(error.msg)
  })
  // res.send(req.body)
})

router.get('/nexmo/inbound-sms', async(req, res) => {
  // const params = Object.assign(req.query, req.body)
  const params = Object.assign(req.query, req.body)

  // const { msisdn, text } = req.query;

  

  // util.sendSms('YABIKA', msisdn, text).then(response => {
  //   res.send({msg: response.msg, from, to, response: response.responseData})
  // }).catch(error => {
  //   res.send(error.msg)
  // })

  // res.send('ok')

  // res.send(params)

  // ------------------------------------------------------

  const from = 'YABIKA'
  const { msisdn, text } = req.query;

  const smsCode = text.split(" ");

  if(smsCode.length !== 2) {
    return res.send({ status: 400, msg: 'Kode salah' })
  }

  const nis = smsCode[1];
  
  if(smsCode[0].toUpperCase() !== 'TAGIHAN') {
    return res.send({ status: 400, msg: 'Kode salah' })
  }

  const student = await Student.findOne({ nis });
  if(!student) {
    return res.send({ status: 400, msg: 'Siswa tidak ditemukan' })
  }

  const studentReachedQuota = await SmsQuota.findOne({ nis });

  if(!studentReachedQuota) {
    const studentBills = await Bill.find({ student: student._id, status: 0 }).populate('type_of_payment').populate('school_year')
  
    let finalBills = `Tagihan ${nis} - ${student.name} :\n`;
  
    if(studentBills.length < 1) {
      finalBills += 'Tidak ada tagihan'
    } else {
      for(let i = 0; i < studentBills.length; i++) {
        const month = (studentBills[i].month) ? months[studentBills[i].month] : '';
        const space = (i < studentBills.length - 1) ? '\n' : '';
        finalBills += `${i + 1}. ${studentBills[i].type_of_payment.name} - ${month} ${studentBills[i].school_year.name} (Rp ${studentBills[i].cost})${space}`;
      }
    }

    const studentQuota = new SmsQuota({ nis })

  // try {
  //   const newClass = await studentClass.save();
  //   res.send({class: newClass})
  // } catch(error) {
  //   res.status(400).send(error);
  // }
  
    util.sendSms(from , msisdn, finalBills).then(async (response) => {
      const quotaAdded = await studentQuota.save();
      res.send({msg: response.msg, from, msisdn, response: response.responseData, quota: quotaAdded})
    }).catch(error => {
      res.send(error.msg)
    })
  } else {
    res.send({status: 400, msg: 'Siswa telah mencapai quota SMS'})
  }

  // res.status(204).send(params)
})

router.get('/nexmo/delivery-receipt', async(req, res) => {
  const params = Object.assign(req.query, req.body)

  res.status(204).send(params)
})

// ---------------------------------------------------------

router.get('/nexmo/inbound-sms/test', async (req, res) => {
  const params = Object.assign(req.query, req.body)

  const { msisdn, to } = req.query;

  const smsCode = req.query.text.split(" ");

  if(smsCode.length !== 2) {
    return res.send({ status: 400, msg: 'Kode salah' })
  }

  const nis = smsCode[1];
  
  if(smsCode[0].toUpperCase() !== 'TAGIHAN') {
    return res.send({ status: 400, msg: 'Kode salah' })
  }

  const student = await Student.findOne({ nis });
  if(!student) {
    return res.send({ status: 400, msg: 'Siswa tidak ditemukan' })
  }

  const studentBills = await Bill.find({ student: student._id, status: 0 }).populate('type_of_payment').populate('school_year')

  let finalBills = `Tagihan ${nis} - ${student.name} :\n`;

  if(studentBills.length < 1) {
    finalBills += 'Tidak ada tagihan'
  } else {
    for(let i = 0; i < studentBills.length; i++) {
      const month = (studentBills[i].month) ? months[studentBills[i].month] : '';
      const space = (i < studentBills.length - 1) ? '\n' : '';
      finalBills += `${i + 1}. ${studentBills[i].type_of_payment.name} - ${month} ${studentBills[i].school_year.name} (Rp ${studentBills[i].cost})${space}`;
    }
  }

  // util.sendSms(from , to, finalBills).then(response => {
  //   res.send({msg: response.msg, from, to, response: response.responseData})
  // }).catch(error => {
  //   res.status(400).send(error.msg)
  // })
  res.send({finalBills, msisdn})
})

module.exports = router;