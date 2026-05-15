
const config = require('../config')
const jwt = require('jsonwebtoken');



const isValidJWT = function (token) {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY, {
      json: true
    });
    return decoded;
  } catch (e) {
    return false;
  }
}



module.exports = {
  isValidJWT: isValidJWT,
  
}