const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()
const students = require('./routes/api/students');
const classes = require('./routes/api/classes');
const majors = require('./routes/api/majors');
const schoolYears = require('./routes/api/schoolYears');
const paymentTypes = require('./routes/api/paymentTypes');
const transportationLocations = require('./routes/api/transportationLocation');
const typeOfPayments = require('./routes/api/typeOfPayments');
const paymentMethods = require('./routes/api/paymentMethods');
const schools = require('./routes/api/schools');
const administrators = require('./routes/api/administrators');
const bills = require('./routes/api/bills');
const payments = require('./routes/api/payments');
const transactions = require('./routes/api/transactions');
const sms = require('./routes/api/sms');
const billSetting = require('./routes/api/billSettings');


const app = express();

app.use(express.static('public'));
app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({limit: '50mb'}));
app.use(cors());
app.use(helmet());

const DB_KEY = process.env.DB_KEY;

mongoose.connect(DB_KEY, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('mongodb connected'))
  .catch(err => console.log(err))

app.use('/api/students', students);
app.use('/api/classes', classes);
app.use('/api/majors', majors);
app.use('/api/school-years', schoolYears);
app.use('/api/payment-types', paymentTypes);
app.use('/api/transportation-locations', transportationLocations);
app.use('/api/type-of-payments', typeOfPayments);
app.use('/api/payment-methods', paymentMethods);
app.use('/api/schools', schools);
app.use('/api/administrators', administrators);
app.use('/api/bills', bills);
app.use('/api/payments', payments);
app.use('/api/transactions', transactions);
app.use('/api/sms', sms);
app.use('/api/bill-settings', billSetting);


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`))