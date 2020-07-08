const express = require('express');
const router = express.Router();
const verify = require('../../middleware/verify');
const TransportationLocation = require('../../models/TransportationLocation');

// Method: GET
// URI: /api/transportation-locations
// Desc: Get All Transportation Location
router.get('/', (req, res) => {
  TransportationLocation.find()
    .then(transportationLocations => res.json(transportationLocations))
})

// Method: GET
// URI: /api/transportation-locations/{id}
// Desc: Get Transportation Location By Id
router.get('/:id', (req, res) => {
  const _id = req.params.id;
  TransportationLocation.findOne({_id})
    .then(transportationLocation => res.json(transportationLocation))
})

// Method: POST
// URI: /api/transportation-locations
// Desc: Create Transportation Location
router.post('/', async (req, res) => {
  const { location, cost } = req.body;

  const locationExist = await TransportationLocation.findOne({ location });
  if(locationExist) return res.status(400).send({msg: 'Location already exist'});

  const transportationLocation = new TransportationLocation({ location, cost })

  try {
    const newTransportationLocation = await transportationLocation.save();
    res.send({transportationLocation: newTransportationLocation})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: PUT
// URI: /api/transportation-locations/{id}
// Desc: Update Transportation Location
router.put('/:id', async (req, res) => {
  const {location, cost} = req.body;
  const _id = req.params.id;
  try {
    const newTransportationLocation = await TransportationLocation.findOneAndUpdate({_id}, {location, cost}, {new: true});
    res.send({transportationLocation: newTransportationLocation})
  } catch(error) {
    res.status(400).send(error);
  }
})

// Method: DELETE
// URI: /api/transportation-locations/{id}
// Desc: Delete Transportation Location
router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    await TransportationLocation.findOneAndDelete({_id})
    res.send({status: 'success', msg: 'DATA HAS BEEN DELETED'})
  } catch(error) {
    res.status(400).send(error);
  }
})


module.exports = router;