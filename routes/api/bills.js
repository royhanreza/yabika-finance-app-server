const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const { Expo } = require('expo-server-sdk')
const verify = require('../../middleware/verify');
const Bill = require('../../models/Bill');
const Student = require('../../models/Student');
const BillSetting = require('../../models/BillSetting');
const SchoolYear = require('../../models/SchoolYear');
const axios = require('axios')
const utils = require('../../resources/utils');
let expo = new Expo();


// Skenario Automatic Bills SPP
// 1. Periksa pengaturan tagihan
// 2. Jika automate == 1 maka lakukan proses selanjutnya
// 3. inisiasi variabel bills (menyimpan banyak tagihan)
// 4. Find semua siswa yang aktif
// 5. Lakukan perulangan berdasarkan siswa
// 6. Periksa existing tagihan siswa
// 7. Jika tagihan sudah ada maka continue
// 8. Jika tidak ada maka push ke variabel bills
// 9. Sesuaikan biaya dengan jenjang siswa
// 10. Insert many bills,
// 11. End

// REMINDER SMS. Berjalan setiap tanggal 25 - jam 6 - menit 0 - detik 0 - tiap bulan
// cron.schedule('0 36 * * * *', async () => {
cron.schedule('0 30 12 25 * *', async () => {
  // let phones = [];

  // const activeBills = await Bill.find({ status: 0 }).populate('student');
  // for( let i = 0; i < activeBills.length; i++ ) {
  //   if(!activeBills[i].student.expo_push_token) {
  //     if(activeBills[i].student.phone && (phones.indexOf(activeBills[i].student.phone) < 0)) {
  //       phones.push(activeBills[i].student.phone) //TODOTODO
  //     } else {
  //       continue
  //     }
  //   } else {
  //     continue
  //   }
  // }

  // const smsText = 'Ada tagihan yang belum dibayar. Segera lakukan pembayaran melalui aplikasi atau langsung'

  // if(phones.length > 0) {
  //   for(let i = 0; i < phones.length; i++) {
  //     let finalNumber = '';
  //     if(phones[i].substr(0, 1) == '0' ) {
  //       finalNumber = '62' + phones[i].substr(1)
  //     } else {
  //       finalNumber = phones[i];
  //     }
  //     utils.sendSms('YABIKA', finalNumber, smsText ).then(response => {
  //       console.log('Berhasil mengirim SMS ke ' + finalNumber)
  //     }).catch(error => {
  //       console.log('Gagal megirim SMS ke ' + finalNumber)
  //     })
  //   }
  //   console.log('SMS Tagihan reminder terkirim')
  // } else {
  //   console.log('Semua siswa telah membayar tagihan')
  // }

  let messages = [];

  const activeBills = await Bill.find({ status: 0 }).populate('type_of_payment').populate('school_year').populate({ path: 'student', populate: { path: 'student_class' } })
  for( let i = 0; i < activeBills.length; i++ ) {
    if(!activeBills[i].student.expo_push_token) {
      if(activeBills[i].student.phone) {
        const indexMessages = messages.map(m => m.to).indexOf(activeBills[i].student.phone);
        if(indexMessages < 0) {
          messages.push({
            to: activeBills[i].student.phone,
            text: `${activeBills[i].student.nis}-${activeBills[i].student.name}. Harap segera membayar tagihan sebagai berikut:\n- ${activeBills[i].type_of_payment.name} ${(activeBills[i].month) ? utils.months[activeBills[i].month] : ''} ${activeBills[i].school_year.name}\n`
          })
        } else {
          // phones.push(activeBills[i].student.phone)
          messages[indexMessages].text += `- ${activeBills[i].type_of_payment.name} ${(activeBills[i].month) ? utils.months[activeBills[i].month] : ''} ${activeBills[i].school_year.name}\n`
        }
      } else {
        continue
      }
    } else {
      continue
    }
  }

  if(messages.length > 0) {
    for(let i = 0; i < messages.length; i++) {
      let finalNumber = '';
      if(messages[i].to.substr(0, 1) == '0' ) {
        finalNumber = '62' + messages[i].to.substr(1)
      } else {
        finalNumber = messages[i].to;
      }
      utils.sendSms('YABIKA', finalNumber, messages[i].text ).then(response => {
        console.log('SMS sent to ' + finalNumber)
      }).catch(error => {
        console.log('Failed to send SMS' + finalNumber)
      })
      // console.log(finalNumber, messages[i].text)
    }
    console.log('SMS Tagihan reminder terkirim')
  } else {
    console.log('Semua siswa telah membayar tagihan')
  }
})

