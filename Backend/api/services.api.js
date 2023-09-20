'use strict'
const component = "Services API";
const models = require('../models');
const Security = require("../util/security");
const Services = models.Services;
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

/* Create Services */
async function create(servicesData) {
    log.debug(component, 'Creating a Services', { 'attach': servicesData }); log.close();
    let [err1, data] = await handle(checkServicesAvailabilty(servicesData));
    console.log(data)
    if (data.length != 0) {
     return Promise.reject(ERR.SERVICE_ALREADY_EXISTS);
    }
    var saveModel = new Services(servicesData);
    let [err, servicesDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(servicesDataSaved)
}
async function checkServicesAvailabilty(serviceData) {
    var query = [];
    query =
        [
            {
                $match: {
                    'serviceName': serviceData.serviceName,
                    'duration':serviceData.duration
                }
            }
        ]
    return new Promise((resolve, reject) => {
        Services.aggregate(query).collation({ locale: "en", strength: 2 }).exec((err, service) => {
            if (err) {
                log.error(component, { attach: err });
                log.close();
                return reject(err);
            }
            console.log(service)
            if (service.length > 0) {
                return resolve(service);

            }
            else return resolve([]);
        })
    })
}
/* To Update Services - API */
const UpdateServices = async function (datatoupdate) {
    log.debug(component, 'Updating a Services', { 'attach': datatoupdate }); log.close();
    let servicesId = datatoupdate._id;
    delete datatoupdate._id
    let [servicesErr, servicesData] = await handle(Services.findOneAndUpdate({ "_id": servicesId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (servicesErr) return Promise.reject(servicesErr);
    else return Promise.resolve(servicesData);
}

/* Get Services by Id */
async function getServicesDataById(servicesId) {
    log.debug(component, 'Getting Services Data by Id');
    log.close();
    let [servicesErr, servicesData] = await handle(Services.findOne({ '_id': servicesId }).lean());
    if (servicesErr) return Promise.reject(servicesErr);
    if (lodash.isEmpty(servicesData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(servicesData);
}

/* Get All Services Detail */
async function getAllServicesDetails() {
    log.debug(component, 'Get All Services Detail'); log.close();
    let [err, servicesData] = await handle(Services.find({}).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(servicesData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(servicesData);
}

/* Enable / Disable Services By Services Id */
const enableDisableServices = async (servicesId) => {
    log.debug(component, 'Enable and Disable functionality');
    log.close();
    let [enableDisableErr, enableDisableData] = await handle(Services.findOne({ "_id": servicesId }));
    if (enableDisableErr) return Promise.reject(enableDisableErr);
    if (enableDisableData.status == 0) var query = { "$set": { "status": 2 } }
    else var query = { "$set": { "status": 0 } }
    let [err, enableDisableValue] = await handle(Services.findOneAndUpdate({ "_id": servicesId }, query, { new: true, useFindAndModify: false }))
    if (err) return Promise.reject(err);
    else return Promise.resolve(enableDisableValue);
}

module.exports = {
    create: create,
    UpdateServices: UpdateServices,
    getServicesDataById: getServicesDataById,
    getAllServicesDetails: getAllServicesDetails,
    enableDisableServices: enableDisableServices
}