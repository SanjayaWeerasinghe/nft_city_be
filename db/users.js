const mysqlUtil = require('../utils/mysql');
const moment = require("moment")
const CryptoJS = require("crypto-js");
const USERS = 'users';
/**
 * @returns {Promise}
*/
function register(data = {}, db) {
  return mysqlUtil.insert(`INSERT INTO ${USERS} SET ?`, data, db);
}

/**
 * @param {String} key
 * @param {String} value
 * @param {Number} db
 * @returns {Promise}
*/
function get(key, value, db) {
  return mysqlUtil.select(`SELECT * FROM ${USERS} WHERE ${key} = ?`, [value], db);
}

/**
 * 
 * @param {String} username 
 * @param {String} key 
 * @param {*} value 
 * @returns {Promise}
 */
function update(username, key, value, db) {
  return mysqlUtil.update(`UPDATE ${USERS} SET ${key} = ? WHERE user_name = ?`, [value, username], db);
}

/**
 * 
 * @param {String} token 
 * @param {String} key 
 * @param {*} value 
 * @returns {Promise}
 */
function updateByToken(token, key, value, db) {
  return mysqlUtil.update(`UPDATE ${USERS} SET ${key} = ? WHERE token = ?`, [value, token], db);
}

/**
 * Check if username and password match
 * @param {String} username 
 * @param {String} hashedPassword 
 * @param {Object} db 
 * @returns {Promise}
 */
function authenticateUser(username, hashedPassword, db) {
  return mysqlUtil.select(`SELECT * FROM ${USERS} WHERE user_name = ? AND password = ?`, [username, hashedPassword], db);
}

function authenticateUserOtp(email, token, db) {
  return mysqlUtil.select(`SELECT * FROM ${USERS} WHERE email = ? AND token = ?`, [email, token], db);
}

function updateUserOtp(email, otpNumber, db) {
  const sql = `
      UPDATE ${USERS}
      SET token = ?, otp_create_time = ?
      WHERE email = ?
    `;
  const values = [otpNumber, moment().format('YYYY-MM-DD HH:mm:ss'), email];
  return mysqlUtil.update(sql, values, db);
}

async function resetPassword(otpCode, password, db) {
  const sql = `
      UPDATE ${USERS}
      SET password = ?, token = 0
      WHERE token = ?
    `;
  const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  const values = [hashedPassword, otpCode];

  return mysqlUtil.update(sql, values, db);
}

async function resetOtpOnVerify(otpCode, password, db) {
  const sql = `
      UPDATE ${USERS}
      SET password = ?, token = 0
      WHERE token = ?
    `;
  const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  const values = [hashedPassword, otpCode];

  return mysqlUtil.update(sql, values, db);
}


async function verifyUser(otpCode, db) {
  const sql = `
      UPDATE ${USERS}
      SET isVerified = 1, token = 0
      WHERE token = ?
    `;
  const values = [otpCode];
  return mysqlUtil.update(sql, values, db);
}

module.exports = { register, get, update, updateByToken, authenticateUser, updateUserOtp, authenticateUserOtp, resetPassword, resetOtpOnVerify, verifyUser }