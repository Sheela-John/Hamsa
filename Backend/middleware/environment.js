/**
 * environment middleware
 */
'use strict'
const component = "ENVIRONMENT";

module.exports = function setupEnvironment() {
    const log = require('../util/logger').log(component, ___filename);
    require('dotenv').config();
    log.trace(component, `environment data loaded from ${require('path').resolve('./.env')}`);
    log.close();
}
