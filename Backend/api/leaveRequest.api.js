'use strict'
const component = "LeaveRequest API";
const models = require('../models');
const Security = require("../util/security");
const leaveRequest = models.LeaveRequest;
const Staff = models.Staff;
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

/* Create leaveRequest */
async function create(leaveRequestData) {
    log.debug(component, 'Creating a leaveRequest', { 'attach': leaveRequestData }); log.close();
    var saveModel = new leaveRequest(leaveRequestData);
    let [err, leaveRequestDatasaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(leaveRequestDatasaved)
}

/* To Update leaveRequest - API */
const UpdateleaveRequest = async function (datatoupdate) {
    log.debug(component, 'Updating a leaveRequest', { 'attach': datatoupdate }); log.close();
    let leaveRequestId = datatoupdate._id;
    delete datatoupdate._id
    let [leaveRequestErr, leaveRequestData] = await handle(leaveRequest.findOneAndUpdate({ "_id": leaveRequestId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (leaveRequestErr) return Promise.reject(leaveRequestErr);
    else return Promise.resolve(leaveRequestData);
}

/* Get leaveRequest by Id */
async function getleaveRequestDataById(leaveRequestId) {
    log.debug(component, 'Getting leaveRequest Data by Id');
    log.close();
    let [leaveRequestErr, leaveRequestData] = await handle(leaveRequest.findOne({ '_id': leaveRequestId }).lean());
    if (leaveRequestErr) return Promise.reject(leaveRequestErr);
    if (lodash.isEmpty(leaveRequestData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(leaveRequestData);
}

/* Get All leaveRequest Detail */
async function getAllleaveRequestDetails(){
    log.debug(component, 'Get All leaveRequest Detail'); log.close();
    let [err, leaveRequestData] = await handle(leaveRequest.find().lean());
    console.log(leaveRequestData)
    for(var i=0;i<leaveRequestData.length;i++)
    {
        let [err1, staffData] = await handle(Staff.findOne({_id:leaveRequestData[i].staffId}).lean()); 
        console.log("leaveRequestData",leaveRequestData)
        leaveRequestData[i].staffId=staffData.staffName;
    }
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(leaveRequestData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(leaveRequestData);
}
module.exports = {
    create: create,
    UpdateleaveRequest: UpdateleaveRequest,
    getleaveRequestDataById: getleaveRequestDataById,
    getAllleaveRequestDetails: getAllleaveRequestDetails
}