'use strict'
const component = "travelAllowance API";
const models = require('../models');
const Security = require("../util/security");
const TravelAllowance = models.TravelAllowance;
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

/* Create travelAllowanceData */
async function create(TravelAllowanceData) {
    log.debug(component, 'Creating a travelAllowanceData', { 'attach': TravelAllowanceData }); log.close();
    var saveModel = new TravelAllowance(TravelAllowanceData);
    let [err, TravelAllowanceDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(TravelAllowanceDataSaved)
}

/* To Update travelAllowanceData - API */
const UpdatetravelAllowance = async function (datatoupdate) {
    log.debug(component, 'Updating a travelAllowanceData', { 'attach': datatoupdate }); log.close();
    let travelAllowanceId = datatoupdate._id;
    delete datatoupdate._id
    let [travelAllowanceDataErr, travelAllowanceData] = await handle(TravelAllowance.findOneAndUpdate({ "_id": travelAllowanceId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (travelAllowanceDataErr) return Promise.reject(travelAllowanceDataErr);
    else return Promise.resolve(travelAllowanceData);
}

/* Get travelAllowanceData by Id */
async function gettravelAllowancetDataById(travelAllowanceId) {
    log.debug(component, 'Getting travelAllowanceData Data by Id');
    log.close();
    let [travelAllowanceErr, travelAllowanceData] = await handle(TravelAllowance.findOne({ '_id': travelAllowanceId }).lean());
    if (travelAllowanceErr) return Promise.reject(travelAllowanceErr);
    if (lodash.isEmpty(travelAllowanceData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(travelAllowanceData);
}

/* Get All travelAllowanceData Detail */
async function getAlltravelAllowanceDetails(){
    log.debug(component, 'Get All travel Allowance Data Detail'); log.close();
    let [err, travelAllowanceData] = await handle(TravelAllowance.find().lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(travelAllowanceData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(travelAllowanceData);
}
module.exports = {
    create: create,
    UpdatetravelAllowance: UpdatetravelAllowance,
    gettravelAllowancetDataById: gettravelAllowancetDataById,
    getAlltravelAllowanceDetails: getAlltravelAllowanceDetails
}