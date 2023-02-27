'use strict'
const component = "Report API";
const models = require('../models');
const Security = require("../util/security");
const Staff = models.Staff;
const AssignServiceForClient = models.AssignServiceForClient;
const AssignServiceForBranch = models.AssignServiceForBranch;
const Client = models.Client;
const ClientDistance = models.clientDistance;
const Settings = models.Settings;
const Branch = models.Branch;
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
const request = require('request');
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

const activityReport = async (data) => {
    var query = [
        {
            '$match': {
                'date': { '$gte': new Date(data.startDate), '$lte': new Date(data.endDate) },
                'staffId': data.staffId
            }
        },
        {
            $addFields: {
                'staffObjId': { $toObjectId: "$staffId" },
                'assignedServiceObjId': { $toString: "$_id" },
                'serviceObjId': { $toObjectId: "$service" },
                'clientObjId': { $toObjectId: "$clientId" }
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
        {
            $lookup: {
                from: 'client',
                localField: 'clientObjId',
                foreignField: '_id',
                as: 'clientDetails'
            }
        },
        {
            $unwind: '$clientDetails'
        },
        {
            $lookup: {
                from: 'clientDistance',
                localField: 'assignedServiceObjId',
                foreignField: 'assignedServiceId',
                as: 'clientDistanceDetails'
            }
        },
        {
            $unwind: '$clientDistanceDetails'
        },
        {
            $lookup: {
                from: 'services',
                localField: 'serviceObjId',
                foreignField: '_id',
                as: 'servicesDetails'
            }
        },
        {
            $unwind: '$servicesDetails'
        }
    ]
    let [err, activityReportData] = await handle(AssignServiceForClient.aggregate(query));
    if (err) return Promise.reject(err);
    else return Promise.resolve(activityReportData);
}

const therapistReport = async (data) => {
    let [err1, therapistReportData1] = await handle(AssignServiceForClient.find({ 'date': { '$gte': new Date(data.startDate), '$lte': new Date(data.endDate) } }));
    if (err1) return Promise.reject(err1);

    const groupBy = (keys) => (array) =>
        array.reduce((objectsByKeyValue, obj) => {
            const value = keys.map((key) => obj[key]).join("-");
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
        }, {});

    const groupByStaffIdAndStatus = groupBy(["staffId", "status"]);

    const brandYearCount = Object
        .entries(groupByStaffIdAndStatus(therapistReportData1))
        .map(([, value]) =>
        ({
            staffId: value[0].staffId,
            staffName: value[0].staffName,
            assigned: value.length,
            completed: value[0].status == 1 ? value.length : 0,
        }))

    const result = Array.from(new Set(brandYearCount.map(s => s.staffId)))
        .map(lab => {
            let value1 = brandYearCount.filter(s => s.staffId === lab).map(edition => edition.assigned);
            let sum1 = 0;
            value1.forEach(item => {
                sum1 += item;
            });
            let value2 = brandYearCount.filter(s => s.staffId === lab).map(edition => edition.completed);
            let sum2 = 0;
            value2.forEach(item => {
                sum2 += item;
            });
            let value3 = brandYearCount.filter(s => s.staffId === lab).map(edition => edition.staffName);
            return {
                staffId: lab,
                staffName: value3[0],
                assigned: sum1,
                completed: sum2
            }
        })
    return Promise.resolve(result);
}

const travelExpenseReport = async (data) => {

    const today = new Date(data.endDate)
    // to return the date number(1-31) for the specified date
    let tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    //returns the tomorrow date
    let nextDate = new Date(tomorrow.setUTCHours(0, 0, 0, 0))

    var query = [
        {
            '$match': {
                'date': { '$gte': new Date(data.startDate), '$lte': new Date(data.endDate) }
            }
        },
        {
            $addFields: {
                'to': nextDate,
                'from': new Date(data.startDate)
            }
        },
        {
            $addFields: {
                'staffId': "$staffId",
                'staffObjId': { $toObjectId: "$staffId" },
                'settingsObjId': { $toObjectId: "$settingsId" },
                'startDistanceValue': "$startDistanceValue",
                'startDistanceValue': "$endDistanceValue",
                daysCount: {
                    $round: { $divide: [{ $subtract: ["$to", "$from"] }, 86400000] }
                }
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
        {
            $lookup: {
                from: 'settings',
                localField: 'settingsObjId',
                foreignField: '_id',
                as: 'settingsDetails'
            }
        },
        {
            $unwind: '$settingsDetails'
        },
        {
            $group:
            {
                _id: {
                    staffId: "$staffId"
                },
                startDistanceValue: { $sum: "$startDistanceValue" },
                endDistanceValue: { $sum: "$startDistanceValue" },
                travelDistanceinMetre: { $sum: { $add: ['$startDistanceValue', '$endDistanceValue'] } },
                daysCount: { $first: "$daysCount" },
                staffName: { $first: "$staffDetails.staffName" },
                travelExpenseCost: { $first: "$settingsDetails.twoWheelerTravelExpenseCost" },
                averageDistance: { $first: "$settingsDetails.twoWheelerAverageDistance" }
            },
        },
        {
            $sort:
                { "_id": 1 }
        },
        {
            $project: {
                '_id': "$_id.staffId",
                'startDistanceValue': 1,
                'endDistanceValue': 1,
                'travelDistanceinMetre': 1,
                'travelDistanceinKm': { $divide: ["$travelDistanceinMetre", 1000] },
                'daysCount': 1,
                'staffName': 1,
                'averageDistanceinMetre': { $divide: ["$travelDistanceinMetre", "$daysCount"] },
                'averageDistanceinKm': { $divide: [{ $divide: ["$travelDistanceinMetre", 1000] }, "$daysCount"] },
                'amount': { "$multiply": [{ $divide: ["$travelExpenseCost", "$averageDistance"] }, "$travelDistanceinMetre"] },
                'travelExpenseCost': 1
            }
        }
    ]
    let [reportErr, reportData] = await handle(ClientDistance.aggregate(query));
    if (reportErr) return Promise.reject(reportErr);
    else return Promise.resolve(reportData);
}

const attendenceReport = async (data) => {
    function dateRange(startDate, endDate, steps = 1) {
        const dateArray = [];
        let currentDate = new Date(startDate);

        while (currentDate <= new Date(endDate)) {
            dateArray.push(new Date(currentDate));
            // Use UTC date to prevent problems with time zones and DST
            currentDate.setUTCDate(currentDate.getUTCDate() + steps);
        }

        return dateArray;
    }

    const dates = dateRange(data.startDate, data.endDate);
    return Promise.resolve(dates);
}

module.exports = {
    activityReport: activityReport,
    therapistReport: therapistReport,
    travelExpenseReport: travelExpenseReport,
    attendenceReport: attendenceReport
}