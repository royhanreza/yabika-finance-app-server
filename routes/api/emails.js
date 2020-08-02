const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mailgun = require("mailgun-js");

router.post('/send', async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ypi.yabika@gmail.com',
      pass: '98062646' // naturally, replace both with your real credentials or an application-specific password
    }
  });

  
  const mailOptions = [{
    from: 'YABIKA',
    to: 'royhanreza842@gmail.com',
    subject: 'Info Tagihan',
    text: 'Dudes, we really need your money.'
  },
  {
    from: 'YABIKA',
    to: 'royhanreza@gmail.com',
    subject: 'Info Tagihan 2',
    text: 'Dudes, we really need your money.'
  }
  ];

  for(let i = 0; i < mailOptions.length; i++) {
    transporter.sendMail(mailOptions[i], function(error, info){
      if (error) {
      res.status(400).send(error)
      console.log(error);
      } else {
        res.send('Email sent: ' + info.response);
      }
    });
  }
  
})

router.post('/send-mailgun', async (req, res) => {
  
  const DOMAIN = 'sandboxba9a59c05479493fb007d94ea66f4a44.mailgun.org';
  const mg = mailgun({apiKey: '511b45e398b1667c8671cec9247ebdcd-ffefc4e4-5129b863', domain: DOMAIN});
  const data = {
    from: 'Excited User <ypi.yabika@gmail.com>',
    to: 'royhanreza842@gmail.com',
    subject: 'Hello',
    text: 'Testing some Mailgun awesomness!'
  };
  mg.messages().send(data, function (error, body) {
    if(error){
      res.status(400).send(error)
    } else {
      res.send(body)
      console.log(body);
    }
  });
  
})


module.exports = router;