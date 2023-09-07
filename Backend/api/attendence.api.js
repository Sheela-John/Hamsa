'use strict'
const component = "Attemdence API";
const models = require('../models');
const Security = require("../util/security");
const Attendence = models.Attendence;
const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');
const AssignService = models.AssignService;
const Branch = models.Branch;
let cron = require('node-cron');
let nodemailer = require('nodemailer');
const TravelCount = models.TravelCount;
const Staff = models.Staff;
const lodash = require('lodash');
const ERR = require('../errors.json');
const uuid = require('../util/misc');
const security = require('../util/security');
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
var fs = require('fs');
const multerS3 = require('multer-s3');
const moment = require('moment');
const momentTz = require('moment-timezone');
const generateRandomPassword = require('../util/generateCode').randomString;
const genrateDefaultImage = require('../util/generateCode').genrateDefaultImage;
const NodeGeocoder = require('node-geocoder');
const request = require('request');
const log = require('../util/logger').log(component, __filename);

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

const entryAttendence = async (attendenceData) => {
    attendenceData.date = new Date(attendenceData.date);


    if (!attendenceData.inTimeArray) {
        attendenceData.inTimeArray = [];
    }
    attendenceData.inTimeArray.push(attendenceData.inTime);

    var saveModel = new Attendence(attendenceData);
    let [err, attendenceDataSaved] = await handle(saveModel.save());

    if (err) {
        return Promise.reject(err);
    } else {
        return Promise.resolve(attendenceDataSaved);
    }
};


// to update attendence

const UpdateAttendence = async function (datatoupdate) {
    log.debug(component, 'Updating an Attendence', { 'attach': datatoupdate });
    log.close();

    let AttendenceId = datatoupdate._id;
    delete datatoupdate._id;

    // Get the existing Attendence document
    let [attendenceErr, existingAttendenceData] = await handle(Attendence.findById(AttendenceId));
    if (attendenceErr) return Promise.reject(attendenceErr);

    // Update inTimeArray and outTimeArray based on changes in inTime and outTime
    if (datatoupdate.inTime) {
        if (!existingAttendenceData.inTimeArray) {
            existingAttendenceData.inTimeArray = [];
        }
        existingAttendenceData.inTimeArray.push(datatoupdate.inTime);
        existingAttendenceData.inTime = datatoupdate.inTime;
    }

    if (datatoupdate.outTime) {
        if (!existingAttendenceData.outTimeArray) {
            existingAttendenceData.outTimeArray = [];
        }
        existingAttendenceData.outTimeArray.push(datatoupdate.outTime);
        existingAttendenceData.outTime = datatoupdate.outTime;
    }

    // Update the document
    if (datatoupdate.switchStatus) {
        existingAttendenceData.switchStatus = datatoupdate.switchStatus
    }
    let [attendenceUpdateErr, updatedAttendenceData] = await handle(Attendence.findOneAndUpdate(
        { "_id": AttendenceId },
        { $set: existingAttendenceData },
        { new: true, useFindAndModify: false }
    ));

    if (attendenceUpdateErr) {
        return Promise.reject(attendenceUpdateErr);
    } else {
        return Promise.resolve(updatedAttendenceData);
    }
};

const getAttendenceofStaff = async (staffId) => {
    let [findStaffErr, staffData] = await handle(Attendence.find({ 'staffId': staffId }));
    if (findStaffErr) return Promise.reject(findStaffErr);
    return Promise.resolve(staffData);
}

