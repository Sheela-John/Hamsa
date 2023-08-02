'use strict'
const component = "Branch Transfer API";
const models = require('../models');
const Security = require("../util/security");
const BranchTransfer = models.BranchTransfer;
const Branch=models.Branch;
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

/* Create BranchTransfer */

async function create(branchTransferData) {
    console.log('Creating a Branch Transfer', branchTransferData);
    var saveModel = new BranchTransfer(branchTransferData);
    let [err, branchTransferDataSaved] = await handle(saveModel.save());
    if (err) {
        console.error('Error saving branchTransferData:', err);
        return Promise.reject(err);
    } else {
        console.log('BranchTransferData saved successfully:', branchTransferDataSaved);
        return Promise.resolve(branchTransferDataSaved);
    }

}

// Get All Branch Transfer 

async function getAllBranchTransferDetails() {
    log.debug(component, 'Get All Branch Transfer Detail'); log.close();
    let [err, branchTransferData] = await handle(BranchTransfer.find({}).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(branchTransferData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(branchTransferData);
}

/* Get Branch by Id */
async function getBranchTransferDataById(branchTransferDataId) {
    log.debug(component, 'Getting Branch Transfer Data by Id');
    log.close();
    let [branchTransferErr, branchTransferData] = await handle(BranchTransfer.findOne({ '_id': branchTransferDataId }).lean());
    console.log(branchTransferData)
    let [branchErr, branchData] = await handle(Branch.findOne({ '_id': branchTransferData.branchId }).lean());
    branchTransferData.branchAddress=branchData.branchAddress;
    if (branchTransferErr) return Promise.reject(branchTransferErr);
    if (lodash.isEmpty(branchTransferData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(branchTransferData);
}

async function getBranchTransferByStaffId(id)
{
    log.debug(component, 'Getting Branch Transfer Data by Id');
    log.close();
    let [branchTransferErr, branchTransferData] = await handle(BranchTransfer.find({ 'staffId': id ,isDeleted:0}).lean());
    for(var i=0;i<branchTransferData.length;i++)
    {
        let [branchErr, branchData] = await handle(Branch.findOne({ '_id': branchTransferData[i].branchId }).lean());
        branchTransferData[i].branchName=branchData.branchName;
    }
    if (branchTransferErr) return Promise.reject(branchTransferErr);
    if (lodash.isEmpty(branchTransferData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(branchTransferData);
}

//Update Branch Transfer By Id

const UpdatebranchTransferData = async function (datatoupdate) {
    log.debug(component, 'Updating a branchTransferData', { 'attach': datatoupdate }); log.close();
    let branchTransferDataId = datatoupdate._id;
    delete datatoupdate._id
    let [branchTransferDataErr, branchTransferData] = await handle(BranchTransfer.findOneAndUpdate({ "_id": branchTransferDataId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (branchTransferDataErr) return Promise.reject(branchTransferDataErr);
    else return Promise.resolve(branchTransferData);
}

//Enabe Disable Branch Transfer By Id

async function deleteBranchTransfer(id) {

    log.debug(component, 'Enable and Disable Branch Transfer');
    log.close();
    let [err, singleData] = await handle(BranchTransfer.findOne({ _id: id }));
    if (err) return Promise.reject(err);
    let status = (singleData.isDeleted == 0) ? 1 : 0;
    let [error, branchTransferData] = await handle(BranchTransfer.findByIdAndUpdate({ _id: singleData._id }, { "$set": { "isDeleted": status } }, { new: true, useFindAndModify: false }));
    if (error) return Promise.reject(error);
    return Promise.resolve(branchTransferData);
}

const enableDisablebranchTransferData = async (branchTransferDataId) => {
    log.debug(component, 'Enable and Disable functionality');
    log.close();
    let [enableDisableErr, enableDisableData] = await handle(BranchTransfer.findOne({ "_id": branchTransferDataId }));
    if (enableDisableErr) return Promise.reject(enableDisableErr);
    if (enableDisableData.status == 0) var query = { "$set": { "status": 2 } }
    else var query = { "$set": { "status": 0 } }
    let [err, enableDisableValue] = await handle(BranchTransfer.findOneAndUpdate({ "_id": branchTransferDataId }, query, { new: true, useFindAndModify: false }))
    if (err) return Promise.reject(err);
    else return Promise.resolve(enableDisableValue);
}

module.exports = {
    create: create,
    getAllBranchTransferDetails: getAllBranchTransferDetails,
    getBranchTransferDataById:getBranchTransferDataById,
    UpdatebranchTransferData:UpdatebranchTransferData,
    enableDisablebranchTransferData:enableDisablebranchTransferData,
    getBranchTransferByStaffId:getBranchTransferByStaffId,
    deleteBranchTransfer:deleteBranchTransfer
}