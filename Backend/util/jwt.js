/**
 * JWT utils
 */
'use strict'
const component = "JWTUTIL";
const zoomModel = require('../models/zoomCredentials');
const jwt = require('jsonwebtoken');
const log = require('./logger').log(component, __filename);
const config = require('config');

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

function generateJwtToken() {
    return new Promise((resolve, reject) => {
        (async () => {
            let [zoomCredentialsErr, zoomCredentials] = await handle(zoomModel.findOne({}).lean());
            if (zoomCredentialsErr) return reject(zoomCredentialsErr);
            const payload = {
                iss: zoomCredentials.api_key,
                exp: ((new Date()).getTime() + config.zoom_token_expiry_in_ms) // tokenExpiry - 5 mins 
            };
            const token = jwt.sign(payload, zoomCredentials.api_secret);
            log.debug('generated JWT'); log.close();
            resolve(token);
        })();
    })
}

module.exports.generateJwtToken = generateJwtToken;