'use strict'
const component = "Attemdence API";
const models = require('../models');
const Security = require("../util/security");
const Attendence = models.Attendence;
const AssignService = models.AssignService;
const Branch = models.Branch;
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

const request = require('request');

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
    var saveModel = new Attendence(attendenceData);
    let [err, attendenceDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(attendenceDataSaved)
}

// to update attendence
const UpdateAttendence = async function (datatoupdate) {
    log.debug(component, 'Updating a Branch', { 'attach': datatoupdate }); log.close();
    let AttendenceId = datatoupdate._id;
    delete datatoupdate._id
    let [branchErr, branchData] = await handle(Attendence.findOneAndUpdate({ "_id": AttendenceId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (branchErr) return Promise.reject(branchErr);
    else return Promise.resolve(branchData)
}

const getAttendenceofStaff = async (staffId) => {
    let [findStaffErr, staffData] = await handle(Attendence.find({ 'staffId': staffId }));
    if (findStaffErr) return Promise.reject(findStaffErr);
    return Promise.resolve(staffData);
}

const getAttendenceofStaffByDateRange = async (data) => {

    var value = new Date(data.endDate).getTime() - new Date(data.startDate).getTime()
    let differentDays = Math.ceil(value / (1000 * 3600 * 24));

    if ((differentDays + 1) > 31) {
        return Promise.reject(ERR.NUMBER_OF_DAYS)
    }
    var query = [
        {
            '$match': {
                'date': { '$gte': new Date(data.startDate), '$lte': new Date(data.endDate) },
            }
        },

        {
            $addFields: {
                'staffObjId': { $toObjectId: '$staffId' }
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
            $project: {
                staffId: "$staffDetails._id",
                staffName: "$staffDetails.staffName",
                startTime: "$startTime",
                endTime: "$endTime",
                inTime: "$inTime",
                outTime: "$outTime",
                date: "$date"
            }
        },
        {
            $sort: {
                date: 1
            }
        },
        {
            $group: {
                "_id": "$staffId",
                "doc": { "$addToSet": "$$ROOT" }
            }
        },

    ]
    let [err, attendenceData] = await handle(Attendence.aggregate(query));
    for (var i = 0; i < attendenceData.length; i++) {
        for (var j = 0; j < attendenceData[i].doc.length; j++) {
            if (attendenceData[i].doc[j].outTime == undefined) {

                let [err, assign] = await handle(AssignService.find({ "staffId": (attendenceData[i]._id).toString(), "date": attendenceData[i].doc[j].date }))

                var out;

                if (assign.length != 0) {
                    var val = Number(assign[0].endTime.split(':')[0] + assign[0].endTime.split(':')[1])
                    console.log("inside")
                    for (var x = 1; x < assign.length; x++) {
                        if (Number(assign[x].endTime.split(':')[0] + assign[x].endTime.split(':')[1]) > val) {
                            val = Number(assign[x].endTime.split(':')[0] + assign[x].endTime.split(':')[1])
                            out = assign[x].endTime;
                            //  console.log("out",out)
                        }
                    }

                    attendenceData[i].doc[j].outTime = out;
                }
                else {
                    attendenceData[i].doc[j].outTime = attendenceData[i].doc[j].endTime
                }
            }
            console.log("attendenceData[i].doc[j]", attendenceData[i].doc[j])
            var startTime = attendenceData[i].doc[j].startTime.split(':');
            var endTime = attendenceData[i].doc[j].inTime.split(':');
            var startHr = parseInt(startTime[0], 10);
            var startMin = parseInt(startTime[1], 10);
            var endHr = parseInt(endTime[0], 10);
            var endMin = parseInt(endTime[1], 10);
            var lateBy, ot;

            if (startHr == endHr) {
                lateBy = (endMin - startMin);
            }
            else {
                lateBy = ((endHr - startHr) * 60) + (endMin - startMin)
            }
            if (lateBy < 0) {
                attendenceData[i].doc[j].earlyBy = Math.abs(lateBy)
                attendenceData[i].doc[j].lateBy = 0;
            }
            else {
                attendenceData[i].doc[j].earlyBy = 0
                attendenceData[i].doc[j].lateBy = lateBy;
            }

            attendenceData[i].doc[j].totalOT = ot;

            var tempDate = attendenceData[i].doc[j].date.toLocaleDateString().split('/')[2] + "-" + attendenceData[i].doc[j].date.toLocaleDateString().split('/')[1] + "-" + attendenceData[i].doc[j].date.toLocaleDateString().split('/')[0]
            var tempdate = new Date(tempDate + " " + attendenceData[i].doc[j].inTime).getTime();
            var tempdate1 = new Date(tempDate + " " + attendenceData[i].doc[j].outTime).getTime();
            var data1 = Math.ceil((tempdate1 - tempdate) / (1000 * 60));
            var hours = Math.floor(data1 / 60);
            var minutes = data1 % 60;
            attendenceData[i].doc[j].duration = hours + ":" + minutes;
            var otData = data1 - 480;
            var othours = Math.floor(otData / 60);
            var otminutes = data1 % 60;
            attendenceData[i].doc[j].totalOT = othours + ":" + otminutes;;

            if (data1 == 480 || data1 < 480) {
                attendenceData[i].doc[j].totalOT = "0:0";
            }

            var distance = 0;
            var duration = 0;
            let [Err, assignServiceData] = await handle(AssignService.find({ 'staffId': attendenceData[i].doc[j].staffId, date: attendenceData[i].doc[j].date.toString() }).lean());
            console.log("assignServiceData", assignServiceData)
            if (assignServiceData.length != 0) {
                for (var k = 0; k < assignServiceData.length; k++) {
                    var temp = {
                        "branchId": assignServiceData[i].branchId,
                        "elatitude": assignServiceData[i].latitude,
                        "elongitude": assignServiceData[i].longitude
                    }
                    var [err3, tmep] = await handle(travelDistance(temp));
                    console.log("dd", tmep)
                    distance = distance + tmep.distance;
                    var val = Number(tmep.duration.split('s')[0]);
                    duration = duration + val;
                    duration = Math.floor(duration / 60);
                    console.log("distance", distance, duration)
                    attendenceData[i].doc[j].travelDistance = distance;
                    attendenceData[i].doc[j].travelDuration = duration;
                }
            }
            else {
                attendenceData[i].doc[j].travelDistance = distance;
                attendenceData[i].doc[j].travelDuration = duration;
            }

        }
    }
    if (err) return Promise.reject(err);
    else return Promise.resolve(attendenceData);
}
const travelDistance = async (data) => {
    let [err, branchData] = await handle(Branch.findOne({ "_id": data.branchId }))
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            body: {
                "origin": {
                    "location": {
                        "latLng": {
                            "latitude": data.elatitude,
                            "longitude": data.elongitude
                        }
                    }
                },
                "destination": {
                    "location": {
                        "latLng": {
                            "latitude": branchData.latitude,
                            "longitude": branchData.longitude
                        }
                    }
                },
            },
            url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
            headers: {
                'X-Goog-Api-Key': 'AIzaSyCX_9dtirFHcsQY8zjjR86cettocdHOT50',
                'Content-Type': 'application/json',
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
            },
            json: true //Parse the JSON string in the response
        };
        request(options, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            log.debug('Travel Distance response', { attach: response.body }); log.close();
            (async () => {
                var value = {
                    duration: response.body.routes[0].duration,
                    distance: response.body.routes[0].distanceMeters / 1000
                }
                return resolve(value)
            })();
        });
    });
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

async function toUpdateCount(data) {
    let [Err, assignServiceData] = await handle(AssignService.find({ 'staffId': data.staffId, date: new Date(data.date) }).lean());
    console.log(assignServiceData)
    //var len=assignServiceData.length;
    let i;
    for (i = 0; i < assignServiceData.length; i++) {
        console.log(i)
        var temp=0;
        temp = assignServiceData[i].travelCount + 1;
        let [Err1, assignServiceData1] = await handle(AssignService.findOneAndUpdate({ '_id': assignServiceData[i]._id }, { "$set": { "travelCount": temp } }).lean());
    }
    if (Err) return Promise.reject(Err);
    else return Promise.resolve(assignServiceData);
}
module.exports = {
    entryAttendence: entryAttendence,
    UpdateAttendence: UpdateAttendence,
    getAttendenceofStaff: getAttendenceofStaff,
    getAttendenceofStaffByDateRange: getAttendenceofStaffByDateRange,
    getAttendenceofToday: getAttendenceofToday,
    toUpdateCount: toUpdateCount
}