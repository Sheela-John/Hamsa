'use strict'
const component = "serviceRequest API";
const models = require('../models');
const Security = require("../util/security");
const serviceRequest = models.ServiceRequest;
const Service = models.Services;
const Staff = models.Staff;
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
async function create(serviceRequestData) {
    log.debug(component, 'Creating a Services', { 'attach': serviceRequestData }); log.close();
    var saveModel = new serviceRequest(serviceRequestData);
    let [err, serviceRequestDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(serviceRequestDataSaved)
}

/* To Update Services - API */
const UpdateserviceRequest = async function (datatoupdate) {
    log.debug(component, 'Updating a serviceRequest', { 'attach': datatoupdate }); log.close();
    let serviceRequestId = datatoupdate._id;
    delete datatoupdate._id
    let [serviceRequestErr, serviceRequestData] = await handle(serviceRequest.findOneAndUpdate({ "_id": serviceRequestId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (serviceRequestErr) return Promise.reject(serviceRequestErr);
    else return Promise.resolve(serviceRequestData);
}

/* Get Services by Id */
async function getserviceRequestDataById(serviceRequestId) {
    log.debug(component, 'Getting serviceRequest Data by Id');
    log.close();
    let [serviceRequestErr, serviceRequestData] = await handle(serviceRequest.findOne({ '_id': serviceRequestId }).lean());
    if (serviceRequestErr) return Promise.reject(serviceRequestErr);
    if (lodash.isEmpty(serviceRequestData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(serviceRequestData);
}

/* Get All Services Detail */
async function getAllserviceRequestDetails(){
    log.debug(component, 'Get All Assign Service Detail'); log.close();
    let [err, serviceRequestData] = await handle(serviceRequest.find().lean());
    console.log(serviceRequestData)
    for(var i=0;i<serviceRequestData.length;i++)
    {
        let [err, clientData] = await handle(Client.findOne({_id:serviceRequestData[i].clientId}).lean());
        let [err1, staffData] = await handle(Staff.findOne({_id:serviceRequestData[i].staffId}).lean());
        let [err2,serviceData]= await handle(Service.findOne({_id:serviceRequestData[i].serviceId}).lean());
        console.log(err2,"serviceData",serviceData)
        serviceRequestData[i].clientId=clientData.clientName;
        serviceRequestData[i].staffId=staffData.staffName;
        serviceRequestData[i].serviceId=serviceData.serviceName;
    }
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(serviceRequestData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(serviceRequestData);
}
module.exports = {
    create: create,
    UpdateserviceRequest: UpdateserviceRequest,
    getserviceRequestDataById: getserviceRequestDataById,
    getAllserviceRequestDetails: getAllserviceRequestDetails
}