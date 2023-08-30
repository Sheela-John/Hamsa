'use strict'
const component = "Client API";
const models = require('../models');
const Security = require("../util/security");
const Staff = models.Staff;
const AssignService = models.AssignService;
const AssignServiceForBranch = models.AssignServiceForBranch;
const AssignServiceAPI = require('../api/assignService.api');
const Client = models.Client;
const Branch = models.Branch;
const Service = models.Services;
const ClientDistance = models.clientDistance;
const Settings = models.Settings;
const TravelAllowance = models.TravelAllowance;
const Login = models.Login;
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
const multerS3 = require('multer-s3');
const moment = require('moment');
const momentTz = require('moment-timezone');
const request = require('request');
const NodeGeocoder = require('node-geocoder');
const genrateDefaultImage = require('../util/generateCode').genrateDefaultImage;
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const fast2sms = require('fast-two-sms');
const { RRule } = require("rrule");
const log = require('../util/logger').log(component, __filename);

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

/* Create Client */
async function create(clientData) {
    log.debug(component, 'Creating a Client', { 'attach': clientData }); log.close();
    if (clientData.gender) {
        clientData.defaultImageUrl = genrateDefaultImage(clientData.gender);
    }
    if (clientData.dob) {
        clientData.dob = new Date(clientData.dob);
        let copiedDate = new Date(clientData.dob.getTime());
        clientData['dob'] = copiedDate;
    }
    let [clientErr1, clientUHID] = await handle(checkForExistingUHID(clientData));
    if (clientErr1) return Promise.reject(clientErr1);
    if (!lodash.isEmpty(clientUHID)) {
        return Promise.reject(ERR.UHID_EXISTS);
    }
    if (clientData.phoneNumber != "9999999999") {
        let [clientErr, client] = await handle(checkForExistingUser(clientData));
        if (clientErr) return Promise.reject(clientErr);
        if (!lodash.isEmpty(client)) {
            return Promise.reject(ERR.MOBILE_NUMBER_ALREADY_REGISTERED);
        }
    }
    return new Promise((resolve, reject) => {
        // else {
        async.waterfall([
            saveClient,
            createLoginCredentials
        ], function (err, result) {
            if (err) return reject(err);
            return resolve(result);
        });
        function saveClient(cb) {
            (async () => {
                clientData.role = "PORTAL_CLIENT";
                var pack = clientData.packageId;
                delete clientData.packageId;
                var temp = {
                    "id": pack,
                    "startDate": clientData.startDate,
                    "endDate": clientData.endDate,
                    "noOfSession": clientData.noOfSession,
                    "staffId": clientData.staffId,
                    "typeOfTreatment": clientData.typeOfTreatment,
                    "serviceId": clientData.serviceId,
                    "onWeekDay": clientData.onWeekDay,
                    "addSession": clientData.addSession,
                    "amount": clientData.amount,
                    "slot": clientData.slot,
                    "duration": clientData.duration,
                    "startTime": clientData.startTime,
                    "endTime": clientData.endTime
                }
                var arr = [];
                arr.push(temp);
                clientData['packageId'] = arr;
                var saveModel = new Client(clientData);
                let [err, client] = await handle(saveModel.save())
                var count = 1;
                var typeArray = [1, 3, 4];
                for (var i = 0; i < client.addSession.length; i++) {
                    let [assignErr, assignServiceValue] = await handle(AssignService.find({}).lean());
                    for (var j = 0; j < assignServiceValue.length; j++) {
                        if (assignServiceValue[j].date == new Date(client.addSession[i].date)) {
                            if (slotCheck(assignServiceValue[j].startTime) >= slotCheck(client.addSession[i].slotStartTime) && slotCheck(assignServiceValue[j].endTime) <= slotCheck(client.addSession[i].slotEndTime)) {
                                if (typeArray.includes(assignServiceValue[j].typeOfTreatment) && typeArray.includes(client.typeOfTreatment)) {
                                    count = assignServiceValue[j].bookedCount + 1;
                                    let [assignErr, assignServiceValue1] = await handle(AssignService.findOneAndUpdate({ _id: assignServiceValue[j]._id }, { $set: { bookedCount: count } }, { new: true, useFindAndModify: false }))
                                }
                            }
                        }
                    }
                    var assignData = {
                        "clientId": client._id,
                        "clientName": client.clientName,
                        "staffId": client.staffId,
                        "phone": client.phoneNumber,
                        "date": new Date(client.addSession[i].date),
                        "status": 0,
                        "packageId": pack,
                        "address": client.address,
                        "serviceId": client.serviceId,
                        "endTime": client.addSession[i].slotEndTime,
                        "startTime": client.addSession[i].slotStartTime,
                        "duration": client.addSession[i].duration,
                        "slot": client.addSession[i].slot,
                        "typeOfTreatment": client.typeOfTreatment,
                        "latitude": client.clientAddressLatitude,
                        "longitude": client.clientAddressLongitude,
                        "bookedCount": count,
                        "branchId": client.homeBranchId,
                        "branchType": 0
                    }
                    var saveAssignData = new AssignService(assignData);
                    let [err1, assignServiceData] = await handle(saveAssignData.save())
                }
                if (err) cb(err, null);
                else {
                    cb(null, client);
                }
            })();
        }
        function createLoginCredentials(clientDatafromFunction, cb) {
            log.debug(component, 'Inside Create Login Functionality', { attach: clientDatafromFunction });
            (async () => {
                let clientDataModel = {};
                clientDataModel['ipNumber'] = clientDatafromFunction.empId;
                clientDataModel['email'] = clientDatafromFunction.email;
                clientDataModel['role'] = "PORTAL_CLIENT";
                // clientDataModel['password'] = Security.hash(clientDatafromFunction.createdAt, clientDatafromFunction.password);
                clientDataModel['phone'] = clientDatafromFunction.phoneNumber;
                clientDataModel['user'] = clientDatafromFunction._id;
                clientDataModel['createdAt'] = clientDatafromFunction.createdAt;
                const loginModel = new Login(clientDataModel);
                let [loginerr, loginData] = await handle(loginModel.save());
                if (loginerr) cb(loginerr, null);
                else {
                    cb(null, clientDatafromFunction);
                }
            })();
        }
        // function loginClient(clientData, cb) {
        //     (async () => {
        //         let [err, loginClient] = await handle(userLogin(clientData.empId, clientData.savepassword, 'PORTAL_CLIENT'));
        //         if (err) cb(err, null);
        //         else {
        //             cb(null, clientData);
        //         }
        //     })();
        // }

        /* For Future Use */
        // function sendEmail(client, cb) {
        //     if ((clientData.email != '') && (clientData.email != undefined)) {
        //         let subject = 'Verification Code';
        //         var codeNew = generateCode.randomString(4, 'a#');
        //         html.create({
        //             data: {
        //                 brandLogo: `${config.AWSCredentails.S3StorageLinkForimages}brand/brand-logo.png`,
        //                 name: `${client.email}`,
        //                 password: `${client.password}`
        //             },
        //             templateName: 'verification_code'
        //         }, (err, contents) => {
        //             if (err) cb(err, null);
        //             else {
        //                 Email.send(client.email, subject, contents, undefined, () => {
        //                     log.debug(component, 'Verification Code email successfull');
        //                     log.close()
        //                     delete client.password;
        //                     cb(null, client);
        //                 });
        //             }
        //         });
        //     }
        //     else {
        //         cb(null, client);
        //     }
        // }
        // }
    })
}

