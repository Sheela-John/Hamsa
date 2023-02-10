'use strict'
const component = "Staff API";
const models = require('../models');
const Security = require("../util/security");
const Staff = models.Staff;
const AssignServiceForClient = models.AssignServiceForClient;
const Client = models.Client;
const lodash = require('lodash');
const ERR = require('../errors.json');
const uuid = require('../util/misc');
const security = require('../util/security');
const AWS = require('aws-sdk');
const config = require('config');
const async = require('async');
const emailTemplateAPI = require('../api/emailTemplate.api');
const Email = require('../util/email');
const html = require('../util/html');
const generateCode = require('../util/generateCode');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const awsConfig = require('../services/aws/aws');
const multer = require('multer')
const multerS3 = require('multer-s3');
const moment = require('moment');
const momentTz = require('moment-timezone');
const generateRandomPassword = require('../util/generateCode').randomString;
const genrateDefaultImage = require('../util/generateCode').genrateDefaultImage;


const s3 = new AWS.S3({
    accessKeyId: config.AWSCredentails.AWS_ACCESS_KEY,
    secretAccessKey: config.AWSCredentails.AWS_SECRET_ACCESS_KEY,
    region: config.AWSCredentails.REGION
});

const log = require('../util/logger').log(component, __filename);

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

/* Create Assign Service API */
const create = async (assignServiceData) => {
    log.debug(component, 'Creating New Assign Service', assignServiceData);
    log.close();
    let [staffErr, staffData] = await handle(Staff.findOne({ '_id': assignServiceData.staffId }).lean());
    if (staffErr) return Promise.reject(staffErr);
    if (lodash.isEmpty(staffData)) return Promise.reject(ERR.NO_RECORDS_FOUND);

    assignServiceData.status = 1;
    assignServiceData.date = new Date(assignServiceData.date);
    let copiedAppointmentDate = new Date(assignServiceData.date.getTime());
    assignServiceData['date'] = copiedAppointmentDate;
    assignServiceData['day'] = assignServiceData.date.getUTCDay();
    assignServiceData.time = assignServiceData.date.setUTCHours(assignServiceData.time.split(':')[0], assignServiceData.time.split(':')[1]);
    assignServiceData['time'] = assignServiceData.time;

    delete assignServiceData._id;
    var saveData = new AssignServiceForClient(assignServiceData);
    return new Promise((resolve, reject) => {
        saveData.save().then((assignService) => {
            log.debug(component, 'Saved Assign Service successfully');
            log.close();
            (async () => {
                let [findClientErr, findClientData] = await handle(Client.findOne({ 'clientName': assignService.clientName }));
                if (findClientErr) return Promise.reject(findClientErr);
                if (findClientData == undefined) {
                    let clientData = {
                        clientName: assignService.clientName,
                        clientAddress: assignService.address,
                        phone: assignService.phone
                    }
                    var saveModel = new Client(clientData);
                    let [err, clientDataSaved] = await handle(saveModel.save())
                    if (err) return Promise.reject(err);
                }
            })();
            return resolve(assignService);
        }).catch((err) => {
            log.error(component, 'Error while saving Assign Service data', { attach: err });
            log.close();
            return reject(err);
        })
    })
}

module.exports = {
    create: create
}