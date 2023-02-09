'use strict'
const component = "Settings API";
const models = require('../models');
const Security = require("../util/security");
const Settings = models.Settings;
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

/* Create Settings */
async function create(settingsData) {
    log.debug(component, 'Creating a Settings', { 'attach': settingsData }); log.close();
    var saveModel = new Settings(settingsData);
    let [err, settingsDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(settingsDataSaved)
}

/* To Update Settings - API */
const UpdateSettings = async function (datatoupdate) {
    log.debug(component, 'Updating a Settings', { 'attach': datatoupdate }); log.close();
    let settingsId = datatoupdate._id;
    delete datatoupdate._id
    let [settingsErr, settingsData] = await handle(Settings.findOneAndUpdate({ "_id": settingsId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (settingsErr) return Promise.reject(settingsErr);
    else return Promise.resolve(settingsData);
}

/* Get Settings by Id */
async function getSettingsDataById(settingsId) {
    log.debug(component, 'Getting Settings Data by Id');
    log.close();
    let [settingsErr, settingsData] = await handle(Settings.findOne({ '_id': settingsId }).lean());
    if (settingsErr) return Promise.reject(settingsErr);
    if (lodash.isEmpty(settingsData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(settingsData);
}

/* Get All Settings Detail */
async function getAllSettingsDetails() {
    log.debug(component, 'Get All Settings Detail'); log.close();
    let [err, settingsData] = await handle(Settings.find({}).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(settingsData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(settingsData);
}

/* Enable / Disable Settings By Settings Id */
const enableDisableSettings = async (settingsId) => {
    log.debug(component, 'Enable and Disable functionality');
    log.close();
    let [enableDisableErr, enableDisableData] = await handle(Settings.findOne({ "_id": settingsId }));
    if (enableDisableErr) return Promise.reject(enableDisableErr);
    if (enableDisableData.status == 0) var query = { "$set": { "status": 2 } }
    else var query = { "$set": { "status": 0 } }
    let [err, enableDisableValue] = await handle(Settings.findOneAndUpdate({ "_id": settingsId }, query, { new: true, useFindAndModify: false }))
    if (err) return Promise.reject(err);
    else return Promise.resolve(enableDisableValue);
}

module.exports = {
    create: create,
    UpdateSettings: UpdateSettings,
    getSettingsDataById: getSettingsDataById,
    getAllSettingsDetails: getAllSettingsDetails,
    enableDisableSettings: enableDisableSettings
}