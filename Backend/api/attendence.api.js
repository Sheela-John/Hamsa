'use strict'
const component = "Attemdence API";
const models = require('../models');
const Security = require("../util/security");
const Attendence = models.Attendence;
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

const entryAttendence = async (attendenceData) => {
    attendenceData.date = new Date(attendenceData.date);
    let someDate = attendenceData.date
    let copiedAppointmentDate = new Date(someDate.getTime());
    attendenceData['date'] = copiedAppointmentDate;
    attendenceData['inTime'] = new Date();
    var saveModel = new Attendence(attendenceData);
    let [err, attendenceDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(attendenceDataSaved)
}

const getAttendenceofStaff = async (staffId) => {
    let [findStaffErr, staffData] = await handle(Attendence.find({ 'staffId': staffId }));
    if (findStaffErr) return Promise.reject(findStaffErr);
    return Promise.resolve(staffData);
}

const getAttendenceofStaffByDateRange = async (data) => {
    var query = [
        {
            '$match': {
                'date': { '$gte': new Date(data.startDate), '$lte': new Date(data.endDate) },
                'staffId': data.staffId
            }
        },
        {
            $addFields: {
                'staffObjId': { $toObjectId: data.staffId }
            }
        },
        {
            $lookup: {
                from: 'staff',
                localField: 'staffObjId',
                foreignField: '_id',
                as: 'staffDetails'
            }
        },
        {
            $unwind: '$staffDetails'
        },
    ]
    let [err, attendenceData] = await handle(Attendence.aggregate(query));
    if (err) return Promise.reject(err);
    else return Promise.resolve(attendenceData);
}

const getAttendenceofToday = async (data) => {
    var query = [
        {
            '$match': {
                'date': new Date(data.date),
                'staffId': data.staffId
            }
        },
        {
            $addFields: {
                'staffObjId': { $toObjectId: data.staffId }
            }
        },
        {
            $lookup: {
                from: 'staff',
                localField: 'staffObjId',
                foreignField: '_id',
                as: 'staffDetails'
            }
        },
        {
            $unwind: '$staffDetails'
        },
    ]
    let [err, attendenceData] = await handle(Attendence.aggregate(query));
    if (err) return Promise.reject(err);
    else return Promise.resolve(attendenceData);
}

module.exports = {
    entryAttendence: entryAttendence,
    getAttendenceofStaff: getAttendenceofStaff,
    getAttendenceofStaffByDateRange: getAttendenceofStaffByDateRange,
    getAttendenceofToday: getAttendenceofToday
}