const axios = require('axios');
const moment = require('moment');
const crypto = require('crypto');
const Nexmo = require('nexmo')
require('dotenv').config()

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET
})


const getTomorrowTime = (currentTime) => {
  return moment(currentTime).add(1, 'days').format('YYYY-MM-DD hh:mm:ss');
}

const getGopayExpireTime = (currentTime) => {
  return moment(currentTime).add(15, 'm').format('YYYY-MM-DD hh:mm:ss');
}

const getMandiriBillExpireTime = (currentTime) => {
  return moment(currentTime).add(2, 'h').format('YYYY-MM-DD hh:mm:ss');
}

const getCstoreExpireTime = (currentTime) => {
  return moment(currentTime).add(2, 'h').format('YYYY-MM-DD hh:mm:ss');
}

const sendPushNotification = async (expoPushToken, notificationTitle, notificationBody) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: notificationTitle,
    body: notificationBody,
    data: { data: 'goes here' },
    _displayInForeground: true,
  };
  // const response = await fetch('https://exp.host/--/api/v2/push/send', {
  //   method: 'POST',
  //   headers: {
  //     Accept: 'application/json',
  //     'Accept-encoding': 'gzip, deflate',
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(message),
  // });
  const body = JSON.stringify(message);
  const config = {
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    }
  }
  const response = await axios.post('https://exp.host/--/api/v2/push/send', body, config)
  console.log(response.data)
}

const sendChunkPushNotification = async (someExpoPushToken, notificationTitle, notificationBody) => {
  const messages = [];
  for(let i = 0; i < someExpoPushToken.length; i++) {
    messages.push({
      to: someExpoPushToken[i],
      sound: 'default',
      title: notificationTitle,
      body: notificationBody,
      data: { data: 'Bills created' },
      _displayInForeground: true,
    })
  }
  // const response = await fetch('https://exp.host/--/api/v2/push/send', {
  //   method: 'POST',
  //   headers: {
  //     Accept: 'application/json',
  //     'Accept-encoding': 'gzip, deflate',
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(message),
  // });
  const body = JSON.stringify(messages);
  const config = {
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    }
  }
  const response = await axios.post('https://exp.host/--/api/v2/push/send', body, config)
  console.log(response.data)
}

const toHash512 = (text) => {
  const hash =  crypto.createHash('sha512');
  data = hash.update(text, 'utf-8');
  resHash = data.digest('hex');
  return resHash;
}

const sendSms = (from, to, text) => {
  return new Promise((resolve, reject) => {
    nexmo.message.sendSms(from, to, text, (err, responseData) => {
      if (err) {
          console.log(err);
          reject(err)
      } else {
          if(responseData.messages[0]['status'] === "0") {
              resolve({ msg: `Message sent successfully to ${to}`, responseData })
              console.log("Message sent successfully.");
          } else {
              reject({ msg: `Message failed with error: ${responseData.messages[0]['error-text']}` })
              console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
              
          }
      }
    })
  })
}

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

exports.getTomorrowTime = getTomorrowTime;
exports.getGopayExpireTime = getGopayExpireTime;
exports.getMandiriBillExpireTime = getMandiriBillExpireTime;
exports.getCstoreExpireTime = getCstoreExpireTime;
exports.sendPushNotification = sendPushNotification;
exports.sendChunkPushNotification = sendChunkPushNotification;
exports.toHash512 = toHash512;
exports.sendSms = sendSms;
exports.months = months;