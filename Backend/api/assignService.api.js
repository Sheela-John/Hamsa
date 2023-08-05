'use strict'
const component = "Staff API";
const models = require('../models');
const Security = require("../util/security");
const AssignServiceForClient = models.AssignServiceForClient;
const AssignServiceForBranch = models.AssignServiceForBranch;
const AssignService = models.AssignService;
const Client = models.Client;
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
    let copiedAppointmentDate = new Date(someDate.getTime());

    assignServiceData['date'] = copiedAppointmentDate;

    // assignServiceData.time = someDate.setUTCHours(assignServiceData.time.split(':')[0], assignServiceData.time.split(':')[1]);
    // assignServiceData['time'] = assignServiceData.time;
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
            let [findClientErr, findClientData] = await handle(Client.findOne({ 'clientName': assignServiceData.clientName }));
            assignServiceData['clientId'] = findClientData._id;
            if (findClientErr) return Promise.reject(findClientErr);
            if (findClientData == undefined) {
                const options = {
                    provider: 'google',
                    httpAdapter: 'https',
                    // Optional depending on the providers
                    // fetch: customFetchImplementation,
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

                var saveModel = new Client(clientData);
                let [err, clientDataSaved] = await handle(saveModel.save())

                if (err) return Promise.reject(err);
                assignServiceData['clientId'] = clientDataSaved._id;
                assignServiceData['bookedCount'] = 1;
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
            }
            else {
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
            }
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

// const getAssignedServicesById = async (serviceClientId) => {
//     var query = [
//         { $match: { '_id': mongoose.Types.ObjectId(serviceClientId) } },
//         {
//             '$addFields': {
//                 'user_id': { $toObjectId: "$staffId" },
//                 'serviceId': { $toObjectId: "$service" },
//                 'clientObjId': { $toObjectId: "$clientId" },
//             }
//         },
//         {
//             '$lookup': {
//                 'from': 'staff',
//                 'localField': 'user_id',
//                 'foreignField': '_id',
//                 'as': 'staffData'
//             }
//         },
//         {
//             "$unwind": "$staffData"
//         },
//         {
//             '$lookup': {
//                 'from': 'services',
//                 'localField': 'serviceId',
//                 'foreignField': '_id',
//                 'as': 'servicesData'
//             }
//         },
//         {
//             "$unwind": "$servicesData"
//         },
//         {
//             '$lookup': {
//                 'from': 'client',
//                 'localField': 'clientObjId',
//                 'foreignField': '_id',
//                 'as': 'clientData'
//             }
//         },
//         {
//             "$unwind": "$clientData"
//         }
//     ];
//     var [clientServicesAllDataErr, clientServicesDatabyId] = await handle(AssignServiceForClient.aggregate(query));
//     if (clientServicesAllDataErr) return Promise.reject(clientServicesAllDataErr);
//     else return Promise.resolve(clientServicesDatabyId[0])
// }

async function getAssignedServicesById(id) {
    log.debug(component, 'Getting AssignService Data by Id');
    log.close();
    let [Err, assignServiceData] = await handle(AssignService.findOne({ '_id': id }).lean());
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
const updateAssignService = async function (datatoupdate) {
    log.debug(component, 'Update Assinged Service fot Client', { 'attach': datatoupdate }); log.close();
    let assignServiceId = datatoupdate.assignServiceId;
    let [err, travelDistanceValue] = await handle(travelDistance(datatoupdate));
    datatoupdate.travelDistanceinKM = travelDistanceValue.distance;
    datatoupdate.travelDuration = travelDistanceValue.duration;
    let [clientErr, clientData] = await handle(AssignService.findOneAndUpdate({ "_id": assignServiceId }, datatoupdate, { new: true, useFindAndModify: false }))
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

async function getSlotsForAssignService(data) {
    log.debug(component, 'Getting AssignService Data by StaffId And Date');
    log.close();
    let [err, staffData] = await handle(Staff.findOne({ _id: data.staffId }).lean());
    let [err1, roleData] = await handle(Role.findOne({ "_id": staffData.staffRole }).lean());
    var slotTime = [];
    var temp;
    let [err2, bookedSlots] = await handle(getAssignServiceDataByStaffIdAndDate(data));

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
    var output = makeTimeIntervals(slotTime[0].startTime, slotTime[0].endTime, data.duration)
    var final = [];
    for (var j = 0; j < output.length; j++) {
        if (j != output.length - 1) {
            var temp = {
                "slot": (output[j] + '-' + output[j + 1]),
                "bookedStatus": 0,
            }
            final.push(temp);
        }
    }
    var count = 0;
    if (bookedSlots) {
        for (var i = 0; i < bookedSlots.length; i++) {
            if (typeOfTreamentArray.includes(bookedSlots[i].typeOfTreatment)) {
                count = count + 1
            }
        }
    }
    if (bookedSlots) {
        for (var i = 0; i < bookedSlots.length; i++) {
            if (bookedSlots[i].date == new Date(data.date)) {
                if (typeOfTreamentArray.includes(data.typeOfTreatment)) {
                    for (var j = 0; j < final.length; j++) {
                        var start = bookedSlots[i].startTime.split(' ')[0];
                        var end = bookedSlots[i].endTime.split(' ')[0];
                        var bHr = (start.split(':')[0]);
                        var bMin = (start.split(':')[1]);

                        var AST = Number(bHr + bMin);
                        var bHr1 = (end.split(':')[0]);
                        var bMin1 = (end.split(':')[1]);

                        var AET = Number(bHr1 + bMin1);
                        if (bookedSlots[i].typeOfTreatment == 2) {
                            AET = AET + 15;
                        }
                        var sHr = (final[j].slot.split('-')[0].split(':')[0]);
                        var sMin = (final[j].slot.split('-')[0].split(':')[1]);
                        var eHr = (final[j].slot.split('-')[1].split(':')[0])
                        var eMin = (final[j].slot.split('-')[1].split(':')[1])


                        var IST = Number(sHr + sMin);
                        var IET = Number(eHr + eMin);
                        if (count != 0 && count <= 3) {
                            final[j].bookedStatus = 0;
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


                }
                else {
                    for (var j = 0; j < final.length; j++) {
                        var start = bookedSlots[i].startTime.split(' ')[0];
                        var end = bookedSlots[i].endTime.split(' ')[0];
                        var bHr = (start.split(':')[0]);
                        var bMin = (start.split(':')[1]);
                        var AST = Number(bHr + bMin);
                        var bHr1 = (end.split(':')[0]);
                        var bMin1 = (end.split(':')[1]);
                        var AET = Number(bHr1 + bMin1);
                        if (bookedSlots[i].typeOfTreatment == 2) {
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
        }
    }
    if (err1) return Promise.reject(err1);
    if (lodash.isEmpty(final)) return reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(final);
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
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            body: {
                "origin": {
                    "location": {
                        "latLng": {
                            "latitude": data.slatitude, // Home Branch Latitude 
                            "longitude": data.slongitude  // Home Branch Longitude
                        }
                    }
                },
                "destination": {
                    "location": {
                        "latLng": {
                            "latitude": data.elatitude,
                            "longitude": data.elongitude
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
    travelDistance: travelDistance
}