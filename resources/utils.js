const axios = require('axios');
const moment = require('moment');
const crypto = require('crypto');

const getTomorrowTime = (currentTime) => {
  return moment(currentTime).add(1, 'days').format('YYYY-MM-DD hh:mm:ss');
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
  // console.log(response.data)
}

const toHash512 = (text) => {
  const hash =  crypto.createHash('sha512');
  data = hash.update(text, 'utf-8');
  resHash = data.digest('hex');
  return resHash;
}

exports.getTomorrowTime = getTomorrowTime;
exports.sendPushNotification = sendPushNotification;
exports.toHash512 = toHash512;