const jwt = require('jsonwebtoken')
require('dotenv').config()

function verifyAdmin(req, res, next) {
  const JWT_SECRET = process.env.JWT_SECRET

  const token = req.header('x-auth-token')

  if(!token) return res.status(401).json({msg: 'No token, authrization denied'})

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded
    next()
  } catch (error) {
    res.status(400).json({msg: 'Token is not valid'});
  }

}

module.exports = verifyAdmin;