const getAttendenceofStaffByDateRangeDetails = async (data) => {
    var value = new Date(data.endDate).getTime() - new Date(data.startDate).getTime()
    let differentDays = Math.ceil(value / (1000 * 3600 * 24));
    if ((differentDays + 1) > 31) {
        return Promise.reject(ERR.NUMBER_OF_DAYS)
    }
    var query = [
        {
            '$match': {
                'date': { '$gte': new Date(data.startDate), '$lte': new Date(data.endDate) },
                'staffId': data.staffId
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
                date: "$date",
                inTimeArray: "$inTimeArray",
                outTimeArray: "$outTimeArray"
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
            let [Err1, travelCountData] = await handle(TravelCount.find({ 'staffId': attendenceData[i].doc[j].staffId, date: (attendenceData[i].doc[j].date) }).sort({ count: 1 }).lean());
            var totalDistance = [];
            var totalDuration = [];
            if(travelCountData.length!=0)
            {
            for (var l = 0; l < travelCountData.length; l++) {
                let [Err, assignServiceData] = await handle(AssignService.findOne({ '_id': travelCountData[l].assignServiceId }).lean());
                // console.log("assignServiceData", assignServiceData)
                if (l == 0) {
                    let [err, branchData] = await handle(Branch.findOne({ "_id": assignServiceData.branchId }))
                    // console.log("branchData", branchData)
                    var temp = {
                        "latitude": branchData.latitude,
                        "longitude": branchData.longitude,
                        "elatitude": assignServiceData.slatitude,
                        "elongitude": assignServiceData.slongitude
                    }
                    // console.log(temp)
                    var [err3, val] = await handle(travelDistance(temp));
                    //  console.log("val", val)
                    totalDistance.push(val.distance);
                    console.log()
                    totalDuration.push(Number((val.duration).split('s')[0]))
                }
                else {
                    let [Err, assignServiceData1] = await handle(AssignService.findOne({ '_id': travelCountData[l - 1].assignServiceId }).lean());
                    var temp = {
                        "latitude": assignServiceData1.slatitude,
                        "longitude": assignServiceData1.slongitude,
                        "elatitude": assignServiceData.slatitude,
                        "elongitude": assignServiceData.slongitude
                    }
                    // console.log(temp)
                    var [err3, val] = await handle(travelDistance(temp));
                    //   console.log("val1", val)
                    totalDistance.push(val.distance);
                    totalDuration.push(Number((val.duration).split('s')[0]))
                }
            }
        }
        console.log("totalDistance",totalDistance,totalDuration)
          if(totalDistance.length!=0 && totalDuration.length!=0)
          {
            distance = totalDistance.reduce((a, b) => a + b, 0);
            duration = totalDuration.reduce((a, b) => a + b, 0);
          
            attendenceData[i].doc[j].travelDistance = distance;
            attendenceData[i].doc[j].travelDuration = duration / 60;
          }
          else{
            attendenceData[i].doc[j].travelDistance = distance;
            attendenceData[i].doc[j].travelDuration = duration ;
          }
          console.log("success3")
            // Calculate totalDuration
            attendenceData[i].doc[j].totalDuration = 0;  // Initialize totalDuration
            for (var k = 0; k < attendenceData[i].doc[j].inTimeArray.length; k++) {
                if(attendenceData[i].doc[j].outTimeArray.length!=0)
                {
                var startTime = attendenceData[i].doc[j].inTimeArray[k].split(':');
                var endTime = attendenceData[i].doc[j].outTimeArray[k].split(':');
                var startHr = parseInt(startTime[0], 10);
                var startMin = parseInt(startTime[1], 10);
                var endHr = parseInt(endTime[0], 10);
                var endMin = parseInt(endTime[1], 10);
                var duration = ((endHr - startHr) * 60) + (endMin - startMin);
                attendenceData[i].doc[j].totalDuration += duration;
                }
                else{
                    attendenceData[i].doc[j].totalDuration = 0;
                }
            }
            if(attendenceData[i].doc[j].totalDuration!=0)
            {
            var totalDurationHours = Math.floor(attendenceData[i].doc[j].totalDuration / 60);
            var totalDurationMinutes = attendenceData[i].doc[j].totalDuration % 60;
            totalDurationMinutes=String(totalDurationMinutes);
            totalDurationHours=String(totalDurationHours);
            attendenceData[i].doc[j].totalDurationFormatted =( (totalDurationHours).length!=2 ? "0"+totalDurationHours :totalDurationHours) + ":" +( (totalDurationMinutes).length!=2 ? "0"+totalDurationMinutes : totalDurationMinutes);
            }
            else{
                attendenceData[i].doc[j].totalDurationFormatted="00:00" 
            }
        }
    }
    for (var i = 0; i < attendenceData.length; i++) {
        attendenceData[i].doc.sort(GFG_sortFunction);
        function GFG_sortFunction(a, b) {
            return a.date > b.date ? 1 : -1;
        }
    };
    console.log("attendenceData",attendenceData)
    if (err) return Promise.reject(err);
    else return Promise.resolve(attendenceData);
}
const travelDistance = async (data) => {
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
                            "latitude": data.latitude,
                            "longitude": data.longitude
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
    let [err, attendenceData] = await handle(Attendence.find({ 'staffId': data.staffId, 'date': new Date(data.date) }));
    if (err) return Promise.reject(err);
    else return Promise.resolve(attendenceData);
}

async function tosaveCount(data) {
    console.log("ds", new Date(new Date(data.date).getTime()))
    data.date = new Date(data.date)
    var saveModel = new TravelCount(data);
    let [err, attendenceDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(attendenceDataSaved)
}

async function togetPreviouseCount(data) {
    let [Err, countData] = await handle(TravelCount.find({ 'staffId': data.staffId, 'date': new Date(data.date) }));
    if (Err) return Promise.reject(Err);
    else return Promise.resolve(countData)
}

async function AttendanceReportDailyMail() {
    var schedule=cron.schedule('30 20 * * *', async () => {
    var from1 = new Date();
    var to1 = new Date();
    var from = from1.getFullYear() + "-" + ((from1.getMonth() + 1).length != 2 ? "0" + (from1.getMonth() + 1) : (from1.getMonth() + 1)) + "-" + (from1.getDate().length != 2 ? "0" + from1.getDate() : from1.getDate());
    var to = to1.getFullYear() + "-" + ((to1.getMonth() + 1).length != 2 ? "0" + (to1.getMonth() + 1) : (to1.getMonth() + 1)) + "-" + (to1.getDate().to1 != 2 ? "0" + to1.getDate() : to1.getDate());
    console.log("ada")
    let [err, staffData] = await handle(Staff.find().lean());
    var attendanceArray = [];
    console.log(staffData)
    for (var i = 0; i < staffData.length; i++) {
        if (staffData[i].role == "PORTAL_STAFF") {
            var temp = {
                startDate: from,
                endDate: to,
                staffId: (staffData[i]._id).toString()
            }
            let [err1, staffAttendanceData] = await handle(getAttendenceofStaffByDateRangeDetails(temp));
            if (staffAttendanceData.length != 0) {
                for (var j = 0; j < staffAttendanceData.length; j++) {
                    for (var k = 0; k < staffAttendanceData[j].doc.length; k++) {
                        var value = {
                            Staff_Name: staffAttendanceData[j].doc[k].staffName,
                            InTime: staffAttendanceData[j].doc[k].inTime,
                            OutTime: staffAttendanceData[j].doc[k].outTime,
                            Date: staffAttendanceData[j].doc[k].date,
                            Travel_Distance: staffAttendanceData[j].doc[k].travelDistance,
                            Travel_Duration: staffAttendanceData[j].doc[k].travelDuration,
                            Total_Duration: staffAttendanceData[j].doc[k].totalDurationFormatted,
                        }
                        attendanceArray.push(value)
                    }
                }
            }
        }
    }
    const header = ['staffName', 'startTime', 'endTime', 'inTime', 'outTime', 'date', 'travelDistance', 'travelDuration', 'totalDuration'];
    const csvFromArrayOfArrays = convertArrayToCSV(attendanceArray, {
        header,
        separator: ';'
    });
    console.log(csvFromArrayOfArrays)
    sendMail(csvFromArrayOfArrays)
      })
      schedule.start();

}
function sendMail(csvFromArrayOfArrays) {
    let userName = '';
    console.log("csvFromArrayOfArrays", csvFromArrayOfArrays)
    var attachments = {
        filename: "DailyReport.csv",
        content: csvFromArrayOfArrays,
    }
    var staffData=[];
    staffData=[{staffName:"Hr",email:"Hr@hamsarehab.com"},{staffName:"Operations",email:"Operations@hamsarehab.com"}]
    staffData.forEach((element) => {
        userName = element.staffName;
     
            let subject = "Daily Attendance Report"
            html.create({
                data: {
                    userName: `${element.staffName}`,
                },
                templateName: "attendance_report"
            },
                (err, contents) => {
                    if (err == null)

                        require('../util/email').send(element.email, subject, contents, attachments, () => {
                         //   cb(null);
                        });
                    else {
                       // cb(err);
                    }
                })

       
    });
}
async function AttendanceReportMonthlyMail() {
    var schedule=cron.schedule('30 20 25 * *', async () => {
    var from1 = new Date();
    var to1 = new Date(new Date().setDate(from1.getDate() - 30));
   
    var from = from1.getFullYear() + "-" + ((from1.getMonth() + 1).length != 2 ? "0" + (from1.getMonth() + 1) : (from1.getMonth() + 1)) + "-" + (from1.getDate().length != 2 ? "0" + from1.getDate() : from1.getDate());
    var to = to1.getFullYear() + "-" + ((to1.getMonth() + 1).length != 2 ? "0" + (to1.getMonth() + 1) : (to1.getMonth() + 1)) + "-" + (to1.getDate().to1 != 2 ? "0" + to1.getDate() : to1.getDate());
    let [err, staffData] = await handle(Staff.find().lean());
    var attendanceArray = [];
    for (var i = 0; i < staffData.length; i++) {
        if (staffData[i].role == "PORTAL_STAFF") {
            console.log("staffData[i].role",staffData[i].role)
            var temp = {
                startDate: to,
                endDate: from,
                staffId: (staffData[i]._id).toString()
            }
            console.log("temp",temp)
            let [err1, staffAttendanceData] = await handle(getAttendenceofStaffByDateRangeDetails(temp));
            if (staffAttendanceData.length != 0) {
                for (var j = 0; j < staffAttendanceData.length; j++) {
                    for (var k = 0; k < staffAttendanceData[j].doc.length; k++) {
                        var value = {
                            Staff_Name: staffAttendanceData[j].doc[k].staffName,
                            InTime: staffAttendanceData[j].doc[k].inTime,
                            OutTime: staffAttendanceData[j].doc[k].outTime,
                            Date: staffAttendanceData[j].doc[k].date,
                            Travel_Distance: staffAttendanceData[j].doc[k].travelDistance,
                            Travel_Duration: staffAttendanceData[j].doc[k].travelDuration,
                            Total_Duration: staffAttendanceData[j].doc[k].totalDurationFormatted,
                        }
                        attendanceArray.push(value)
                    }
                }
            }
        }
    }
    const header = ['staffName','inTime', 'outTime', 'date', 'travelDistance', 'travelDuration', 'totalDuration'];
    const csvFromArrayOfArrays = convertArrayToCSV(attendanceArray, {
        header,
        separator: ';'
    });
    console.log(csvFromArrayOfArrays)
   sendMailMonth(csvFromArrayOfArrays)
     })
     schedule.start();

}
function sendMailMonth(csvFromArrayOfArrays) {
    let userName = '';
    console.log("csvFromArrayOfArrays", csvFromArrayOfArrays)
    var attachments = {
        filename: "MonthlyStaffViseReport.csv",
        content: csvFromArrayOfArrays,
    }
    var staffData=[];
    staffData=[{staffName:"Hr",email:"Hr@hamsarehab.com"},{staffName:"Operations",email:"Operations@hamsarehab.com"},{staffName:"Accounts",email:"Accounts@hamsarehab.com"}]
    staffData.forEach((element) => {
        userName = element.staffName;
      
            let subject = "Monthly Staff Attendance Report"
            html.create({
                data: {
                    userName: `${element.staffName}`,
                },
                templateName: "attendance_report"
            },
                (err, contents) => {
                    if (err == null)

                        require('../util/email').send(element.email, subject, contents, attachments, () => {
                            //cb(null);
                        });
                    else {
                       // cb(err);
                    }
                })
    });
}





module.exports = {
    entryAttendence: entryAttendence,
    UpdateAttendence: UpdateAttendence,
    getAttendenceofStaff: getAttendenceofStaff,
    getAttendenceofToday: getAttendenceofToday,
    tosaveCount: tosaveCount,
    togetPreviouseCount: togetPreviouseCount,
    getAttendenceofStaffByDateRangeDetails: getAttendenceofStaffByDateRangeDetails,
    AttendanceReportDailyMail: AttendanceReportDailyMail,
    AttendanceReportMonthlyMail:AttendanceReportMonthlyMail
}