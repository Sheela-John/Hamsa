'use strict'
const component = "Branch API";
const models = require('../models');
const Security = require("../util/security");
const Branch = models.Branch;
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
const NodeGeocoder = require('node-geocoder');

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

/* Create Branch */
async function create(branchData) {
    log.debug(component, 'Creating a Branch', { 'attach': branchData }); log.close();
    var saveModel = new Branch(branchData);
    let [err, branchDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(branchDataSaved)
}

/* To Update Branch - API */
const UpdateBranch = async function (datatoupdate) {
    log.debug(component, 'Updating a Branch', { 'attach': datatoupdate }); log.close();
    let branchId = datatoupdate._id;
    delete datatoupdate._id
    let [branchErr, branchData] = await handle(Branch.findOneAndUpdate({ "_id": branchId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (branchErr) return Promise.reject(branchErr);
    else return Promise.resolve(branchData);
}

/* Get Branch by Id */
async function getBranchDataById(branchId) {
    log.debug(component, 'Getting Branch Data by Id');
    log.close();
    let [branchErr, branchData] = await handle(Branch.findOne({ '_id': branchId }).lean());
    if (branchErr) return Promise.reject(branchErr);
    if (lodash.isEmpty(branchData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(branchData);
}

/* Get All Branch Detail */
async function getAllBranchDetails() {
    log.debug(component, 'Get All Branch Detail'); log.close();
    let [err, branchData] = await handle(Branch.find({}).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(branchData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(branchData);
}

/* Enable / Disable Branch By Branch Id */
const enableDisableBranch = async (branchId) => {
    log.debug(component, 'Enable and Disable functionality');
    log.close();
    let [enableDisableErr, enableDisableData] = await handle(Branch.findOne({ "_id": branchId }));
    if (enableDisableErr) return Promise.reject(enableDisableErr);
    if (enableDisableData.status == 0) var query = { "$set": { "status": 2 } }
    else var query = { "$set": { "status": 0 } }
    let [err, enableDisableValue] = await handle(Branch.findOneAndUpdate({ "_id": branchId }, query, { new: true, useFindAndModify: false }))
    if (err) return Promise.reject(err);
    else return Promise.resolve(enableDisableValue);
}

module.exports = {
    create: create,
    UpdateBranch: UpdateBranch,
    getBranchDataById: getBranchDataById,
    getAllBranchDetails: getAllBranchDetails,
    enableDisableBranch: enableDisableBranch
}