// REMINDER NOTIFIKASI. Berjalan setiap tanggal 25-31 - jam 6 - menit 0 - detik 0 - tiap bulan
// cron.schedule('0 37 * * * *', async () => {
cron.schedule('0 20 12 25-31 * *', async () => {
  let someExpoPushToken = [];

  const activeBills = await Bill.find({ status: 0 }).populate('student');
  for( let i = 0; i < activeBills.length; i++ ) {
    if(activeBills[i].student.expo_push_token) {
      if(someExpoPushToken.indexOf(activeBills[i].student.expo_push_token) < 0) {
        someExpoPushToken.push(activeBills[i].student.expo_push_token)
      } else {
        continue
      }
    } else {
      continue
    }
  }

  let notificationTitle = 'Ada tagihan yang belum dibayar';
  let notificationBody = 'Segera lakukan pembayaran melalui aplikasi atau langsung'
  if( someExpoPushToken.length < 1 ) {
    console.log('Semua siswa telah membayar tagihan')
  } else {
    utils.sendChunkPushNotification(someExpoPushToken, notificationTitle, notificationBody)
  }

  console.log('Notifications sent')
})

// REMINDER EMAIL. Berjalan setiap tanggal 25-31 - jam 6 - menit 30 - detik 0 - tiap bulan
// cron.schedule('0 44 * * * *', async () => {
cron.schedule('0 25 12 25-31 * *', async () => {
  let emails = [];

  const activeBills = await Bill.find({ status: 0 }).populate('type_of_payment').populate('school_year').populate({ path: 'student', populate: { path: 'student_class' } })
  for( let i = 0; i < activeBills.length; i++ ) {
    if(activeBills[i].student.email) {
      const indexEmails = emails.map(m => m.to).indexOf(activeBills[i].student.email);
      if(indexEmails < 0) {
        emails.push({
          from: 'YABIKA <ypi.yabika@gmail.com>',
          to: activeBills[i].student.email,
          subject: 'Info Tagihan',
          text: `${activeBills[i].student.nis}-${activeBills[i].student.name}. Harap segera membayar tagihan sebagai berikut:\n- ${activeBills[i].type_of_payment.name} ${(activeBills[i].month) ? utils.months[activeBills[i].month] : ''} ${activeBills[i].school_year.name}\n`
        })
      } else {
        // phones.push(activeBills[i].student.phone)
        emails[indexEmails].text += `- ${activeBills[i].type_of_payment.name} ${(activeBills[i].month) ? utils.months[activeBills[i].month] : ''} ${activeBills[i].school_year.name}\n`
      }
    } else {
      continue
    }
  }

  if(emails.length > 0) {
    for(let i = 0; i < emails.length; i++) {
      utils.sendEmail(emails[i]).then(res => {
        // console.log(res)
      }).catch(err => {
        console.log(err)
      })
    }
    console.log({msg: 'emails sent'})
  } else {
    console.log('Semua siswa telah membayar tagihan')
  }
})

