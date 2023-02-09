/**
 * Email utils
 */
'use strict'
const component = "UTIL";
const nodemailer = require('nodemailer');
const config = require('config');

function send(to,subject, html,attachment, cb) {
    const log = require('./logger').log(component, __filename);
    var transporterOpts = {
        host: config.smtp.host,
        port: config.smtp.port,
        secure: false,
        tls: { rejectUnauthorized: false }
    };
    log.debug(component, 'mail options', { attach: transporterOpts });
    
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: config.smtp.sender,
               pass: config.smtp.password
           },
           tls: {rejectUnauthorized: false}
       });
       if(typeof(to) == "string"){
        var mailOpts = {
            from: config.smtp.sender,
            to: to,
            bcc: config.smtp.bcc,
            subject: subject,
            html: html,
            attachments: attachment
        };
       }else{
        var mailOpts = {
            from: config.smtp.sender,
            bcc: to,
            subject: subject,
            html: html,
            attachments: attachment
        };
       }

    transporter.sendMail(mailOpts, (err, info) => {
        if (err) {
            log.error(component, 'email send error', { attach: err });
            log.close();
            return cb(err);
        } else {
            log.debug(component, 'email sent');
            log.debug(component, 'mail server response', { attach: info.response });
            log.close();
        }
        return cb(null, info);
    });
}

module.exports = {
    send: send
}
