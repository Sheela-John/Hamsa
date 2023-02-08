/**
 * sniffer middleware
 */
'use strict'
const component = "SNIFFER";
const useragent = require('useragent');
const { chalk } = require('storyboard');

module.exports = function(req, res, next) {
    const log = require('../util/logger').log(component, ___filename);
    var agent = useragent.lookup(req.headers['user-agent']);
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    log.trace(component, chalk.green(`[${req.method}][${req.originalUrl}][${ip}][${agent.toAgent()}][${agent.os.toString()}]`));
    log.close();
    next();
};