async function checkForExistingUser(loginCred) {
    let query =
        [{
            $match: {
                'phoneNumber': loginCred.phoneNumber
            }
        }]
    return new Promise((resolve, reject) => {
        Client.aggregate(query).collation({ locale: "en", strength: 2 }).exec((err, client) => {
            if (err) {
                log.error(component, { attach: err });
                log.close();
                return reject(err);
            }
            if (client.length > 0) {
                return resolve(client);
            }
            return resolve([]);
        })
    })
}
async function checkForExistingUHID(loginCred) {
    let query =
        [{
            $match: {
                'uhid': loginCred.uhid
            }
        }]
    return new Promise((resolve, reject) => {
        Client.aggregate(query).collation({ locale: "en", strength: 2 }).exec((err, client) => {
            if (err) {
                log.error(component, { attach: err });
                log.close();
                return reject(err);
            }
            if (client.length > 0) {
                return resolve(client);
            }
            return resolve([]);
        })
    })
}

/* Get Client by Id */
async function getClientDatabyId(clientId) {
    log.debug(component, 'Getting Client Data by Id');
    log.close();
    let [clientErr, clientData] = await handle(Client.findOne({ '_id': clientId }).lean());
    var len = clientData.packageId.length;
    clientData.startDate = new Date(clientData.startDate).toDateString();
    clientData.endDate = new Date(clientData.endDate).toDateString();
    var sessionArray = [];
    for (var j = 0; j < len; j++) {
        let [Err, assignServiceData] = await handle(AssignService.find({ 'packageId': clientData.packageId[j].id }).sort({ "date": 1 }).lean());
        for (var i = 0; i < assignServiceData.length; i++) {
            var temp = {
                date: assignServiceData[i].date,
                startTime: assignServiceData[i].startTime,
                endTime: assignServiceData[i].endTime,
                duration: assignServiceData[i].duration
            }
            sessionArray.push(temp)
        }
        let [err, branchData] = await handle(Branch.findOne({ _id: clientData.homeBranchId }).lean());
        let [err1, staffData] = await handle(Staff.findOne({ _id: clientData.packageId[j].staffId }).lean());
        let [err2, serviceData] = await handle(Service.findOne({ _id: clientData.packageId[j].serviceId }).lean());
        clientData.packageId[j].homeBranchAddress = branchData.branchAddress;
        clientData.packageId[j].staffName = staffData.staffName;
        clientData.packageId[j].serviceName = serviceData.serviceName;
    }
    clientData.session = sessionArray
    if (clientErr) return Promise.reject(clientErr);
    if (lodash.isEmpty(clientData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(clientData);
}

/* Get All Client Detail */
async function getAllClientDetails() {
    log.debug(component, 'Get All Client Detail'); log.close();
    let [err, clientData] = await handle(Client.find({}).lean());
    for (var i = 0; i < clientData.length; i++) {
        let [err, branchData] = await handle(Branch.findOne({ _id: clientData[i].homeBranchId }).lean());
        let [err1, staffData] = await handle(Staff.findOne({ _id: clientData[i].staffId }).lean());
        let [err2, serviceData] = await handle(Service.findOne({ _id: clientData[i].serviceId }).lean());
        clientData[i].homeBranchAddress = branchData.branchAddress;
        clientData[i].homeBranchName = branchData.branchName;
        clientData[i].staffName = staffData.staffName;
        clientData[i].serviceName = serviceData.serviceName;
    }
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(clientData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(clientData);
}

async function updateClient(datatoupdate, clientId) {
    log.debug(component, 'Updating a Client');
    log.close();
    let [ClientErr, client] = await handle(Client.findOne({ "_id": clientId }));
    if (ClientErr) {
        return Promise.reject(ClientErr);
    }
    let clientData, temp = 0;
    var packageData = datatoupdate.packageId;
    for (let x = 0; x < client.packageId.length; x++) {
        if (client.packageId[x].id == (packageData[0].id)) {
            temp = 1;
        }
    }
    if (temp == 0) {
        let [err, updatePackage] = await handle(Client.findOneAndUpdate({ _id: clientId }, { $push: { packageId: { $each: [packageData[0]], $sort: -1 } } }, { new: true, useFindAndModify: false }).lean());
    }
    else {
    }
    for (let x = 0; x < client.packageId.length; x++) {
        // var packageData = datatoupdate.packageId;
        delete datatoupdate.packageId;
        clientData = await handle(Client.findOneAndUpdate({ _id: clientId }, datatoupdate, { new: true, useFindAndModify: false }));
        var count = 1;
        var typeArray = [1, 3, 4];
        var assignServiceData = [];
        for (let i = 0; i < packageData[0].addSession.length; i++) {
            assignServiceData.push({
                staffId: packageData[0].staffId,
                date: new Date(packageData[0].addSession[i].date),
                clientId: clientId,
                phone: datatoupdate.phoneNumber,
                address: datatoupdate.address,
                lattitude: datatoupdate.clientAddressLatitude,
                longitute: datatoupdate.clientAddressLongitude,
                typeOfTreatment: packageData[0].typeOfTreatment,
                branchType: 0,
                serviceId: packageData[0].serviceId,
                branchId: datatoupdate.homeBranchId,
                branchAddress: datatoupdate.homeBranchAddress,
                slot: packageData[0].slot,
                duration: packageData[0].duration,
                startTime: packageData[0].addSession[i].slotStartTime,
                endTime: packageData[0].addSession[i].slotEndTime,
                status: 0,
                packageId: packageData[0].id
            })
        }
        let updatePackage;
        if (client.packageId[x].id == packageData[0].id) {
            updatePackage = await handle(Client.findOneAndUpdate(
                {
                    "_id": mongoose.Types.ObjectId(clientId),
                    "packageId.id": packageData[0].id
                }, {
                '$set': {
                    'packageId.$.id': packageData[0].id,
                    'packageId.$.noOfSession': packageData[0].noOfSession,
                    'packageId.$.onWeekDay': packageData[0].onWeekDay,
                    'packageId.$.amount': packageData[0].amount,
                    'packageId.$.staffId': packageData[0].staffId,
                    'packageId.$.startDate': packageData[0].startDate,
                    'packageId.$.endDate': packageData[0].endDate,
                    'packageId.$.serviceId': packageData[0].serviceId,
                    'packageId.$.typeOfTreatment': packageData[0].typeOfTreatment,
                    'packageId.$.slot': packageData[0].slot,
                    'packageId.$.duration': packageData[0].duration,
                    'packageId.$.startTime': packageData[0].startTime,
                    'packageId.$.endTime': packageData[0].endTime
                }
            }, {
                new: true, useFindAndModify: false
            }
            ));
        }
    }
    if (temp == 0) {
        let [err, updatePackage] = await handle(Client.findOneAndUpdate({ _id: clientId }, { $push: { packageId: { $each: [packageData[0]], $sort: -1 } } }, { new: true, useFindAndModify: false }).lean());
    }
    else {
        console.log("already exits")
    }
    console.log(client.packageId.length, "gggg")
    for (let x = 0; x < client.packageId.length; x++) {
        console.log("xxxxxxxxxxxxxxxx", x)
        //    console.log(client.packageId,"client.packageId")
        // var packageData = datatoupdate.packageId;
        delete datatoupdate.packageId;
        clientData = await handle(Client.findOneAndUpdate({ _id: clientId }, datatoupdate, { new: true, useFindAndModify: false }));

        var count = 1;
        var typeArray = [1, 3, 4];
        console.log(packageData[0].addSession.length, "gggggggggg")
        for (let i = 0; i < packageData[0].addSession.length; i++) {

            assignServiceData.push({
                staffId: packageData[0].staffId,
                date: new Date(packageData[0].addSession[i].date),
                clientId: clientId,
                phone: datatoupdate.phoneNumber,
                address: datatoupdate.address,
                lattitude: datatoupdate.clientAddressLatitude,
                longitute: datatoupdate.clientAddressLongitude,
                typeOfTreatment: packageData[0].typeOfTreatment,
                branchType: 0,
                serviceId: packageData[0].serviceId,
                branchId: datatoupdate.homeBranchId,
                branchAddress: datatoupdate.homeBranchAddress,
                slot: packageData[0].slot,
                duration: packageData[0].duration,
                startTime: packageData[0].addSession[i].slotStartTime,
                endTime: packageData[0].addSession[i].slotEndTime,
                status: 0,
                latitude: client.clientAddressLatitude,
                longitude: client.clientAddressLongitude,
                // bookedCount: count,
                packageId: packageData[0].id
            }
            )
        }
        console.log("assignServiceData", assignServiceData)
        let updatePackage;
        if (client.packageId[x].id == packageData[0].id) {
            console.log("if")

            // console.log("updatePackage:", updatePackage);
            let [err, assignData] = await handle(AssignService.find({ packageId: packageData[0].id }))
            if (err) {
                return Promise.reject(err);
            }
            for (var i = 0; i < assignData.length; i++) {
                if (assignData[i].bookedCount > 1) {
                    let [assignErr, assignServiceValue] = await handle(AssignService.find({}).lean());
                    for (var j = 0; j < assignServiceValue.length; j++) {
                        if (assignServiceValue[j].date == new Date(assignData[i].date)) {
                            if (slotCheck(assignServiceValue[j].startTime) >= slotCheck(assignData[i].startTime) && slotCheck(assignServiceValue[j].endTime) <= slotCheck(assignData[i].endTime)) {
                                if (typeArray.includes(assignServiceValue[j].typeOfTreatment) && typeArray.includes(assignData[i].typeOfTreatment)) {
                                    count = assignServiceValue[j].bookedCount - 1;
                                    let [assignErr, assignServiceValue1] = await handle(AssignService.findOneAndUpdate({ _id: assignServiceValue[j]._id }, { $set: { bookedCount: count } }, { new: true, useFindAndModify: false }))
                                }
                            }
                        }
                    }
                }
                let [err2, assignData2] = await handle(AssignService.deleteMany({ packageId: packageData[0].id }));
                if (err2) {
                    return Promise.reject(err2);
                }
            }
            for (let i = 0; i < packageData[0].addSession.length; i++) {
                let [assignErr, assignServiceValue] = await handle(AssignService.find({}).lean());
                for (var j = 0; j < assignServiceValue.length; j++) {
                    if (assignServiceValue[j].date == new Date(packageData[0].addSession[i].date)) {
                        if (slotCheck(assignServiceValue[j].startTime) >= slotCheck(packageData[0].addSession[i].slotStartTime) && slotCheck(assignServiceValue[j].endTime) <= slotCheck(packageData[0].addSession[i].slotEndTime)) {
                            if (typeArray.includes(assignServiceValue[j].typeOfTreatment) && typeArray.includes(packageData[0].typeOfTreatment)) {
                                count = assignServiceValue[j].bookedCount + 1;
                                let [assignErr, assignServiceValue1] = await handle(AssignService.findOneAndUpdate({ _id: assignServiceValue[j]._id }, { $set: { bookedCount: count } }, { new: true, useFindAndModify: false }))
                            }
                        }
                    }
                }
                assignServiceData[i].bookedCount = count
                var saveAssignData = new AssignService(assignServiceData[i]);
                let [err3, assignData3] = await handle(saveAssignData.save());
            }
            break;
        }
        else {
            for (let i = 0; i < packageData[0].addSession.length; i++) {
                let [assignErr, assignServiceValue] = await handle(AssignService.find({}).lean());
                for (var j = 0; j < assignServiceValue.length; j++) {
                    if (assignServiceValue[j].date == new Date(packageData[0].addSession[i].date)) {
                        if (slotCheck(assignServiceValue[j].startTime) >= slotCheck(packageData[0].addSession[i].slotStartTime) && slotCheck(assignServiceValue[j].endTime) <= slotCheck(packageData[0].addSession[i].slotEndTime)) {
                            if (typeArray.includes(assignServiceValue[j].typeOfTreatment) && typeArray.includes(packageData[0].typeOfTreatment)) {
                                count = assignServiceValue[j].bookedCount + 1;
                                let [assignErr, assignServiceValue1] = await handle(AssignService.findOneAndUpdate({ _id: assignServiceValue[j]._id }, { $set: { bookedCount: count } }, { new: true, useFindAndModify: false }))
                            }
                        }
                    }
                }
                assignServiceData[i].bookedCount = count
                var saveAssignData = new AssignService(assignServiceData[i]);
                let [err3, assignData3] = await handle(saveAssignData.save());
                count = 1;
            }
        }
    }
    let [assignErr, clientValue] = await handle(Client.find({ _id: clientId }).lean());
    return Promise.resolve(clientValue);
}

const sendOTP = async function (data) {
    return new Promise((resolve, reject) => {
        async.waterfall([
            function verifyPhoneNumber(cb) {
                (async () => {
                    let [mobileErr, mobileData] = await handle(checkMobileAvailability(data));
                    if (mobileErr) cb(mobileErr);
                    else if (lodash.isEmpty(mobileData)) {
                        return cb(ERR.MOBILE_NUMBER_NOT_REGISTERED);
                    }
                    else {
                        cb(null, mobileData)
                    };
                })();
            },
            function sendSMS(resutlData, cb) {
                (async () => {
                    const OTP = otpGenerator.generate(6, {
                        digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
                    });
                    const number = data.phone;
                    const salt = await bcrypt.genSalt(10);
                    const hashedOTP = await bcrypt.hash(OTP, salt)
                    let datatoupdate = {
                        'otp': hashedOTP
                    }
                    let [err, loginData] = await handle(Login.findOneAndUpdate({ "phone": number }, datatoupdate, { new: true, useFindAndModify: false }))
                    if (err) cb(err);
                    else {
                        cb(null, loginData);
                        // let [sendSmsErr, smsData] = await handle(fast2sms.sendMessage({ authorization: "3xFtQ8aNIclXJq6CnzsoDjgWAu1HiVe47GTLkpYRbBwmMyKvrd7mJied0uv6wW5bytko8RAMqPrFlxCS", message: OTP, numbers: [number] }));
                        // if (sendSmsErr) cb(sendSmsErr);
                        // else cb(null, smsData);
                    };
                })();
            }
        ], (err, result) => {
            if (err) {
                log.error(component, 'Error send OTP mobile number', { attach: err });
                log.close();
                return reject(err);
            }
            else {
                log.debug(component, 'OTP send successfull');
                log.close();
                return resolve(result);
            }
        })
    })
}

// check phone number availabilty
function checkMobileAvailability(data) {
    return new Promise((resolve, reject) => {
        Login.findOne({ 'phone': data.phone, 'role': 'PORTAL_CLIENT' }).then(login => {
            if (!lodash.isEmpty(login)) {
                log.debug(component, 'Found the user data for mobile number');
                log.close();
                return resolve(login);
            }
            else {
                log.debug(component, 'Mobile Number is not registered with us');
                log.close();
                return resolve(null);
            }
        }).catch(err => {
            log.error(component, 'Error retrieving the user data'); log.close();
            return reject(err);
        })
    })
}

const requestAdditionalService = async function (data) {
    log.debug(component, 'Requesting Additional Service for Staff by Client', { 'attach': data });
    log.close();
}

async function saveRecurringSession(data) {
    var singleArray = [];
    data.weekDaysArr.forEach(element => {
        if (element.value == "RRule.MO") {
            singleArray.push(0)
        }
        if (element.value == "RRule.TU") {
            singleArray.push(1)
        }
        if (element.value == "RRule.WE") {
            singleArray.push(2)
        }
        if (element.value == "RRule.TH") {
            singleArray.push(3)
        }
        if (element.value == "RRule.FR") {
            singleArray.push(4)
        }
        if (element.value == "RRule.SA") {
            singleArray.push(5)
        }
        if (element.value == "RRule.SU") {
            singleArray.push(6)
        }
    })
    let recurringRule = {
        freq: RRule.WEEKLY,
        dtstart: new Date(data.startDate),
        until: new Date(data.endDate),
        count: 30,
        interval: 1
    }
    recurringRule['byweekday'] = singleArray
    const rule = new RRule(recurringRule);
    var recurringdate = [];
    recurringdate = rule.all()
    var dateSlot = []
    if (recurringdate.length < data.noOfSession) {
        return Promise.reject(ERR.NO_OF_SESSION_GREATER_THAN_NO_OF_SLOTS);
    }
    else {
        for (let i = 0; i < data.noOfSession; i++) {
            dateSlot.push(formattedDate(recurringdate[i].toString()))
        }
        var slotArr = [];
        for (var i = 0; i < dateSlot.length; i++) {
            let temp = {
                "staffId": data.staffId,
                "date": dateSlot[i],
                "slotId": data.slotId,
                "duration": data.duration,
                "typeOfTreatment": data.typeOfTreatment,
                "startTime": data.startTime,
                "endTime": data.endTime
            }
            let [err, assign] = await handle(AssignServiceAPI.getSlotsForAssignService(temp))
            var slotsData = {
                date: dateSlot[i],
                slots: assign.final,
                isAvailable: assign.isAvailable
            }
            slotArr.push(slotsData)
        }
        if (lodash.isEmpty(slotArr)) return Promise.reject(ERR.NO_RECORDS_FOUND);
        return Promise.resolve(slotArr);
    }
}

function formattedDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + (d.getDate()),
        year = d.getFullYear();
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    return [year, month, day].join('-');
}

async function enableDisableClient(id) {
    log.debug(component, 'Enable and Disable SPOC');
    log.close();
    let [err, singleStaffData] = await handle(Client.findOne({ _id: id }));
    let status = (singleStaffData.isDeleted == 0) ? 1 : 0;
    let [error, spoc] = await handle(Client.findByIdAndUpdate({ _id: singleStaffData._id }, { "$set": { "isDeleted": status } }, { new: true, useFindAndModify: false }));
    let [loginErr, staffLogin] = await handle(Login.find({ user: id }));
    let loginstatus = (staffLogin[0].status == 0) ? 1 : 0;
    let [loginError, data] = await handle(Login.findByIdAndUpdate({ _id: staffLogin[0]._id }, { "$set": { "status": loginstatus } }, { new: true, useFindAndModify: false }));
    if (loginError) return Promise.reject(error);
    return Promise.resolve(data);
}

async function generatePackageId(id) {
    var packageIdValue = Math.floor((Math.random() * 100000000000) + 1);
    let [err2, clientData] = await handle(Client.findOneAndUpdate({ _id: id, }, { $push: { 'packageId': packageIdValue } }, { new: true, useFindAndModify: false }).lean());
}

async function getClientDetailsByPackageId(data) {
    let [err2, clientData] = await handle(Client.findOne({ "_id": data._id }).lean());
    var details;
    for (var i = 0; i < clientData.packageId.length; i++) {
        if (clientData.packageId[i].id == data.packageId) {
            details = clientData.packageId[i];
        }
    }
    if (err2) return Promise.reject(err2);
    return Promise.resolve(details);
}

function slotCheck(start) {
    var bHr = (start.split(':')[0]);
    var bMin = (start.split(':')[1]);
    var AST = Number(bHr + bMin);
    return AST
}

async function getAssignServiceByPackageId(data) {
    let [assignErr, assignData] = await handle(AssignService.find({ "packageId": data.packageId, "status": 1 }).lean());
    if (assignErr) {
        return Promise.reject(assignErr);
    }
    return Promise.resolve(assignData);
}

module.exports = {
    create: create,
    getClientDatabyId: getClientDatabyId,
    getAllClientDetails: getAllClientDetails,
    updateClient: updateClient,
    sendOTP: sendOTP,
    requestAdditionalService: requestAdditionalService,
    saveRecurringSession: saveRecurringSession,
    enableDisableClient: enableDisableClient,
    generatePackageId: generatePackageId,
    getClientDetailsByPackageId: getClientDetailsByPackageId,
    getAssignServiceByPackageId: getAssignServiceByPackageId
}