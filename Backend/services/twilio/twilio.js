const { reject } = require('async');

const component = 'Twilio Configuration';
const twilioModel = require('../../models').Twilio

const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

const log = require('../../util/logger').log(component, ___filename);

function getTwilioConfiguration() {
    log.debug(component, 'Get All Twilio Config');
    log.close();
    return new Promise((resolve, reject) => {
        twilioModel.find({}).lean()
            .then(twilio => {
                if (!twilio) log.debug(component, `no twilio found ${id}`);
                else {
                    log.debug(component, `${twilio} twilio found`);
                    log.close();

                    return resolve(twilio[0]);
                }
            })
            .catch(err => {
                log.error(component, 'find all twilio error', { attach: err });
                log.close();
                return reject(err);
            })
    })

}

const sendSms = async (smsData) => {

    log.debug(component, 'Send Sms functionality'); log.close();

    let [configErr, config] = await handle(getTwilioConfiguration());
    if (configErr) return Promise.reject(configErr);

    const twilioClient = require('twilio')(config.accountSid, config.authToken);

    return new Promise((resolve, reject) => {
        (async () => {
            let [messageError, messageData] = await handle(twilioClient.messages
                .create({
                    body: smsData.body,
                    from: config.fromPhone,
                    to: config.cellPhonePrefix + smsData.to
                }))
            if (messageError) {
                log.error('Error send sms', { attach: messageError }); log.close();
                return reject(messageError);
            }
            else {
                log.debug('Sms sent successfully'); log.close();
                return resolve(messageData);
            }
        })();
    })
}

async function updateTwilioConfiguration(data) {
    log.debug(component, 'updateTwilioConfiguration');
    log.close();

    return new Promise((resolve, reject) => {
        twilioModel.findOneAndUpdate({}, data, { new: true, useFindAndModify: false }).lean()
            .then(twilio => {
                if (!twilio) log.debug(component, `no twilio found ${data}`);
                else {
                    log.debug(component, `${twilio} twilio found`);
                    log.close();
                    return resolve(twilio);
                }
            })
            .catch(err => {
                log.error(component, 'find all twilio error', { attach: err });
                log.close();
                return reject(err);
            })
    })
};


module.exports = {
    getTwilioConfiguration: getTwilioConfiguration,
    sendSms: sendSms,
    updateTwilioConfiguration: updateTwilioConfiguration
}



