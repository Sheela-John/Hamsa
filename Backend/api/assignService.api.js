'use strict'
const component = "Staff API";
const models = require('../models');
const Security = require("../util/security");
const AssignServiceForClient = models.AssignServiceForClient;
const AssignServiceForBranch = models.AssignServiceForBranch;
const AssignServiceInvoice = models.AssignServiceInvoice;
const AttendenceAPI = require('../api/attendence.api');
const AssignService = models.AssignService;
const Client = models.Client;
const TravelCount = models.TravelCount;
const Staff = models.Staff;
const Role = models.Role;
const ClientDistance = models.clientDistance;
const Settings = models.Settings;
const Branch = models.Branch;
const Service = models.Services;
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
const { assignServiceForBranch } = require('../models');
const generateRandomPassword = require('../util/generateCode').randomString;
const genrateDefaultImage = require('../util/generateCode').genrateDefaultImage;
const request = require('request');
const NodeGeocoder = require('node-geocoder');

const log = require('../util/logger').log(component, __filename);

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

/* Create Assign Service API - Client */
const assignServiceClient = async (assignServiceData) => {
    log.debug(component, 'Creating New Assign Service - for Service', assignServiceData);
    log.close();
    let [staffErr, staffData] = await handle(Staff.findOne({ '_id': assignServiceData.staffId }).lean());
    if (staffErr) return Promise.reject(staffErr);
    if (lodash.isEmpty(staffData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    assignServiceData.status = 0;
    assignServiceData.date = new Date(assignServiceData.date);
    let someDate = assignServiceData.date
    console.log(someDate, "someDate")
    let copiedAppointmentDate = new Date(someDate.getTime());
    console.log(copiedAppointmentDate, "copiedA")
    assignServiceData['date'] = copiedAppointmentDate;
    console.log(assignServiceData.date)
    delete assignServiceData._id;

    return new Promise((resolve, reject) => {
        (async () => {
            let [findStaffErr, staffNameData] = await handle(Staff.findOne({ '_id': (assignServiceData.staffId) }));
            if (findStaffErr) return Promise.reject(findStaffErr);
            let [settingsErr, settingsDataFind] = await handle(Settings.find({}).lean());
            if (settingsErr) return Promise.reject(settingsErr);
            if (lodash.isEmpty(settingsDataFind)) return Promise.reject(ERR.NO_RECORDS_FOUND);
            var settingsData = settingsDataFind[settingsDataFind.length - 1]
            assignServiceData['settingsId'] = settingsData._id;
            assignServiceData['staffName'] = staffNameData.staffName;
            let [findClientErr, findClientData] = await handle(Client.findOne({ '_id': assignServiceData.clientId }));
            //  console.log("findClientData", findClientData)
            // assignServiceData['clientId'] = findClientData._id;
            assignServiceData['latitude'] = findClientData.clientAddressLatitude;
            assignServiceData['longitude'] = findClientData.clientAddressLongitude;
            if (findClientErr) return Promise.reject(findClientErr);
            const options = {
                provider: 'google',
                httpAdapter: 'https',
                apiKey: 'AIzaSyCX_9dtirFHcsQY8zjjR86cettocdHOT50', // for Mapquest, OpenCage, Google Premier
                formatter: null // 'gpx', 'string', ...
            };
            const geocoder = NodeGeocoder(options);
            const res = await geocoder.geocode(assignServiceData.address);
            let clientData = {
                clientName: assignServiceData.clientName,
                clientAddress: assignServiceData.address,
                phone: assignServiceData.phone,
                latitude: res[0].latitude,
                longitude: res[0].longitude
            }

            // console.log("assignServiceData", assignServiceData)
            let [assignErr, assignServiceValue] = await handle(AssignService.find({}).lean());
            // console.log("assignServiceData", assignServiceValue)
            var typeArray = [1, 3, 4];
            var count = 1;
            if (assignServiceValue) {
                for (var j = 0; j < assignServiceValue.length; j++) {
                    if (assignServiceValue[j].date == new Date(assignServiceData.date)) {

                        if ((slotCheck(assignServiceValue[j].startTime) >= slotCheck(assignServiceData.startTime)) && (slotCheck(assignServiceValue[j].endTime) <= slotCheck(assignServiceData.endTime))) {
                            console.log(true, assignServiceData.typeOfTreatment)
                            if (typeArray.includes(assignServiceValue[j].typeOfTreatment) && typeArray.includes(assignServiceData.typeOfTreatment)) {
                                console.log("bookedCount", assignServiceValue[j].bookedCount)
                                count = assignServiceValue[j].bookedCount + 1;
                                // console.log("count", count)
                                let [assignErr, assignServiceValue1] = await handle(AssignService.findOneAndUpdate({ _id: assignServiceValue[j]._id }, { $set: { bookedCount: count } }, { new: true, useFindAndModify: false }))
                                // console.log("assignServiceValue1", assignServiceValue1)
                            }
                        }
                    }
                }
            }
            assignServiceData['bookedCount'] = count;
            var saveData = new AssignService(assignServiceData);
            saveData.save().then((assignService) => {
                log.debug(component, 'Saved Assign Service successfully');
                log.close();

                return resolve(assignService);
            }).catch((err) => {
                log.error(component, 'Error while saving Assign Service data', { attach: err });
                log.close();
                return reject(err);
            })
        })();
    })
}

/* Create Assign Service API - Branch */
const assignServiceBranch = async (assignServiceData) => {
    log.debug(component, 'Creating New Assign Service - for Branch', assignServiceData);
    log.close();
    let [staffErr, staffData] = await handle(Staff.findOne({ '_id': assignServiceData.staffId }).lean());
    if (staffErr) return Promise.reject(staffErr);
    if (lodash.isEmpty(staffData)) return Promise.reject(ERR.NO_RECORDS_FOUND);

    assignServiceData.status = 0;
    assignServiceData.date = new Date(assignServiceData.date);
    let copiedAppointmentDate = new Date(assignServiceData.date.getTime());
    assignServiceData['date'] = copiedAppointmentDate;
    assignServiceData['day'] = assignServiceData.date.getUTCDay();
    assignServiceData.startTime = assignServiceData.date.setUTCHours(assignServiceData.startTime.split(':')[0], assignServiceData.startTime.split(':')[1]);
    assignServiceData.endTime = assignServiceData.date.setUTCHours(assignServiceData.endTime.split(':')[0], assignServiceData.endTime.split(':')[1]);
    assignServiceData['startTime'] = assignServiceData.startTime;
    assignServiceData['endTime'] = assignServiceData.endTime;

    delete assignServiceData._id;
    var saveData = new AssignServiceForBranch(assignServiceData);
    return new Promise((resolve, reject) => {
        saveData.save().then((assignService) => {
            log.debug(component, 'Saved Assign Service successfully');
            log.close();
            return resolve(assignService);
        }).catch((err) => {
            log.error(component, 'Error while saving Assign Service data', { attach: err });
            log.close();
            return reject(err);
        })
    })
}

const getAssignedServicesbyStaff = async (data) => {
    var array = [];
    let query1 =
        [
            {
                "$match": {
                    'staffId': data.staffId,
                    'date': new Date(data.date)
                }
            },
            {
                '$addFields': {
                    'user_id': { $toObjectId: "$staffId" },
                    'serviceId': { $toObjectId: "$service" },
                    'clientObjId': { $toObjectId: "$clientId" }
                }
            },
            {
                '$lookup': {
                    'from': 'staff',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'staffData'
                }
            },
            {
                "$unwind": "$staffData"
            },
            {
                '$lookup': {
                    'from': 'services',
                    'localField': 'serviceId',
                    'foreignField': '_id',
                    'as': 'servicesData'
                }
            },
            {
                "$unwind": "$servicesData"
            },
            {
                '$lookup': {
                    'from': 'client',
                    'localField': 'clientObjId',
                    'foreignField': '_id',
                    'as': 'clientData'
                }
            },
            {
                "$unwind": "$clientData"
            }
        ];
    let [clientServiceErr, clientServiceData] = await handle(AssignServiceForClient.aggregate(query1));
    if (clientServiceData.length != 0) {
        array.push(clientServiceData[0]);
    }
    if (clientServiceErr) return Promise.reject(clientServiceErr);
    let query2 =
        [
            {
                "$match": {
                    'staffId': data.staffId,
                    'date': new Date(data.date)
                }
            },
            {
                '$addFields': {
                    'user_id': { $toObjectId: "$staffId" },
                    'branch_id': { $toObjectId: "$branchId" }
                }
            },
            {
                '$lookup': {
                    'from': 'staff',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'staffData'
                }
            },
            {
                "$unwind": "$staffData"
            },
            {
                '$lookup': {
                    'from': 'branch',
                    'localField': 'branch_id',
                    'foreignField': '_id',
                    'as': 'branchData'
                }
            },
            {
                "$unwind": "$branchData"
            }
        ];
    let [branchServiceErr, branchServiceData] = await handle(AssignServiceForBranch.aggregate(query2));
    if (branchServiceData.length != 0) {
        array.push(branchServiceData[0]);
    }
    if (branchServiceErr) return Promise.reject(branchServiceErr);
    else return Promise.resolve(array);
}

// const getAllAssignedServices = async () => {
//     var data = [];
//     let [err, clientServicesData] = await handle(AssignServiceForClient.find({}).lean());
//     for (let i = 0; i < clientServicesData.length; i++) {
//         var query = [
//             { $match: { '_id': mongoose.Types.ObjectId(clientServicesData[i]._id) } },
//             {
//                 '$addFields': {
//                     'user_id': { $toObjectId: "$staffId" },
//                     'serviceId': { $toObjectId: "$service" }
//                 }
//             },
//             {
//                 '$lookup': {
//                     'from': 'staff',
//                     'localField': 'user_id',
//                     'foreignField': '_id',
//                     'as': 'staffData'
//                 }
//             },
//             {
//                 "$unwind": "$staffData"
//             },
//             {
//                 '$lookup': {
//                     'from': 'services',
//                     'localField': 'serviceId',
//                     'foreignField': '_id',
//                     'as': 'servicesData'
//                 }
//             },
//             {
//                 "$unwind": "$servicesData"
//             }
//         ];
//         var [clientServicesAllDataErr, clientServicesAllData] = await handle(AssignServiceForClient.aggregate(query));
//         data.push(clientServicesAllData[0]);
//         if (clientServicesAllDataErr) return Promise.reject(clientServicesAllDataErr);
//     }
//     if (err) return Promise.reject(err);
//     else if (lodash.isEmpty(clientServicesData)) return Promise.reject(ERR.NO_RECORDS_FOUND);

//     let [clientBranchErr, clientBranchData] = await handle(AssignServiceForBranch.find({}).lean());
//     for (let i = 0; i < clientBranchData.length; i++) {
//         var query = [
//             { $match: { '_id': mongoose.Types.ObjectId(clientBranchData[i]._id) } },
//             {
//                 '$addFields': {
//                     'user_id': { $toObjectId: "$staffId" },
//                     'branch_id': { $toObjectId: "$branchId" }
//                 }
//             },
//             {
//                 '$lookup': {
//                     'from': 'staff',
//                     'localField': 'user_id',
//                     'foreignField': '_id',
//                     'as': 'staffData'
//                 }
//             },
//             {
//                 "$unwind": "$staffData"
//             },
//             {
//                 '$lookup': {
//                     'from': 'branch',
//                     'localField': 'branch_id',
//                     'foreignField': '_id',
//                     'as': 'branchData'
//                 }
//             },
//             {
//                 "$unwind": "$branchData"
//             }
//         ];
//         var [clientBranchAllDataErr, clientBranchAllData] = await handle(AssignServiceForBranch.aggregate(query));
//         data.push(clientBranchAllData[0]);
//         if (clientBranchAllDataErr) return Promise.reject(clientBranchAllDataErr);
//     }
//     if (clientBranchErr) return Promise.reject(clientBranchErr);
//     else if (lodash.isEmpty(clientBranchData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
//     else return Promise.resolve(data);
// }
async function getAllAssignedServices() {
    log.debug(component, 'Get All Assign Service Detail'); log.close();
    let [err, assignServiceData] = await handle(AssignService.find().lean());
    console.log("assignServiceData", assignServiceData)
    for (var i = 0; i < assignServiceData.length; i++) {
        let [err, clientData] = await handle(Client.findOne({ _id: assignServiceData[i].clientId }).lean());
        let [err1, staffData] = await handle(Staff.findOne({ _id: assignServiceData[i].staffId }).lean());
        let [err2, serviceData] = await handle(Service.findOne({ _id: assignServiceData[i].serviceId }).lean());
        assignServiceData[i].clientName = clientData.clientName;
        assignServiceData[i].staffName = staffData.staffName;
        assignServiceData[i].serviceName = serviceData.serviceName;
    }
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(assignServiceData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(assignServiceData);
}

// get all assigned services from today date to past 30 days
async function getAllAssignedServicesforpast30days() {
    log.debug(component, 'Get All Assign Service for past 30 days');
    log.close();
    var todate = new Date();
    var fromDate = new Date(new Date().setDate(todate.getDate() - 30));
    let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
    var assignServiceData1 = [];
    for (var i = 0; i < assignServiceData.length; i++) {
        if (new Date(assignServiceData[i].date) >= fromDate && new Date(assignServiceData[i].date) <= todate) {
            assignServiceData1.push(assignServiceData[i])
        }
    }
    for (var i = 0; i < assignServiceData1.length; i++) {
        let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
        let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
        let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
        assignServiceData1[i].clientName = clientData.clientName;
        assignServiceData1[i].staffName = staffData.staffName;
        assignServiceData1[i].serviceName = serviceData.serviceName;
    }
    if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(assignServiceData1);
}

// get all assigned services by client and staff
async function getAllAssignedServicesbyclientstaff(data) {
    log.debug(component, 'Get All Assign Service by client and staff');
    log.close();
    if (data.fromDate && !data.todate) {
        var todate = new Date(data.fromDate);
        data.fromDate = new Date(data.fromDate);
    }
    if (data.clientId && !data.staffId && !data.fromDate && !data.todate) {
        let [err, clientData] = await handle(AssignService.find({ "clientId": data.clientId }).lean());
        for (var i = 0; i < clientData.length; i++) {
            let [error, clientData1] = await handle(Client.findOne({ '_id': clientData[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ '_id': clientData[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': clientData[i].serviceId }).lean());
            clientData[i].clientName = clientData1.clientName;
            clientData[i].staffName = staffData.staffName;
            clientData[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(clientData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(clientData);
    }

    if (data.staffId && !data.clientId && !data.fromDate && !data.todate) {
        let [err1, staffData] = await handle(AssignService.find({ "staffId": data.staffId }).lean());
        for (var i = 0; i < staffData.length; i++) {
            let [error, clientData] = await handle(Client.findOne({ '_id': staffData[i].clientId }).lean());
            let [err, staffDetail] = await handle(Staff.findOne({ '_id': staffData[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': staffData[i].serviceId }).lean());
            staffData[i].clientName = clientData.clientName;
            staffData[i].staffName = staffDetail.staffName;
            staffData[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(staffData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(staffData);
    }
    if (data.clientId && data.staffId && !data.fromDate && !data.todate) {
        let [err, clientstaffData] = await handle(AssignService.find({ "clientId": data.clientId, "staffId": data.staffId }).lean());
        for (var i = 0; i < clientstaffData.length; i++) {
            let [err1, staffData1] = await handle(Staff.findOne({ '_id': clientstaffData[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': clientstaffData[i].serviceId }).lean());
            let [error, clientData1] = await handle(Client.findOne({ '_id': clientstaffData[i].clientId }).lean());
            clientstaffData[i].staffName = staffData1.staffName;
            clientstaffData[i].clientName = clientData1.clientName;
            clientstaffData[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(clientstaffData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(clientstaffData);
    }
    if (data.fromDate && data.todate && !data.staffId && !data.clientId) {
        let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
        var assignServiceData1 = [];
        for (var i = 0; i < assignServiceData.length; i++) {
            if (new Date(assignServiceData[i].date) >= new Date(data.fromDate) && new Date(assignServiceData[i].date) <= new Date(data.todate)) {
                assignServiceData1.push(assignServiceData[i])
            }
        }
        for (var i = 0; i < assignServiceData1.length; i++) {
            let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
            assignServiceData1[i].clientName = clientData.clientName;
            assignServiceData1[i].staffName = staffData.staffName;
            assignServiceData1[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(assignServiceData1);
    }
    if (data.fromDate && !data.todate && !data.staffId && !data.clientId) {
        let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
        var assignServiceData1 = [];
        for (var i = 0; i < assignServiceData.length; i++) {
            if (new Date(assignServiceData[i].date) >= new Date(data.fromDate) && new Date(assignServiceData[i].date) <= todate) {
                assignServiceData1.push(assignServiceData[i])
            }
        }
        for (var i = 0; i < assignServiceData1.length; i++) {
            let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
            assignServiceData1[i].clientName = clientData.clientName;
            assignServiceData1[i].staffName = staffData.staffName;
            assignServiceData1[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(assignServiceData1);
    }
    if (data.fromDate && !data.todate && data.staffId && data.clientId) {
        let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
        var assignServiceData1 = [];
        for (var i = 0; i < assignServiceData.length; i++) {
            if (new Date(assignServiceData[i].date) >= new Date(data.fromDate) && new Date(assignServiceData[i].date) <= todate && assignServiceData[i].staffId == data.staffId &&
                assignServiceData[i].clientId == data.clientId) {
                assignServiceData1.push(assignServiceData[i])
            }
        }
        for (var i = 0; i < assignServiceData1.length; i++) {
            let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
            assignServiceData1[i].clientName = clientData.clientName;
            assignServiceData1[i].staffName = staffData.staffName;
            assignServiceData1[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(assignServiceData1);
    }
    if (data.fromDate && !data.todate && !data.staffId && data.clientId) {
        let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
        var assignServiceData1 = [];
        for (var i = 0; i < assignServiceData.length; i++) {
            if (new Date(assignServiceData[i].date) >= new Date(data.fromDate) && new Date(assignServiceData[i].date) <= todate && assignServiceData[i].clientId == data.clientId ) {
                assignServiceData1.push(assignServiceData[i])
            }
        }
        for (var i = 0; i < assignServiceData1.length; i++) {
            let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
            assignServiceData1[i].clientName = clientData.clientName;
            assignServiceData1[i].staffName = staffData.staffName;
            assignServiceData1[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(assignServiceData1);
    }
    if (data.fromDate && !data.todate && data.staffId && !data.clientId) {
        let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
        var assignServiceData1 = [];
        for (var i = 0; i < assignServiceData.length; i++) {
            if (new Date(assignServiceData[i].date) >= new Date(data.fromDate) && new Date(assignServiceData[i].date) <= todate && assignServiceData[i].staffId == data.staffId) {
                assignServiceData1.push(assignServiceData[i])
            }
        }
        for (var i = 0; i < assignServiceData1.length; i++) {
            let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
            assignServiceData1[i].clientName = clientData.clientName;
            assignServiceData1[i].staffName = staffData.staffName;
            assignServiceData1[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(assignServiceData1);
    }
    if (data.clientId && data.staffId && data.fromDate && data.todate) {
        let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
        var assignServiceData1 = [];
        for (var i = 0; i < assignServiceData.length; i++) {
            if ((new Date(assignServiceData[i].date) >= new Date(data.fromDate) &&
                new Date(assignServiceData[i].date) <= new Date(data.todate)) &&
                assignServiceData[i].staffId == data.staffId &&
                assignServiceData[i].clientId == data.clientId) {

                assignServiceData1.push(assignServiceData[i])
            }
        }
        for (var i = 0; i < assignServiceData1.length; i++) {
            let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
            assignServiceData1[i].clientName = clientData.clientName;
            assignServiceData1[i].staffName = staffData.staffName;
            assignServiceData1[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(assignServiceData1);
    }
    if (data.clientId && data.fromDate && data.todate && !data.staffId) {
        let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
        var assignServiceData1 = [];
        for (var i = 0; i < assignServiceData.length; i++) {
            if ((new Date(assignServiceData[i].date) >= new Date(data.fromDate) &&
                new Date(assignServiceData[i].date) <= new Date(data.todate)) &&
                assignServiceData[i].clientId == data.clientId) {
                assignServiceData1.push(assignServiceData[i])
            }
            for (var i = 0; i < assignServiceData1.length; i++) {
                let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
                let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
                let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
                assignServiceData1[i].clientName = clientData.clientName;
                assignServiceData1[i].staffName = staffData.staffName;
                assignServiceData1[i].serviceName = serviceData.serviceName;
            }
            if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
            return Promise.resolve(assignServiceData1);
        }
    }
    if (data.staffId && data.fromDate && data.todate && !data.clientId) {
        let [Err, assignServiceData] = await handle(AssignService.find({}).lean());
        var assignServiceData1 = [];
        for (var i = 0; i < assignServiceData.length; i++) {
            if ((new Date(assignServiceData[i].date) >= new Date(data.fromDate) &&
                new Date(assignServiceData[i].date) <= new Date(data.todate)) &&
                assignServiceData[i].staffId == data.staffId) {
                assignServiceData1.push(assignServiceData[i])
            }
        }
        for (var i = 0; i < assignServiceData1.length; i++) {
            let [err, clientData] = await handle(Client.findOne({ '_id': assignServiceData1[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ '_id': assignServiceData1[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData1[i].serviceId }).lean());
            assignServiceData1[i].clientName = clientData.clientName;
            assignServiceData1[i].staffName = staffData.staffName;
            assignServiceData1[i].serviceName = serviceData.serviceName;
        }
        if (lodash.isEmpty(assignServiceData1)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(assignServiceData1);
    }
}


const getAllAssignedServicesforStaff = async (inputData) => {
    var data = [];

    var query = [
        { $match: { 'staffId': inputData.staffId } },
        {
            '$addFields': {
                'user_id': { $toObjectId: "$staffId" },
                'serviceId': { $toObjectId: "$service" }
            }
        },
        {
            '$lookup': {
                'from': 'staff',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'staffData'
            }
        },
        {
            "$unwind": "$staffData"
        },
        {
            '$lookup': {
                'from': 'services',
                'localField': 'serviceId',
                'foreignField': '_id',
                'as': 'servicesData'
            }
        },
        {
            "$unwind": "$servicesData"
        }
    ];
    var [clientServicesAllDataErr, clientServicesAllData] = await handle(AssignServiceForClient.aggregate(query));
    for (let i = 0; i < clientServicesAllData.length; i++) {
        data.push(clientServicesAllData[i]);
    }
    if (clientServicesAllDataErr) return Promise.reject(clientServicesAllDataErr);

    var query = [
        { $match: { 'staffId': inputData.staffId } },
        {
            '$addFields': {
                'user_id': { $toObjectId: "$staffId" },
                'branch_id': { $toObjectId: "$branchId" }
            }
        },
        {
            '$lookup': {
                'from': 'staff',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'staffData'
            }
        },
        {
            "$unwind": "$staffData"
        },
        {
            '$lookup': {
                'from': 'branch',
                'localField': 'branch_id',
                'foreignField': '_id',
                'as': 'branchData'
            }
        },
        {
            "$unwind": "$branchData"
        }
    ];
    var [clientBranchAllDataErr, clientBranchAllData] = await handle(AssignServiceForBranch.aggregate(query));
    for (let i = 0; i < clientBranchAllData.length; i++) {
        data.push(clientBranchAllData[i]);
    } if (clientBranchAllDataErr) return Promise.reject(clientBranchAllDataErr);
    else return Promise.resolve(data);
}

const getAllAssignedServicesbySingleBranch = async (inputData) => {

    var query = [
        { $match: { 'branchId': inputData.branchId } },
        {
            '$addFields': {
                'user_id': { $toObjectId: "$staffId" },
                'branch_id': { $toObjectId: "$branchId" }
            }
        },
        {
            '$lookup': {
                'from': 'staff',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'staffData'
            }
        },
        {
            "$unwind": "$staffData"
        },
        {
            '$lookup': {
                'from': 'branch',
                'localField': 'branch_id',
                'foreignField': '_id',
                'as': 'branchData'
            }
        },
        {
            "$unwind": "$branchData"
        }
    ];
    var [clientBranchAllDataErr, clientBranchAllData] = await handle(AssignServiceForBranch.aggregate(query));
    if (clientBranchAllDataErr) return Promise.reject(clientBranchAllDataErr);
    else return Promise.resolve(clientBranchAllData);
}

const getAllAssignedServicesbyClient = async (inputData) => {

    var query = [
        { $match: { 'clientName': inputData.clientName } },
        {
            '$addFields': {
                'user_id': { $toObjectId: "$staffId" },
                'serviceId': { $toObjectId: "$service" }
            }
        },
        {
            '$lookup': {
                'from': 'staff',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'staffData'
            }
        },
        {
            "$unwind": "$staffData"
        },
        {
            '$lookup': {
                'from': 'services',
                'localField': 'serviceId',
                'foreignField': '_id',
                'as': 'servicesData'
            }
        },
        {
            "$unwind": "$servicesData"
        }
    ];
    var [clientServicesAllDataErr, clientServicesAllData] = await handle(AssignServiceForClient.aggregate(query));
    if (clientServicesAllDataErr) return Promise.reject(clientServicesAllDataErr);
    else return Promise.resolve(clientServicesAllData);
}

const getAllAssignedServicesbyServiceId = async (inputData) => {

    var query = [
        { $match: { 'service': inputData.serviceId } },
        {
            '$addFields': {
                'user_id': { $toObjectId: "$staffId" },
                'serviceId': { $toObjectId: "$service" }
            }
        },
        {
            '$lookup': {
                'from': 'staff',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'staffData'
            }
        },
        {
            "$unwind": "$staffData"
        },
        {
            '$lookup': {
                'from': 'services',
                'localField': 'serviceId',
                'foreignField': '_id',
                'as': 'servicesData'
            }
        },
        {
            "$unwind": "$servicesData"
        }
    ];
    var [clientServicesAllDataErr, clientServicesAllData] = await handle(AssignServiceForClient.aggregate(query));
    if (clientServicesAllDataErr) return Promise.reject(clientServicesAllDataErr);
    else return Promise.resolve(clientServicesAllData);
}

const getAllAssignedServicesofAllBranches = async () => {
    var data = [];
    let [clientBranchErr, clientBranchData] = await handle(AssignServiceForBranch.find({}).lean());
    for (let i = 0; i < clientBranchData.length; i++) {
        var query = [
            { $match: { '_id': mongoose.Types.ObjectId(clientBranchData[i]._id) } },
            {
                '$addFields': {
                    'user_id': { $toObjectId: "$staffId" },
                    'branch_id': { $toObjectId: "$branchId" }
                }
            },
            {
                '$lookup': {
                    'from': 'staff',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'staffData'
                }
            },
            {
                "$unwind": "$staffData"
            },
            {
                '$lookup': {
                    'from': 'branch',
                    'localField': 'branch_id',
                    'foreignField': '_id',
                    'as': 'branchData'
                }
            },
            {
                "$unwind": "$branchData"
            }
        ];
        var [clientBranchAllDataErr, clientBranchAllData] = await handle(AssignServiceForBranch.aggregate(query));
        data.push(clientBranchAllData[0]);
        if (clientBranchAllDataErr) return Promise.reject(clientBranchAllDataErr);
    }
    if (clientBranchErr) return Promise.reject(clientBranchErr);
    else if (lodash.isEmpty(clientBranchData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    else return Promise.resolve(data);
}

const getAllAssignedServicesofAllServices = async () => {
    var data = [];
    let [err, clientServicesData] = await handle(AssignServiceForClient.find({}).lean());
    for (let i = 0; i < clientServicesData.length; i++) {
        var query = [
            { $match: { '_id': mongoose.Types.ObjectId(clientServicesData[i]._id) } },
            {
                '$addFields': {
                    'user_id': { $toObjectId: "$staffId" },
                    'serviceId': { $toObjectId: "$service" }
                }
            },
            {
                '$lookup': {
                    'from': 'staff',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'staffData'
                }
            },
            {
                "$unwind": "$staffData"
            },
            {
                '$lookup': {
                    'from': 'services',
                    'localField': 'serviceId',
                    'foreignField': '_id',
                    'as': 'servicesData'
                }
            },
            {
                "$unwind": "$servicesData"
            }
        ];
        var [clientServicesAllDataErr, clientServicesAllData] = await handle(AssignServiceForClient.aggregate(query));
        data.push(clientServicesAllData[0]);
        if (clientServicesAllDataErr) return Promise.reject(clientServicesAllDataErr);
    }
    if (err) return Promise.reject(err);
    else if (lodash.isEmpty(clientServicesData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    else return Promise.resolve(data);
}

const getAssignedServicesofStaffbyIdinAllBranches = async (inputData) => {
    var query = [
        { $match: { 'staffId': inputData.staffId } },
        {
            '$addFields': {
                'user_id': { $toObjectId: "$staffId" },
                'branch_id': { $toObjectId: "$branchId" }
            }
        },
        {
            '$lookup': {
                'from': 'staff',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'staffData'
            }
        },
        {
            "$unwind": "$staffData"
        },
        {
            '$lookup': {
                'from': 'branch',
                'localField': 'branch_id',
                'foreignField': '_id',
                'as': 'branchData'
            }
        },
        {
            "$unwind": "$branchData"
        }
    ];
    var [clientBranchAllDataErr, clientBranchAllData] = await handle(AssignServiceForBranch.aggregate(query));
    if (clientBranchAllDataErr) return Promise.reject(clientBranchAllDataErr);
    else return Promise.resolve(clientBranchAllData);
}

const getAssignedServicesofStaffbyIdinAllServices = async (inputData) => {
    let query1 =
        [
            {
                "$match": {
                    'staffId': inputData.staffId,
                }
            },
            {
                '$addFields': {
                    'user_id': { $toObjectId: "$staffId" },
                    'serviceId': { $toObjectId: "$service" }
                }
            },
            {
                '$lookup': {
                    'from': 'staff',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'staffData'
                }
            },
            {
                "$unwind": "$staffData"
            },
            {
                '$lookup': {
                    'from': 'services',
                    'localField': 'serviceId',
                    'foreignField': '_id',
                    'as': 'servicesData'
                }
            },
            {
                "$unwind": "$servicesData"
            }
        ];
    let [clientServiceErr, clientServiceData] = await handle(AssignServiceForClient.aggregate(query1));
    if (clientServiceErr) return Promise.reject(clientServiceErr);
    else return Promise.resolve(clientServiceData);
}

const onBranchStartToClientPlace = async (inputData) => {
    let [staffErr, staffData] = await handle(Staff.findOne({ '_id': inputData.staffId }));
    if (staffErr) return Promise.reject(staffErr);
    let [branchErr, branchData] = await handle(Branch.findOne({ '_id': staffData.branch }));
    if (branchErr) return Promise.reject(branchErr);
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            body: {
                "origin": {
                    "location": {
                        "latLng": {
                            "latitude": branchData.latitude, // Home Branch Latitude 
                            "longitude": branchData.longitude  // Home Branch Longitude
                        }
                    }
                },
                "destination": {
                    "location": {
                        "latLng": {
                            "latitude": inputData.latitude,
                            "longitude": inputData.longitude
                        }
                    }
                },
                // "travelMode": "DRIVE",
                // "routingPreference": "TRAFFIC_AWARE",
                // "departureTime": "2023-10-15T15:01:23.045123456Z",
                // "computeAlternativeRoutes": false,
                // "routeModifiers": {
                //     "avoidTolls": false,
                //     "avoidHighways": false,
                //     "avoidFerries": false
                // },
                // "languageCode": "en-US",
                // "units": "IMPERIAL"
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
            if (error) return reject(error);
            log.debug('Travel Distance response', { attach: response.body }); log.close();
            (async () => {
                let [settingsErr, settingsDataFind] = await handle(Settings.find({}).lean());
                if (settingsErr) return Promise.reject(settingsErr);
                if (lodash.isEmpty(settingsDataFind)) return Promise.reject(ERR.NO_RECORDS_FOUND);
                var settingsData = settingsDataFind[settingsDataFind.length - 1]
                let [serviceErr, servicesData] = await handle(AssignServiceForClient.findOne({ '_id': inputData.assignedServiceId }));
                if (serviceErr) return Promise.reject(serviceErr);
                let amountForOneMetre = (settingsData.TravelExpenseCost / settingsData.averageDistance)
                let durationforMinutes = parseFloat(response.body.routes[0].duration)
                let travelAllowanceData = {
                    clientId: servicesData.clientId,
                    staffId: inputData.staffId,
                    date: servicesData.date,
                    assignedServiceId: inputData.assignedServiceId,
                    distanceInMeters: response.body.routes[0].distanceMeters,
                    distanceInKiloMeters: (response.body.routes[0].distanceMeters / 1000),
                    durationInSeconds: parseFloat(response.body.routes[0].duration),
                    durationInMinutes: Math.floor(durationforMinutes / 60),
                    travelAllowanceCost: amountForOneMetre * response.body.routes[0].distanceMeters
                }
                var saveModel = new TravelAllowance(travelAllowanceData);
                let [err, clientDataSaved] = await handle(saveModel.save())
                if (err) return Promise.reject(err);
            })();
            return resolve(response.body);
        });
    });
}

const serviceOnStart = async (inputData) => {
    let [clientErr, clientData] = await handle(Client.findOne({ '_id': inputData.clientId }));
    if (clientErr) return Promise.reject(clientErr);
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/distancematrix/json?destinations=' + clientData.latitude + ',' + clientData.longitude + '&origins=' + inputData.latitude + ',' + inputData.longitude + '&key=AIzaSyCX_9dtirFHcsQY8zjjR86cettocdHOT50',
            headers: {
                'key': 'AIzaSyCX_9dtirFHcsQY8zjjR86cettocdHOT50',
                'Content-Type': 'application/json'
            },
            json: true //Parse the JSON string in the response
        };
        request(options, function (error, response, body) {
            if (error) return reject(error);
            log.debug('Start Service response', { attach: response.body }); log.close();
            (async () => {
                let [settingsErr, settingsDataFind] = await handle(Settings.find({}).lean());
                if (settingsErr) return reject(settingsErr);
                if (lodash.isEmpty(settingsDataFind)) return reject(ERR.NO_RECORDS_FOUND);
                var settingsData = settingsDataFind[settingsDataFind.length - 1]
                var status;
                if (settingsData.averageDistance > response.body.rows[0].elements[0].distance.value) {
                    status = true;
                }
                else {
                    status = false;
                }
                let [serviceErr, serviceData] = await handle(AssignServiceForClient.findOne({ '_id': inputData.assignedServiceId }));
                if (serviceErr) return reject(serviceErr);
                let clientDistanceData = {
                    clientId: inputData.clientId,
                    staffId: serviceData.staffId,
                    date: serviceData.date,
                    assignedServiceId: inputData.assignedServiceId,
                    startStatus: status,
                    startDistance: response.body.rows[0].elements[0].distance.text,
                    startDistanceValue: response.body.rows[0].elements[0].distance.value,
                    settingsId: serviceData.settingsId
                }
                var saveModel = new ClientDistance(clientDistanceData);
                let [err, clientDataSaved] = await handle(saveModel.save())
                if (err) return reject(err);
            })();
            return resolve(response.body);
        });
    });
}

const serviceOnEnd = async (inputData) => {
    let [clientErr, clientData] = await handle(Client.findOne({ '_id': inputData.clientId }));
    if (clientErr) return Promise.reject(clientErr);
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/distancematrix/json?destinations=' + clientData.latitude + ',' + clientData.longitude + '&origins=' + inputData.latitude + ',' + inputData.longitude + '&key=AIzaSyCX_9dtirFHcsQY8zjjR86cettocdHOT50',
            headers: {
                'key': 'AIzaSyCX_9dtirFHcsQY8zjjR86cettocdHOT50',
                'Content-Type': 'application/json'
            },
            json: true //Parse the JSON string in the response
        };
        request(options, function (error, response, body) {
            if (error) return reject(error);
            log.debug('End Service response', { attach: response.body }); log.close();
            (async () => {
                let [settingsErr, settingsDataFind] = await handle(Settings.find({}).lean());
                if (settingsErr) return Promise.reject(settingsErr);
                if (lodash.isEmpty(settingsDataFind)) return Promise.reject(ERR.NO_RECORDS_FOUND);
                var settingsData = settingsDataFind[settingsDataFind.length - 1]
                var updateStatus;
                if (settingsData.averageDistance > response.body.rows[0].elements[0].distance.value) {
                    updateStatus = true;
                }
                else {
                    updateStatus = false;
                }
                let [distanceErr, distanceData] = await handle(ClientDistance.findOne({ "assignedServiceId": inputData.assignedServiceId }));
                if (distanceErr) return Promise.reject(distanceErr);
                var assignServiceStatus;
                if (distanceData.startStatus == true && updateStatus == true) {
                    assignServiceStatus = 0 // 0 - Completed
                }
                if (distanceData.startStatus == true && updateStatus == false) {
                    assignServiceStatus = 2 // End Distance Mismatch
                }
                if (distanceData.startStatus == false && updateStatus == true) {
                    assignServiceStatus = 1 // Start Distance Mismatch
                }
                let updatedData = {
                    endStatus: updateStatus,
                    endDistance: response.body.rows[0].elements[0].distance.text,
                    endDistanceValue: response.body.rows[0].elements[0].distance.value,
                    status: assignServiceStatus
                }
                let [updateDistanceValueErr, updateDistanceValue] = await handle(ClientDistance.findOneAndUpdate({ "assignedServiceId": inputData.assignedServiceId }, updatedData, { new: true, useFindAndModify: false }))
                if (updateDistanceValueErr) return Promise.reject(updateDistanceValueErr);
                let d = new Date();
                let date2 = d.getTime() + (5.5 * 60 * 60 * 1000)
                var updateStatusforAssignedService;
                if (updateDistanceValue.status == 0) {
                    updateStatusforAssignedService = 1
                }
                else if (updateDistanceValue.status == 1 || updateDistanceValue.status == 2) {
                    updateStatusforAssignedService = 4
                }
                let [assignServiceForClientValueErr, assignServiceForClientValue] = await handle(AssignServiceForClient.findOneAndUpdate({ "_id": inputData.assignedServiceId }, { "$set": { "serviceEndTime": date2, 'status': updateStatusforAssignedService } }, { new: true, useFindAndModify: false }))
                if (assignServiceForClientValueErr) return Promise.reject(assignServiceForClientValueErr);
            })();
            return resolve(response.body);
        });
    });
}


async function getAssignedServicesById(id) {
    log.debug(component, 'Getting AssignService Data by Id');
    log.close();
    let [Err, assignServiceData] = await handle(AssignService.findOne({ '_id': id }).lean());
    let [err, invoice] = await handle(AssignServiceInvoice.findOne({ assignServiceId: id, isDeleted: 0 }))
    console.log(invoice, "invoice");
    let [err1, url] = await handle(getAssignServiceInvoicePresignedUrl(invoice));
    assignServiceData.url = url;
    if (Err) return Promise.reject(Err);
    if (lodash.isEmpty(assignServiceData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(assignServiceData);
}
const getAssignedServicesofBranchById = async (serviceBranchId) => {
    var query = [
        { $match: { '_id': mongoose.Types.ObjectId(serviceBranchId) } },
        {
            '$addFields': {
                'user_id': { $toObjectId: "$staffId" },
                'branch_id': { $toObjectId: "$branchId" }
            }
        },
        {
            '$lookup': {
                'from': 'staff',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'staffData'
            }
        },
        {
            "$unwind": "$staffData"
        },
        {
            '$lookup': {
                'from': 'branch',
                'localField': 'branch_id',
                'foreignField': '_id',
                'as': 'branchData'
            }
        },
        {
            "$unwind": "$branchData"
        }
    ];
    var [clientServicesAllDataErr, clientServicesDatabyId] = await handle(AssignServiceForBranch.aggregate(query));
    if (clientServicesAllDataErr) return Promise.reject(clientServicesAllDataErr);
    else return Promise.resolve(clientServicesDatabyId[0])
}

/* To Update Assinged Service fot Client - API */
// const updateAssignService = async function (datatoupdate) {
//     log.debug(component, 'Update Assinged Service fot Client', { 'attach': datatoupdate }); log.close();
//     let assignServiceId = datatoupdate.assignServiceId;
//     delete datatoupdate.assignServiceId;
//     console.log(datatoupdate);
//     let [clientErr, clientData] = await handle(AssignService.findOneAndUpdate({ "_id": assignServiceId }, datatoupdate, { new: true, useFindAndModify: false }))
//     console.log("clientData", clientData)
//     if (clientErr) return Promise.reject(clientErr);
//     else return Promise.resolve(clientData);
// }
const updateAssignService = async function (datatoupdate) {
    log.debug(component, 'Update Assinged Service fot Client', { 'attach': datatoupdate }); log.close();
    let assignService = datatoupdate.assignServiceId;
    console.log(datatoupdate)
    delete datatoupdate.assignServiceId;
    let [Err, assign] = await handle(AssignService.findOne({ '_id': assignService }).lean());
   // console.log("assign", assign);
    if(datatoupdate.date)
    {
        datatoupdate.date=new Date(datatoupdate.date)
    }
    let [Err1, travelCountData] = await handle(TravelCount.find({ 'staffId': assign.staffId, date: assign.date }).sort({ count: 1 }).lean());
    console.log("travelCountData", travelCountData)
    for (var l = 0; l < travelCountData.length; l++) {
        if (travelCountData[l].assignServiceId == assignService) {
            let [Err, assignServiceData] = await handle(AssignService.findOne({ '_id': travelCountData[l].assignServiceId }).lean());
          //  console.log("assignServiceData", assignServiceData)
            if (travelCountData[l].count == 1) {
                if (assignServiceData.slatitude && assignServiceData.slongitude) {
                    let [err, branchData] = await handle(Branch.findOne({ "_id": assignServiceData.branchId }))
                    console.log("branchData", branchData)
                    var temp = {
                        "latitude": branchData.latitude,
                        "longitude": branchData.longitude,
                        "elatitude": assignServiceData.slatitude,
                        "elongitude": assignServiceData.slongitude
                    }
                    console.log(temp)
                    var [err3, val1] = await handle(travelDistance(temp));
                }
            }
            else {

                let [Err, assignServiceData1] = await handle(AssignService.findOne({ '_id': travelCountData[l - 1].assignServiceId }).lean());
                if (assignServiceData1.elatitude && assignServiceData1.elongitude && assignServiceData.slatitude && assignServiceData.slongitude) {
                    var temp = {
                        "latitude": assignServiceData1.elatitude,
                        "longitude": assignServiceData1.elongitude,
                        "elatitude": assignServiceData.slatitude,
                        "elongitude": assignServiceData.slongitude
                    }
                    console.log(temp)
                    var [err3, val1] = await handle(travelDistance(temp));
                    console.log("val1", val1)
                }
            }
            break;
        }
    }
    if (val1) {
        datatoupdate.travelDistanceinKM = (val1.distance) / 1000;
        datatoupdate.travelDurationinMinutes = val1.duration;
    }
    if (assign.latitude && assign.longitude && assign.slatitude && assign.slongitude && assign.elatitude && assign.elongitude) {
        var temp = {
            "latitude": assign.latitude,
            "longitude": assign.longitude,
            "elatitude": assign.slatitude,
            "elongitude": assign.slongitude
        }
        var [err3, startDistance] = await handle(travelDistance(temp));
        console.log("Distance1", startDistance)

        var temp1 = {
            "latitude": assign.latitude,
            "longitude": assign.longitude,
            "elatitude": assign.elatitude,
            "elongitude": assign.elongitude
        }
        var [err3, endDistance] = await handle(travelDistance(temp));
        console.log("Distance2", endDistance)

        datatoupdate.startDistance = startDistance.distance;
        datatoupdate.endDistance = endDistance.distance;
    }
    console.log("datatoupdate",datatoupdate)
    console.log("assign.transport",assign.transport,datatoupdate.transport!="auto")
    if (assign.transport && datatoupdate.transport!="auto") {
        let [Err4, travelAllowance] = await handle(TravelAllowance.findOne({ '_id': datatoupdate.transport }).lean());
       // console.log("travelAllowance", travelAllowance.newPerKmCost, assign.travelDistanceinKM * travelAllowance.newPerKmCost);
        if(travelAllowance)
        {
        datatoupdate.travelAmount = assign.travelDistanceinKM * travelAllowance.newPerKmCost;
        }
    }
    let [Err4, Distance] = await handle(Settings.find({}).lean());
    console.log("Distance", Distance)
    if (datatoupdate.startDistance > Distance[0].averageDistance) {
        datatoupdate.status = 3;
    }
    console.log("assignServiceId", assignService, datatoupdate)
    let [clientErr, clientData] = await handle(AssignService.findOneAndUpdate({ "_id": assignService }, datatoupdate, { new: true, useFindAndModify: false }))
    console.log("clientData", clientData)
    if (clientErr) return Promise.reject(clientErr);
    else return Promise.resolve(clientData);
}
async function getAssignServiceDataByStaffIdAndDate(data) {

    log.debug(component, 'Getting AssignService Data by StaffId And Date');
    log.close();
    let someDate = new Date(data.date);
    let copiedAppointmentDate = new Date(someDate.getTime());
    let [Err, assignServiceData] = await handle(AssignService.find({ 'staffId': data.staffId, date: copiedAppointmentDate }).lean());
    if (assignServiceData.length != 0) {
        for (var i = 0; i < assignServiceData.length; i++) {
            let [err, clientData] = await handle(Client.findOne({ _id: assignServiceData[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ _id: assignServiceData[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ _id: assignServiceData[i].serviceId }).lean());
            assignServiceData[i].clientName = clientData.clientName;
            assignServiceData[i].staffName = staffData.staffName;
            assignServiceData[i].serviceName = serviceData.serviceName;
        }
    }
    if (Err) return Promise.reject(Err);
    if (lodash.isEmpty(assignServiceData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(assignServiceData);
}

async function getAssignServiceDataByStaffIdAndDateForDashBoard(data) {
    log.debug(component, 'Getting AssignService Data by StaffId And Date');
    log.close();

    let fromDate, toDate;
    if (data.date) {
        fromDate = new Date(data.date);
        toDate = new Date(data.date);
    }
    if (data.fromDate) {
        fromDate = new Date(data.fromDate);
    }
    if (data.toDate) {
        toDate = new Date(data.toDate);
    }
    let assignServiceData = [];
    let [err5, assign] = await handle(AssignService.find({ 'staffId': data.staffId }).lean());
    assignServiceData = assign;
    console.log("assignServiceData", assignServiceData)
    var assignServiceData1 = [];
    for (var i = 0; i < assignServiceData.length; i++) {
        if (new Date(assignServiceData[i].date) >= fromDate && new Date(assignServiceData[i].date) <= toDate) {
            assignServiceData1.push(assignServiceData[i])
        }
    }
    var totalCount, assigned = 0, completed = 0, rescheduled = 0, notAvailable = 0;
    var op = 0, ip = 0, teletherapy = 0, home = 0;
    var staffDetails = []
    console.log("assignServiceData1", assignServiceData1)
    if (assignServiceData1.length != 0) {
        for (var i = 0; i < assignServiceData1.length; i++) {
            if (assignServiceData1[i].status == 0) {
                assigned = assigned + 1;

            }
            if (assignServiceData1[i].status == 1 || assignServiceData1[i].status == 3) {
                completed = completed + 1;

            }
            if (assignServiceData1[i].status == 2) {
                rescheduled = rescheduled + 1;

            }

            if (assignServiceData1[i].typeOfTreatment == 0) {
                home = home + 1;

            }
            if (assignServiceData1[i].typeOfTreatment == 1) {
                op = op + 1;

            }
            if (assignServiceData1[i].typeOfTreatment == 2) {
                ip = ip + 1;

            }
            if (assignServiceData1[i].typeOfTreatment == 3) {
                teletherapy = teletherapy + 1;

            }
        }
    }
    totalCount = assignServiceData1.length;
    var data1 = {
        "startDate": fromDate,
        "endDate": toDate
    }
    var [err, value] = await handle(AttendenceAPI.getAttendenceofStaffByDateRange(data1));
    if (value) {
        var newValue = [];
        for (var i = 0; i < value.length; i++) {
            if ((value[i]._id.toString()) == data.staffId) {
                newValue = (value[i].doc)
            }
        }
        var total = 0, productiveDuration = 0;
        var value = 0;
        for (var i = 0; i < newValue.length; i++) {
            console.log(typeof (newValue[i].travelDuration))
            var hour = Number(newValue[i].duration.split(':')[0])
            var minutes = Number(newValue[i].duration.split(':')[1])
            total = ((hour * 60) + minutes) + total;
            value = (newValue[i].travelDuration) + value
        }
    }
    console.log("total", value, total)
    var prod = 0, time = 0;
    console.log("prod", prod, value == undefined, total == undefined)
    if (value == undefined && total == undefined) {
        console.log("if")
        prod = 0;
        time = 0
    }
    else {
        console.log("else")
        prod = Math.floor((total - value) / 60).toString() + ":" + (((total - value) % 60).toString()).split('.')[0];
        time = Math.floor(total / 60).toString() + ":" + (total % 60).toString();
    }

    var output = {
        "Assigned": assigned,
        "Completed": completed,
        "Rescheduled": rescheduled,
        "TotalTimeTracked": time,
        "ProductiveTime": prod,
        "TotalCount": totalCount,
        "Home": home,
        "OP": op,
        "TeleTherapy": teletherapy,
        "IP": ip
    }
    console.log("output", output)
    // if (Err) return Promise.reject(Err);
    if (lodash.isEmpty(output)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(output);
}

async function getSlotsForAssignService(data) {
    log.debug(component, 'Getting AssignService Data by StaffId And Date');
    log.close();
    let [err, staffData] = await handle(Staff.findOne({ _id: data.staffId }).lean());
    let [err1, roleData] = await handle(Role.findOne({ "_id": staffData.staffRole }).lean());
    var slotTime = [];
    var notInBooked = [];
    var temp;
    let [err2, bookedSlots] = await handle(getAssignServiceDataByStaffIdAndDate(data));
    var isAvailable = false;
    //console.log("bookedSlots", bookedSlots)
    var typeOfTreamentArray = [1, 3, 4];
    for (var i = 0; i < roleData.slots.length; i++) {
        if (roleData.slots[i]._id == data.slotId) {
            temp = {
                startTime: roleData.slots[i].startTime,
                endTime: roleData.slots[i].endTime
            }
            slotTime.push(temp);
        }
    }
    console.log(slotTime, "slotTime")
    var output = makeTimeIntervals(slotTime[0].startTime, slotTime[0].endTime, data.duration)
    var final = [];
    console.log("output", output)
    for (var j = 0; j < output.length; j++) {
        if (j != output.length - 1) {
            var temp = {
                "slot": (output[j] + '-' + output[j + 1]),
                "bookedStatus": 0,
            }
            final.push(temp);
        }
    }
    console.log("final", final)
    var condition;
    //console.log("bookedSlots.length",bookedSlots.length)
    var isAvailableTemp = [];
    if (bookedSlots) {

        for (var i = 0; i < bookedSlots.length; i++) {
            if (bookedSlots[i].date == new Date(data.date)) {
                var count = bookedSlots[i].bookedCount;
                let typeOfTreament = typeOfTreamentArray.filter(a => (a == data.typeOfTreatment))
                let bookedTreatment = typeOfTreamentArray.filter(a => (a == bookedSlots[i].typeOfTreatment))
                if (typeOfTreament.length != 0) {
                    for (var j = 0; j < final.length; j++) {
                        var start = bookedSlots[i].startTime.split(' ')[0];
                        var end = bookedSlots[i].endTime.split(' ')[0];
                        var bHr = (start.split(':')[0]);
                        var bMin = (start.split(':')[1]);
                        var AST = Number(bHr + bMin);
                        var bHr1 = (end.split(':')[0]);
                        var bMin1 = (end.split(':')[1]);
                        var AET = Number(bHr1 + bMin1);
                        if (bookedSlots[i].typeOfTreatment == 0) {
                            AET = AET + 15;
                        }
                        var sHr = (final[j].slot.split('-')[0].split(':')[0]);
                        var sMin = (final[j].slot.split('-')[0].split(':')[1]);
                        var eHr = (final[j].slot.split('-')[1].split(':')[0])
                        var eMin = (final[j].slot.split('-')[1].split(':')[1])
                        var IST = Number(sHr + sMin);
                        var IET = Number(eHr + eMin);

                        if (bookedTreatment.length != 0) {
                            var slot = bookedSlots[i].startTime + '-' + bookedSlots[i].endTime;
                            if (count < 3) {
                                console.log(true);
                                final[j].bookedStatus = 0;
                                condition = 0;

                            }
                            else {
                                for (var x = AST; x <= AET; x++) {
                                    if (x >= IST && x <= IET) {
                                        var temp = final[j].slot.split('-')[0]
                                        var temp1 = final[j].slot.split('-')[1]
                                        if (IET == AST || IST == AET) {
                                            final[j].bookedStatus = 0;
                                        }
                                        else {

                                            final[j].bookedStatus = 1;

                                        }
                                    }
                                }

                            }

                        }
                        else {
                            console.log("sfsfsf")
                            for (var x = AST; x <= AET; x++) {
                                if (x >= IST && x <= IET) {
                                    var temp = final[j].slot.split('-')[0]
                                    var temp1 = final[j].slot.split('-')[1]
                                    if (IET == AST || IST == AET) {
                                        final[j].bookedStatus = 0;
                                    }
                                    else {

                                        final[j].bookedStatus = 1;
                                    }
                                }
                            }

                        }
                    }
                }
                else {
                    console.log(final)
                    for (var j = 0; j < final.length; j++) {
                        var start = bookedSlots[i].startTime.split(' ')[0];
                        var end = bookedSlots[i].endTime.split(' ')[0];
                        var bHr = (start.split(':')[0]);
                        var bMin = (start.split(':')[1]);
                        var AST = Number(bHr + bMin);
                        var bHr1 = (end.split(':')[0]);
                        var bMin1 = (end.split(':')[1]);
                        var AET = Number(bHr1 + bMin1);
                        if (bookedSlots[i].typeOfTreatment == 0) {
                            AET = AET + 15;
                        }
                        var sHr = (final[j].slot.split('-')[0].split(':')[0]);
                        var sMin = (final[j].slot.split('-')[0].split(':')[1]);
                        var eHr = (final[j].slot.split('-')[1].split(':')[0])
                        var eMin = (final[j].slot.split('-')[1].split(':')[1])
                        var IST = Number(sHr + sMin);
                        var IET = Number(eHr + eMin);

                        for (var x = AST; x <= AET; x++) {
                            if (x >= IST && x <= IET) {
                                if (IET == AST || IST == AET) {
                                    final[j].bookedStatus = 0;
                                }
                                else {
                                    final[j].bookedStatus = 1;
                                }
                            }
                        }
                        console.log("data.start", data.startTime, data.endTime);
                        //   console.log("IST >=NewStart && NewEnd<=IET",IST >=NewStart && NewEnd<=IET)

                    }

                }
            }
        }
    }

    console.log("final", final)
    for (var z = 0; z < final.length; z++) {
        var sHr = (final[z].slot.split('-')[0].split(':')[0]);
        var sMin = (final[z].slot.split('-')[0].split(':')[1]);
        var eHr = (final[z].slot.split('-')[1].split(':')[0])
        var eMin = (final[z].slot.split('-')[1].split(':')[1])
        var IST = Number(sHr + sMin);
        var IET = Number(eHr + eMin);
        if (data.startTime) {

            var NewStart = Number(data.startTime.split(':')[0] + data.startTime.split(':')[1]);
            var NewEnd = Number(data.endTime.split(':')[0] + data.endTime.split(':')[1]);
            for (var x = NewStart; x <= NewEnd; x++) {
                console.log("x", x >= IST && x <= IET, x, IST, IET)
                if (x >= IST && x <= IET) {
                    if (final[z].bookedStatus == 0) {
                        condition = 0
                    }
                    if (final[z].bookedStatus == 1) {
                        condition = 1;
                    }
                }
                else {
                    if (final[z].bookedStatus == 0) {
                        condition = 0
                    }
                    if (final[z].bookedStatus == 1) {
                        condition = 1;
                    }
                    // isAvailable = true;
                    // z = final.length + 1;
                    // break;
                }
                console.log("z", z, condition);
            }
            if (condition == 0) {
                console.log("if")
                isAvailableTemp.push(true);
            }
            else if (condition == 1) {
                console.log("else")
                isAvailableTemp.push(false);
            }
            console.log(isAvailableTemp, "isAvailableTemp")
        }
    }



    if (isAvailableTemp.length != 0) {
        if (isAvailableTemp.includes(false)) {
            isAvailable = false;
        }
        else {
            isAvailable = true;
        }
    }
    else {
        isAvailable = true;
    }
    //}
    console.log("date", data.date)
    var returnValue = {
        final: final,
        isAvailable: isAvailable
    }
    if (err1) return Promise.reject(err1);
    if (lodash.isEmpty(final)) return reject(ERR.NO_RECORDS_FOUND);
    if (data.startTime) {
        return Promise.resolve(returnValue);
    }
    else {
        return Promise.resolve(final);
    }
}

var makeTimeIntervals = function (start_Time, end_Time, increment) {
    var startTime = start_Time.toString().split(':');
    var endTime = end_Time.toString().split(':');
    increment = parseInt(increment, 10);

    var startHr = parseInt(startTime[0], 10);
    var startMin = parseInt(startTime[1], 10);
    var endHr = parseInt(endTime[0], 10);
    var endMin = parseInt(endTime[1], 10);
    var currentHr = startHr;
    var currentMin = startMin;
    var previous = pad(currentHr) + ':' + pad(currentMin);
    var current = '';
    var r = [];
    r.push(start_Time)
    do {
        currentMin += increment;
        if ((currentMin % 60) === 0 || currentMin > 60) {
            currentMin = (currentMin === 60) ? 0 : currentMin - 60;
            currentHr += 1;
            if (currentHr == 24) currentHr = 0o0;
        }
        current = pad(currentHr) + ':' + pad(currentMin);
        var end = pad(endTime[0]) + ':' + pad(endTime[1])
        if (current <= endTime) {
            r.push(current)
            previous = current;
        }
    }
    while ((currentHr != endHr));
    r.push(end_Time)
    return r;
};
const pad = function (n) { return (n < 10) ? '0' + n.toString() : n; };

const travelDistance = async (data) => {
    console.log("data", data)
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
                console.log(error);
                return reject(error);
            }
            log.debug('Travel Distance response', { attach: response.body }); log.close();

            (async () => {
                console.log("res", response.body)
                var value = {
                    duration: Math.floor(Number(((response.body.routes[0].duration).toString()).split('s')[0]) / 60),
                    distance: response.body.routes[0].distanceMeters
                }
                console.log("value", value)
                return resolve(value)
            })();
        });
    });
}

async function getRoleDetailsByStaffIdAndSlotId(data) {
    let [staffErr, staffData] = await handle(Staff.findOne({ '_id': data.staffId }).lean());
    let [err2, roleData] = await handle(Role.findOne({ _id: staffData.staffRole, "slots": { "$elemMatch": { "_id": (data.slotId) } } }).lean());
    var slotDetails;
    for (var i = 0; i < roleData.slots.length; i++) {
        if ((roleData.slots[i]._id.toString()) == data.slotId) {
            slotDetails = roleData.slots[i]
        }
    }

    if (lodash.isEmpty(slotDetails)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(slotDetails);
}
function slotCheck(start) {
    var bHr = (start.split(':')[0]);
    var bMin = (start.split(':')[1]);
    var AST = Number(bHr + bMin);
    return AST
}
async function assignServiceForClientByPhone(data) {
    let [clientErr, clientData] = await handle(Client.findOne({ 'phoneNumber': data.phoneNumber }).lean());
    if (clientErr) return Promise.reject(clientErr);
    if (lodash.isEmpty(clientData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    let [Err, assignServiceData] = await handle(AssignService.find({ 'clientId': clientData._id }).lean());
    for (var i = 0; i < assignServiceData.length; i++) {

        let [Err, staffData] = await handle(Staff.findOne({ '_id': assignServiceData[i].staffId }).lean());
        let [Err1, branchData] = await handle(Branch.findOne({ '_id': assignServiceData[i].branchId }).lean());
        let [Err2, serviceData] = await handle(Service.findOne({ '_id': assignServiceData[i].serviceId }).lean());
        console.log("branchData", branchData)
        assignServiceData[i].staffName = staffData.staffName;
        if (branchData != null) {
            assignServiceData[i].branchName = branchData.branchName;
        }
        assignServiceData[i].clientName = clientData.clientName;
        assignServiceData[i].serviceName = serviceData.serviceName;
    }
    if (Err) return Promise.reject(Err);
    if (lodash.isEmpty(assignServiceData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(assignServiceData);
}

const s3 = new AWS.S3({
    accessKeyId: config.AWSCredentails.AWS_ACCESS_KEY,
    secretAccessKey: config.AWSCredentails.AWS_SECRET_ACCESS_KEY,
    region: config.AWSCredentails.REGION
});
function removeSecuredKeys(data) {
    delete data.resetPasswordExpire;
    delete data.resetPasswordToken;
    delete data.emailVerificationCode;
    delete data.emailCodeExpiry;
    delete data.s_customer_id;
    return data;
}
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.AWSCredentails.PRIVATE_BUCKET_NAME + '/' + config.AWSCredentails.SUB_FOLDER + '/assignService',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        contentType: function (req, file, cb) {
            cb(null, file.mimetype);
        },
        key: function (req, file, cb) {
            var documentID = Date.now();
            req.body.documentID = documentID;
            req.body.mimetype = file.originalname.split('.').pop();
            cb(null, req.body.assignServiceId + '/' + documentID + "." + req.body.mimetype)
        },
        acl: 'private'
    }),
    fileFilter: function fileFilter(req, file, cb) {
        if (!(['png', 'jpeg', 'jpg'].includes(file.originalname.split('.').pop().toLowerCase()))) {
            cb({ "message": "Invalid File Format - Supported Formats: 'png', 'jpeg','.jpg" }, false);
        } else {
            cb(null, true);
        }
    }
}
).single('image');

async function uploadAutoInvoice(req, res, cb) {
    //clientApi.clientDetails(req, 'UPLOAD PDF TO AWS');
    log.debug(component, ' Upload data to aws'); log.close();
    upload(req, res, async function (err) {
        var data = req.body;
        let obj = JSON.parse(JSON.stringify(data));
        if (err) {
            return cb(err, null);
        }
        else {
            if (!req.file) {
                return cb("Please send file", null);
            }
            else {
                obj.image = "/assignService/" + obj.assignServiceId + '/' + obj.documentID + '.' + obj.mimetype;
                obj.imageFileName = data.imageFileName;
                obj.assignServiceId = data.assignServiceId;
                obj.documentID = data.documentID;
                var saveData = new AssignServiceInvoice(obj);
                let [Err, assignServiceData] = await handle(AssignService.findOneAndUpdate({ '_id': saveData.assignServiceId }, { $set: { 'autoInvoiceId': saveData.documentID } }).lean());
                console.log("assignServiceData", assignServiceData)
                console.log()
                saveData.save().then(user => {
                    log.debug(component, 'Saved File Url in AssignServiceInvoice DB');
                    log.close();
                    return cb(null, removeSecuredKeys(user));
                })
                    .catch(err => {

                        log.error(component, 'Saved File Url in AssignServiceInvoice  DB', { attach: err });
                        log.close();
                        const myKey = config.AWSCredentails.SUB_FOLDER + obj.image;
                        obj.key = myKey;
                        (async () => {
                            let [deleteDocumentErr, deleteDocumentResponse] = await handle(awsConfig.deleteObject(obj));
                            if (deleteDocumentErr) {
                                return reject(deleteDocumentErr);
                            }
                        })();
                        return cb(err);
                    })
            }
        }
    })
}
async function deleteAutoInvoice(data) {
    log.debug(component, 'Delete Book Pdf'); log.close();

    var query = [{
        "$match": { 'documentID': data.documentID }
    },
    ];
    let [err, pdfData] = await handle(AssignServiceInvoice.aggregate(query));

    return new Promise((resolve, reject) => {
        if (err) {
            return reject(err);
        }
        else {
            log.debug(component, 'Document Fetched and ready to Delete');
            log.close();
            const myKey = config.AWSCredentails.SUB_FOLDER + pdfData[0].image;
            pdfData.key = myKey;
            (async () => {

                let [deleteDocumentErr, deleteDocumentResponse] = await handle(awsConfig.deleteObject(pdfData));
                console.log("deleteDocumentResponse", deleteDocumentResponse)
                if (deleteDocumentErr) {
                    return reject(deleteDocumentErr);
                }
                else {
                    let [err, deleteData] = await handle(AssignServiceInvoice.findByIdAndUpdate({ '_id': pdfData[0]._id }, { "$set": { "isDeleted": 1 } }, { new: true, useFindAndModify: false }).lean());
                    let [err1, deleteData1] = await handle(AssignService.findByIdAndUpdate({ '_id': pdfData[0].assignServiceId }, { "$set": { "autoInvoiceId": "" } }, { new: true, useFindAndModify: false }).lean());

                    console.log("deleteData", deleteData)
                    return resolve(deleteDocumentResponse)

                }
            })();
        }
    })
}
async function getAssignServiceInvoicePresignedUrl(data) {
    log.debug(component, 'Retreiving document for user');
    log.close();
    var query = [

        {
            $match: {
                "documentID": data.documentID
            }
        },
    ]
    let [err, documentData] = await handle(AssignServiceInvoice.aggregate(query));
    return new Promise((resolve, reject) => {
        if (err) return reject(err);
        if (lodash.isEmpty(documentData)) return reject(ERR.NO_RECORDS_FOUND);
        else {
            log.debug(component, 'Document Fetched and ready to Fetch Presigned Url');
            log.close();
            const url = s3.getSignedUrl('getObject', {
                Bucket: config.AWSCredentails.PRIVATE_BUCKET_NAME,
                Key: config.AWSCredentails.SUB_FOLDER + documentData[0].image,
                Expires: config.AWSCredentails.SIGNED_URL_EXPIRY
            })
            return resolve(url)
        }
    })
}

async function getAssignServiceDataByDateForActivityReport(data) {
    log.debug(component, 'Getting AssignService Data by StaffId And Date');
    log.close();
    let fromDate, toDate;
    if (data.fromDate) {
        fromDate = new Date(data.fromDate);
    }
    if (data.toDate) {
        toDate = new Date(data.toDate);
    }

    let assignServiceData = [];
    let [err5, assign] = await handle(AssignService.find({}).lean());
    assignServiceData = assign;
    var assignServiceData1 = [];
    for (var i = 0; i < assignServiceData.length; i++) {
        if (new Date(assignServiceData[i].date) >= fromDate && new Date(assignServiceData[i].date) <= toDate) {
            assignServiceData1.push(assignServiceData[i])
        }
    }
    var totalCount, assigned = 0, completed = 0, rescheduled = 0, notAvailable = 0;
    var array = []
    //    
    if (assignServiceData1.length != 0) {
        for (var i = 0; i < assignServiceData1.length; i++) {
            if (!array.includes(assignServiceData1[i].staffId)) {
                array.push(assignServiceData1[i].staffId)
            }
        }
    }
    var arr = []
    if (assignServiceData1.length != 0) {
        for (var j = 0; j < array.length; j++) {
            let [err5, staff] = await handle(Staff.findOne({ _id: array[j] }).lean());
            for (var i = 0; i < assignServiceData1.length; i++) {
                if (assignServiceData1[i].staffId == array[j]) {
                    if (assignServiceData1[i].status == 0) {
                        assigned = assigned + 1;

                    }
                    if (assignServiceData1[i].status == 1 || assignServiceData1[i].status == 3) {
                        completed = completed + 1;

                    }
                    if (assignServiceData1[i].status == 2) {
                        rescheduled = rescheduled + 1;
                    }
                }
            }
            var temp = {
                "staff": array[j],
                "staffName": staff.staffName,
                "Assigned": assigned,
                "Completed": completed,
                "Rescheduled": rescheduled
            }
            arr.push(temp)
            assigned = 0, completed = 0
        }
    }
    if (data.status == 0) {
        for (var i = 0; i < assignServiceData1.length; i++) {
           
            let [err, clientData] = await handle(Client.findOne({ _id: assignServiceData1[i].clientId }).lean());
            let [err1, staffData] = await handle(Staff.findOne({ _id: assignServiceData1[i].staffId }).lean());
            let [err2, serviceData] = await handle(Service.findOne({ _id: assignServiceData1[i].serviceId }).lean());
            if(assignServiceData1[i].transport)
            {
            let [err3, transportData] = await handle(TravelAllowance.findOne({ _id: assignServiceData1[i].transport }).lean());
            if(transportData)
            {
            assignServiceData1[i].transportMode = transportData.travelExpenseMode;
            }
            else
            {
                assignServiceData1[i].transportMode = "Auto";
  
            }
            }
            assignServiceData1[i].clientName = clientData.clientName;
            assignServiceData1[i].staffName = staffData.staffName;
            assignServiceData1[i].empId = staffData.empId;
            assignServiceData1[i].serviceName = serviceData.serviceName;
           
        }
        return Promise.resolve(assignServiceData1);
    }
    // if (Err) return Promise.reject(Err);
    if (lodash.isEmpty(arr)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(arr);

}
async function getAssignServiceDataByDateForTravelReport(data) {
    log.debug(component, 'Getting AssignService Data by StaffId And Date');
    log.close();
    let fromDate, toDate;
    fromDate = new Date(data.fromDate);
    toDate = new Date(data.toDate);
    let [err5, assignServiceData] = await handle(AssignService.find({}).lean());
    var assignServiceData1 = [];
    for (var i = 0; i < assignServiceData.length; i++) {
        if (new Date(assignServiceData[i].date) >= fromDate && new Date(assignServiceData[i].date) <= toDate) {
            assignServiceData1.push(assignServiceData[i])
        }
    }
    var output=[];
for(var z=0;z<data.staffId.length;z++)
{
    var assignServiceData2=[];
    let [err5, staff] = await handle(Staff.findOne({_id:data.staffId[z]}).lean());
    console.log("staff",staff)
    for (var i = 0; i < assignServiceData1.length; i++) {
        if (assignServiceData1[i].staffId==data.staffId[z]) {
            assignServiceData2.push(assignServiceData1[i])
        }
    }
    if (assignServiceData2.length != 0) {
        var array = [];

        for (var i = 0; i < assignServiceData2.length; i++) {
            if (!array.includes((new Date(assignServiceData2[i].date)).toString())) {
                array.push((new Date(assignServiceData2[i].date)).toString()) 
            }
        }
    }
console.log("array",array)
    var arr = [],distance=0,amount=0;
    if (assignServiceData2.length != 0) {
        for (var j = 0; j < array.length; j++) {
            for (var i = 0; i < assignServiceData2.length; i++) {
                if (assignServiceData2[i].date == array[j]) {
                    distance=assignServiceData2[i].travelDistanceinKM+distance;
                    amount=assignServiceData2[i].travelAmount+amount;
                }
            }
            var temp = {
               // "staff": data.staffId[z],
                "Date":array[j],
                "Distance":distance,
                "Amount":amount
            }
            arr.push(temp)
            distance = 0, amount = 0
        }
    }
    var value={
        "staffId":data.staffId[z],
        "staffName":staff.staffName,
        "details":arr
    }
 output.push(value);
}
    // if (Err) return Promise.reject(Err);
    if (lodash.isEmpty(output)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(output);

}
module.exports = {
    assignServiceClient: assignServiceClient,
    assignServiceBranch: assignServiceBranch,
    getAssignedServicesbyStaff: getAssignedServicesbyStaff,
    getAllAssignedServices: getAllAssignedServices,
    getAllAssignedServicesforStaff: getAllAssignedServicesforStaff,
    getAllAssignedServicesbySingleBranch: getAllAssignedServicesbySingleBranch,
    getAllAssignedServicesbyClient: getAllAssignedServicesbyClient,
    getAllAssignedServicesbyServiceId: getAllAssignedServicesbyServiceId,
    getAllAssignedServicesofAllBranches: getAllAssignedServicesofAllBranches,
    getAllAssignedServicesofAllServices: getAllAssignedServicesofAllServices,
    getAssignedServicesofStaffbyIdinAllBranches: getAssignedServicesofStaffbyIdinAllBranches,
    getAssignedServicesofStaffbyIdinAllServices: getAssignedServicesofStaffbyIdinAllServices,
    onBranchStartToClientPlace: onBranchStartToClientPlace,
    serviceOnStart: serviceOnStart,
    serviceOnEnd: serviceOnEnd,
    getAssignedServicesById: getAssignedServicesById,
    getAssignedServicesofBranchById: getAssignedServicesofBranchById,
    updateAssignService: updateAssignService,
    getAssignServiceDataByStaffIdAndDate: getAssignServiceDataByStaffIdAndDate,
    getSlotsForAssignService: getSlotsForAssignService,
    travelDistance: travelDistance,
    // updateAssignServiceForTravel: updateAssignServiceForTravel,
    getRoleDetailsByStaffIdAndSlotId: getRoleDetailsByStaffIdAndSlotId,
    assignServiceForClientByPhone: assignServiceForClientByPhone,
    getAssignServiceDataByStaffIdAndDateForDashBoard: getAssignServiceDataByStaffIdAndDateForDashBoard,
    getAllAssignedServicesforpast30days: getAllAssignedServicesforpast30days,
    getAllAssignedServicesbyclientstaff: getAllAssignedServicesbyclientstaff,
    uploadAutoInvoice: uploadAutoInvoice,
    getAssignServiceInvoicePresignedUrl: getAssignServiceInvoicePresignedUrl,
    getAssignServiceDataByDateForActivityReport: getAssignServiceDataByDateForActivityReport,
    deleteAutoInvoice: deleteAutoInvoice,
    getAssignServiceDataByDateForTravelReport: getAssignServiceDataByDateForTravelReport
}