// TAGIHAN OTOMATIS. Berjalan setiap tanggal 1 - jam 0 - menit 0 - detik 0 - tiap bulan
cron.schedule('0 0 0 1 * *', async () => {
  console.log('Running scheduled proccess');
  let someExpoPushToken = [];
  const billSetting = await BillSetting.findOne();
  const students = await Student.find({ status: 1 }).populate('student_class')

  const date = new Date();
  //TODO-----------------------
  // const currentMonth = 11;
  // const currentYear = 2021;
  //TODO-----------------------
  const currentMonth = date.getMonth(); 
  const currentYear = date.getFullYear(); 
  const yearStart = ( currentMonth < 6 ) ? currentYear - 1 : currentYear
  const type_of_payment = '5eff0cccca031a1e6c1d4e3c';
  const school_year = await SchoolYear.findOne({ yearStart })

  // if(!school_year) return res.status(400).send('Tahun ajaran tidak ditemukan');
  if(!school_year) return console.log('Tahun ajaran tidak ditemukan');

  let bills = [];
  if( billSetting.automate === 1 ) {
    for(let i = 0; i < students.length; i++) {
      const billExist = await Bill.findOne({ student: students[i]._id, type_of_payment, month: currentMonth, school_year: school_year._id });
      if(billExist) {
        continue;
      } else {
        const cost = (grade) => {
          switch(grade){
            case 'MI':
              return billSetting.mi_cost;
            case 'MTs':
              return billSetting.mts_cost;
            case 'MA':
              return billSetting.ma_cost
            default:
              return 50000
          }
        }
        bills.push({ student: students[i]._id, type_of_payment, month: currentMonth, school_year: school_year._id, cost: cost(students[i].student_class.grade), status: 0 })
        if(students[i].expo_push_token) {
          someExpoPushToken.push(students[i].expo_push_token)
        }
      }
    }
    if(bills.length < 1) {
      // res.send('No bills inserted, all bills already exist')
      console.log('No bills inserted, all bills already exist')
      console.log('Scheduled procsess end')
    } else {
      // res.send({N_insertedBills: bills.length, bills, someExpoPushToken})
      // console.log({N_insertedBills: bills.length, bills, someExpoPushToken})
      // if(someExpoPushToken.length > 0) {
      //   let notificationTitle = `Tagihan SPP untuk bulan ${utils.months[currentMonth]} telah dibuat`;
      //   let notificationBody = 'Lakukan pembayaran melalui aplikasi atau langsung'
      //   utils.sendChunkPushNotification(someExpoPushToken, notificationTitle, notificationBody)
      // }
      // console.log('Scheduled procsess end')
      try {
        const insertedBills = await Bill.insertMany(bills);
        console.log({N_insertedBills: insertedBills.length, msg: 'Tersimpan'})
        if(someExpoPushToken.length > 0) {
          let notificationTitle = `Tagihan SPP untuk bulan ${utils.months[currentMonth]} telah dibuat`;
          let notificationBody = 'Lakukan pembayaran melalui aplikasi atau langsung'
          utils.sendChunkPushNotification(someExpoPushToken, notificationTitle, notificationBody)
        }
      } catch (error) {
        console.log(error)
        console.log('Scheduled procsess end')
        // res.status(400).send(error)
      }
    }
  } else {
    // res.status(204).send()
    console.log('Auto bills is off, turn it on in bill settings')
    console.log('Scheduled procsess end')
  }

});

// Method: GET
// URI: /api/majors
// Desc: Get All Majors
router.get('/', async (req, res) => {
  Bill.find().populate('type_of_payment').populate('school_year').populate({ path: 'student', populate: { path: 'student_class' } }).sort({ created_at: -1 })
    .then(bills => res.json(bills))
  
})

// Method: GET
// URI: /api/majors/{id}
// Desc: Get Major By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  Bill.findOne({_id}).populate('type_of_payment').populate('school_year').populate('student')
    .then(bill => res.json(bill))
})

// Method: POST
// URI: /api/majors
// Desc: Create Major
router.post('/', async (req, res) => {
  const { student, type_of_payment, month, school_year, cost } = req.body;

  const billExist = await Bill.findOne({ student, type_of_payment, month, school_year });
  if(billExist) return res.status(400).send({msg: 'Tagihan sudah ada'});

  const bill = new Bill({ student, type_of_payment, month, school_year, cost, status: 0 })

  try {
    const newBill = await bill.save().then(t => t.populate('type_of_payment').populate('school_year').execPopulate());
    // const  newBill.populate('type_of_payment').populate('school_year')
    res.send({bill: newBill})
  } catch(error) {
    res.status(400).send(error);
  }
})

