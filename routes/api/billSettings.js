const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const BillSetting = require('../../models/BillSetting');
const { route } = require('./payments');

// Method: GET
// URI: /api/payment-types
// Desc: Get All Payment Types
router.get('/', verify, (req, res) => {
  BillSetting.find()
    .then(settings => res.json(settings))
})

router.post('/', verify, async (req, res) => {
  const { mi_cost, mts_cost, ma_cost } = req.body;
  try {
    const setting = new BillSetting({ mi_cost, mts_cost, ma_cost })
    const newSetting = await setting.save();
    res.send(newSetting)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.patch('/:id', verify, async (req, res) => {
  const _id = req.params.id
  try {
    const updatedSettingBills = await BillSetting.findByIdAndUpdate(_id, req.body, {new: true})
    res.send(updatedSettingBills)
  } catch (error) {
    res.status(400).send(error)
  }
})


module.exports = router;