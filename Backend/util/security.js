/**
 * Security utils
 */
'use strict'
const crypto = require('crypto');

//Password Hashing
function hash(created_datetime, password) {
    var salt = crypto.createHash('sha256').update(created_datetime.toISOString()).digest('hex');
    var encrypt_password = crypto.createHash('sha256').update(salt + password).digest('hex');
    return encrypt_password;
}

module.exports = {
    hash: hash,
}
