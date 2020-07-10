const jwt = require('jsonwebtoken')
require('dotenv').config()

function verify(req, res, next) {
  const JWT_SECRET = process.env.JWT_SECRET

  const token = req.header('x-auth-token')

  if(!token) return res.status(401).json({msg: 'No token, authrization denied'})

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.student = decoded;
    // if(req.user.accessRights !== 1) {
    //   res.status(400).json({msg: 'FORBIDDEN ACCESS'});
    // } else { next() }
    next()
  } catch (error) {
    res.status(400).json({msg: 'Akses ditolak, silahkan login kembali'});
  }

}

module.exports = verify;