router.post('/action/insert-many', async (req, res) => {
  const { students, type_of_payment, month, school_year, cost } = req.body;
  let bills  = [];
  for(let i = 0; i < students.length; i++) {
    const billExist = await Bill.findOne({ student: students[i], type_of_payment, month, school_year });
    if(billExist) {
      continue;
    } else {
      bills.push({ student: students[i], type_of_payment, month, school_year, cost, status: 0 })
    }
  }

  try {
    const insertedBills = await Bill.insertMany(bills);
    res.send({data: insertedBills})
  } catch (error) {
    res.status(400).send(error)
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
  const {student, type_of_payment, month, school_year, cost} = req.body;
  const billExist = await Bill.findOne({ student, type_of_payment, month, school_year });

  if(billExist) {
    return res.status(400).send({msg: 'Tagihan sudah ada'})
  } else {
    try {
      const newBill = await Bill.findOneAndUpdate({_id}, req.body, {new: true});
      res.send({bill: newBill})
    } catch(error) {
      res.status(400).send(error);
    }
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

router.post('/actions/delete-many', async (req, res) => {
  const ids = req.body.ids
  try {
    const deletedBill = await Bill.deleteMany({_id: ids});
    res.send(deletedBill);
  } catch (error) {
    res.status(400).send(error)
  }
  // res.send(req.body)
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

router.delete('/delete/all', async (req, res) => {
  await Bill.deleteMany({}).then(response => res.send('ALL BILLS DELETED'))
})

router.patch('/actions/update-status', async(re, res) => {
  try {
    const response = await Bill.updateMany({ status: [1, 2] }, { status: 0 });
    res.send('UPDATED STATUS TO 0');
  } catch (error) {
    res.status(400).send(error);
  }
})

// Skenario Automatic Bills SPP
// 1. Periksa pengaturan tagihan
// 2. Jika automate == 1 maka lakukan proses selanjutnya
// 3. inisiasi variabel bills (menyimpan banyak tagihan)
// 4. Find semua siswa yang aktif
// 5. Lakukan perulangan berdasarkan siswa
// 6. Periksa existing tagihan siswa
// 7. Jika tagihan sudah ada maka continue
// 8. Jika tidak ada maka push ke variabel bills
// 9. Sesuaikan biaya dengan jenjang siswa
// 10. Insert many bills,
// 11. End

router.post('/actions/node-cron-spp/test', async (req, res) => {
  // console.log('Running proccess');
  let someExpoPushToken = [];
  const billSetting = await BillSetting.findOne();
  const students = await Student.find({ status: 1 }).populate('student_class')

  const date = new Date();
  //TODO-----------------------
  const currentMonth = req.body.currentMonth;
  const currentYear = req.body.currentYear;
  //TODO-----------------------
  // const currentMonth = date.getMonth(); //TODO IMPORTANT
  // const currentYear = date.getFullYear(); //TODO IMPORTANT
  const yearStart = ( currentMonth < 6 ) ? currentYear - 1 : currentYear
  //   student: "5effc284c813141704c72082",
  //   type_of_payment: "5eff0cedca031a1e6c1d4e3d",
  //   school_year: "5f013d50a76b4e19e844f48d",
  //   cost: 250000
  const type_of_payment = '5eff0cccca031a1e6c1d4e3c';
  const school_year = await SchoolYear.findOne({ yearStart })

  if(!school_year) return res.status(400).send('Tahun ajaran tidak ditemukan');

  let bills = [];
  if( billSetting.automate === 1 ) {
    for(let i = 0; i < students.length; i++) {
      const billExist = await Bill.findOne({ student: students[i]._id, type_of_payment, month: currentMonth, school_year: school_year._id });
      if(billExist) {
        continue;
      } else {
        const cost = (grade) => {
          switch(grade){
            case 'MI':
              return billSetting.mi_cost;
            case 'MTs':
              return billSetting.mts_cost;
            case 'MA':
              return billSetting.ma_cost
            default:
              return 50000
          }
        }
        bills.push({ student: students[i]._id, type_of_payment, month: currentMonth, school_year: school_year._id, cost: cost(students[i].student_class.grade), status: 0 })
        if(students[i].expo_push_token) {
          someExpoPushToken.push(students[i].expo_push_token)
        }
      }
    }
    if(bills.length < 1) {
      res.send('No bills inserted, all bills already exist')
    } else {
      res.send({N_insertedBills: bills.length, bills, someExpoPushToken})
      if(someExpoPushToken.length > 0) {
        let notificationTitle = `Tagihan SPP untuk bulan ${utils.months[currentMonth]} telah dibuat`;
        let notificationBody = 'Lakukan pembayaran melalui aplikasi atau langsung'
        utils.sendChunkPushNotification(someExpoPushToken, notificationTitle, notificationBody)
      }
      // try {
      //   const insertedBills = await Bill.insertMany(bills);
      //   res.send({N_insertedBills: insertedBills.length, bills: insertedBills, msg: 'Tersimpan'})
      //   if(someExpoPushToken.length > 0) {
      //     let notificationTitle = `Tagihan SPP untuk bulan ${utils.months[currentMonth]} telah dibuat`;
      //     let notificationBody = 'Lakukan pembayaran melalui aplikasi atau langsung'
      //     utils.sendChunkPushNotification(someExpoPushToken, notificationTitle, notificationBody)
      //   }
      // } catch (error) {
      //   res.status(400).send(error)
      // }
    }
  } else {
    res.status(204).send()
  }
})

// 1. Find tagihan status === 0
// 2. inisiasi variabel someExpoPushToken
// 3. lakukan looping berdasarkan tagihan
// 4. jika ada, push expo_push_token
// 5. jika tidak ada, lanjutkan
router.post('/actions/node-cron-reminder/test', async (req, res) => {
  
  let someExpoPushToken = [];

  const activeBills = await Bill.find({ status: 0 }).populate('student');
  for( let i = 0; i < activeBills.length; i++ ) {
    if(activeBills[i].student.expo_push_token) {
      if(someExpoPushToken.indexOf(activeBills[i].student.expo_push_token) < 0) {
        someExpoPushToken.push(activeBills[i].student.expo_push_token)
      } else {
        continue
      }
    } else {
      continue
    }
  }

  let notificationTitle = 'Ada tagihan yang belum dibayar';
  let notificationBody = 'Segera lakukan pembayaran melalui aplikasi atau langsung'
  utils.sendChunkPushNotification(someExpoPushToken, notificationTitle, notificationBody)

  console.log('Notifications sent')
})

router.post('/actions/node-cron-sms/test', async (req, res) => {
  
  let phones = [];

  const activeBills = await Bill.find({ status: 0 }).populate('type_of_payment').populate('school_year').populate({ path: 'student', populate: { path: 'student_class' } })
  for( let i = 0; i < activeBills.length; i++ ) {
    if(!activeBills[i].student.expo_push_token) {
      if(activeBills[i].student.phone && (phones.indexOf(activeBills[i].student.phone) < 0)) {
        phones.push(activeBills[i].student.phone)
      } else {
        continue
      }
      // if(someExpoPushToken.indexOf(activeBills[i].student.expo_push_token) < 0) {
      //   someExpoPushToken.push(activeBills[i].student.expo_push_token)
      // } else {
      //   continue
      // }
    } else {
      continue
    }
  }

  const smsText = 'Ada tagihan yang belum dibayar. Segera lakukan pembayaran melalui aplikasi atau langsung'

  if(phones.length > 0) {
    for(let i = 0; i < phones.length; i++) {
      let finalNumber = '';
      if(phones[i].substr(0, 1) == '0' ) {
        finalNumber = '62' + phones[i].substr(1)
      } else {
        finalNumber = phones[i];
      }
      utils.sendSms('YABIKA', finalNumber, smsText ).then(response => {
        console.log('SMS sent to ' + finalNumber)
      }).catch(error => {
        console.log('Failed to send SMS' + finalNumber)
      })
    }
    res.send('sent')
  } else {
    res.send('Semua siswa telah membayar tagihan')
  }

})

router.post('/actions/node-cron-sms/test-2', async (req, res) => {
  
  let messages = [];

  const activeBills = await Bill.find({ status: 0 }).populate('type_of_payment').populate('school_year').populate({ path: 'student', populate: { path: 'student_class' } })
  for( let i = 0; i < activeBills.length; i++ ) {
    if(!activeBills[i].student.expo_push_token) {
      if(activeBills[i].student.phone) {
        const indexMessages = messages.map(m => m.to).indexOf(activeBills[i].student.phone);
        if(indexMessages < 0) {
          messages.push({
            to: activeBills[i].student.phone,
            text: `${activeBills[i].student.nis}-${activeBills[i].student.name}. Harap segera membayar tagihan sebagai berikut:\n- ${activeBills[i].type_of_payment.name} ${(activeBills[i].month) ? utils.months[activeBills[i].month] : ''} ${activeBills[i].school_year.name}\n`
          })
        } else {
          // phones.push(activeBills[i].student.phone)
          messages[indexMessages].text += `- ${activeBills[i].type_of_payment.name} ${(activeBills[i].month) ? utils.months[activeBills[i].month] : ''} ${activeBills[i].school_year.name}\n`
        }
      } else {
        continue
      }
    } else {
      continue
    }
  }

  if(messages.length > 0) {
    for(let i = 0; i < messages.length; i++) {
      let finalNumber = '';
      if(messages[i].to.substr(0, 1) == '0' ) {
        finalNumber = '62' + messages[i].to.substr(1)
      } else {
        finalNumber = messages[i].to;
      }
      utils.sendSms('YABIKA', finalNumber, messages[i].text ).then(response => {
        console.log('SMS sent to ' + finalNumber)
      }).catch(error => {
        console.log('Failed to send SMS' + finalNumber)
      })
      // console.log(finalNumber, messages[i].text)
    }
    res.send('sent')
  } else {
    res.send('Semua siswa telah membayar tagihan')
  }

})

router.post('/actions/node-cron-email/test', async (req, res) => {
  let emails = [];

  const activeBills = await Bill.find({ status: 0 }).populate('type_of_payment').populate('school_year').populate({ path: 'student', populate: { path: 'student_class' } })
  for( let i = 0; i < activeBills.length; i++ ) {
    if(activeBills[i].student.email) {
      const indexEmails = emails.map(m => m.to).indexOf(activeBills[i].student.email);
      if(indexEmails < 0) {
        emails.push({
          from: 'YABIKA <ypi.yabika@gmail.com>',
          to: activeBills[i].student.email,
          subject: 'Info Tagihan',
          text: `${activeBills[i].student.nis}-${activeBills[i].student.name}. Harap segera membayar tagihan sebagai berikut:\n- ${activeBills[i].type_of_payment.name} ${(activeBills[i].month) ? utils.months[activeBills[i].month] : ''} ${activeBills[i].school_year.name}\n`
        })
      } else {
        // phones.push(activeBills[i].student.phone)
        emails[indexEmails].text += `- ${activeBills[i].type_of_payment.name} ${(activeBills[i].month) ? utils.months[activeBills[i].month] : ''} ${activeBills[i].school_year.name}\n`
      }
    } else {
      continue
    }
  }

  if(emails.length > 0) {
    for(let i = 0; i < emails.length; i++) {
      utils.sendEmail(emails[i]).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
      // utils.sendSms('YABIKA', finalNumber, messages[i].text ).then(response => {
      //   console.log('SMS sent to ' + finalNumber)
      // }).catch(error => {
      //   console.log('Failed to send SMS' + finalNumber)
      // })
    }
    res.send({msg: 'emails sent', data: emails})
  } else {
    res.send('Semua siswa telah membayar tagihan')
  }
})

module.exports = router;