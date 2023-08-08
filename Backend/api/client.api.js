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
const genrateDefaultImage = require('../util/generateCode').genrateDefaultImage;
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const fast2sms = require('fast-two-sms');
const { RRule } = require("rrule");

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

// /* Create Client */
// async function create(clientData) {
//     log.debug(component, 'Creating a Client', { 'attach': clientData }); log.close();
//     var saveModel = new Client(clientData);
//     let [err, clientDataSaved] = await handle(saveModel.save())
//     if (err) return Promise.reject(err);
//     else return Promise.resolve(clientDataSaved)
// }

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
    let [clientErr, client] = await handle(checkForExistingUser(clientData));
    if (clientErr) return Promise.reject(clientErr);
    if (!(lodash.isEmpty(client))) return Promise.reject(ERR.DUPLICATE_RECORD);
    return new Promise((resolve, reject) => {
        if (clientErr) return reject(clientErr);
        if (!lodash.isEmpty(client)) {
            return reject(ERR.ACCOUNT_ALREADY_REGISTERED);
        }
        else {
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
                    var saveModel = new Client(clientData);
                    let [err, client] = await handle(saveModel.save())
                    var count=1;
                    var typeArray=[1,3,4];
                    for (var i = 0; i < client.addSession.length; i++) {
                        let [assignErr, assignServiceValue] = await handle(AssignService.find({}).lean());
                        console.log("assignServiceData",assignServiceValue)
                        for (var j = 0; j < assignServiceValue.length; j++) {

                            if (assignServiceValue[j].date == new Date(client.addSession[i].date)) {
                                console.log("check",slotCheck(assignServiceValue[j].startTime))
                                if (slotCheck(assignServiceValue[j].startTime) >= slotCheck(client.addSession[i].slotStartTime) && slotCheck(assignServiceValue[j].endTime) <= slotCheck(client.addSession[i].slotEndTime)) {
                                    console.log(true,client.typeOfTreatment)
                                    if (typeArray.includes(assignServiceValue[j].typeOfTreatment) && typeArray.includes( client.typeOfTreatment)) {
                                        console.log("client.typeOfTreatment",assignServiceValue[j].bookedCount)
                                        count = assignServiceValue[j].bookedCount + 1;
                                        console.log("count",count)
                                        let [assignErr, assignServiceValue1] = await handle(AssignService.findOneAndUpdate({_id:assignServiceValue[j]._id},{$set:{bookedCount:count}},{ new: true, useFindAndModify: false }))
                                        console.log("assignServiceValue1",assignServiceValue1)
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
                            "packageId": client.packageId,
                            "address": client.address,
                            "serviceId": client.serviceId,
                            "endTime": client.addSession[i].slotEndTime,
                            "startTime": client.addSession[i].slotStartTime,
                            "duration": client.addSession[i].duration,
                            "slot": client.addSession[i].slot,
                            "typeOfTreatment": client.typeOfTreatment,
                            "latitude": client.clientAddressLatitude,
                            "longitude": client.clientAddressLogitude,
                            "bookedCount": count
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
        }
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
        Login.aggregate(query).collation({ locale: "en", strength: 2 }).exec((err, client) => {
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
    console.log(clientData.packageId)
    var sessionArray = [];
    for (var j = 0; j < clientData.packageId.length; j++) {
        let [Err, assignServiceData] = await handle(AssignService.find({ 'packageId': clientData.packageId[j] }).sort({ "date": 1 }).lean());

        for (var i = 0; i < assignServiceData.length; i++) {
            var temp = {
                date: assignServiceData[i].date,
                startTime: assignServiceData[i].startTime,
                endTime: assignServiceData[i].endTime,
                duration: assignServiceData[i].duration
            }
            console.log("temp", temp)
            sessionArray.push(temp)
            console.log("sessionArray", sessionArray)
        }
    }

    let [err, branchData] = await handle(Branch.findOne({ _id: clientData.homeBranchId }).lean());
    let [err1, staffData] = await handle(Staff.findOne({ _id: clientData.staffId }).lean());
    let [err2, serviceData] = await handle(Service.findOne({ _id: clientData.serviceId }).lean());
    clientData.homeBranchAddress = branchData.branchAddress;
    clientData.staffName = staffData.staffName;
    clientData.serviceName = serviceData.serviceName;
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
        clientData[i].staffName = staffData.staffName;
        clientData[i].serviceName = serviceData.serviceName;
    }

    if (err) return Promise.reject(err);
    if (lodash.isEmpty(clientData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(clientData);
}

/* To Update Client - API */
const UpdateClient = async function (datatoupdate) {
    log.debug(component, 'Updating a Client', { 'attach': datatoupdate }); log.close();
    let clientId = datatoupdate._id;
    delete datatoupdate._id
    let [Clienterr, client] = await handle(Client.findOne({ "_id": clientId }))
    let clientData;

    if (client.packageId.includes(datatoupdate.packageId)) {
        clientData = await handle(Client.findOneAndUpdate({ "_id": clientId }, datatoupdate, { new: true, useFindAndModify: false }))
    }
    else {

        clientData = await handle(Client.findOneAndUpdate({ _id: clientId, }, { $push: { packageId: { $each: [datatoupdate.packageId], $sort: -1 } } }, { new: true, useFindAndModify: false }).lean());

    }

    //   let [err, clientData] = await handle(Client.findOneAndUpdate({ "_id": clientId }, datatoupdate, { new: true, useFindAndModify: false }))
    let [err2, assignData1] = await handle(AssignService.find({ 'packageId': datatoupdate.packageId }))
    if (assignData1.length != 0) {
        let [err1, assignData] = await handle(AssignService.deleteMany({ 'packageId': datatoupdate.packageId }))
        for (var i = 0; i < datatoupdate.addSession.length; i++) {
            var assign = {

                "clientId": clientId,
                "clientName": datatoupdate.clientName,
                "staffId": datatoupdate.staffId,
                "phone": datatoupdate.phoneNumber,
                "date": new Date(datatoupdate.addSession[i].date),
                "status": 0,
                "packageId": datatoupdate.packageId,
                "address": datatoupdate.address,
                "serviceId": datatoupdate.serviceId,
                "endTime": datatoupdate.addSession[i].slotEndTime,
                "startTime": datatoupdate.addSession[i].slotStartTime,
                "duration": datatoupdate.addSession[i].duration,
                "slot": datatoupdate.addSession[i].slot,
                "typeOfTreatment": datatoupdate.typeOfTreatment,
                "latitude": datatoupdate.clientAddressLatitude,
                "longitude": datatoupdate.clientAddressLogitude,
                "bookedCount": 1
            }

            var saveAssignData = new AssignService(assign);
            let [err2, assignServiceData] = await handle(saveAssignData.save())
        }
    }
    else {
        console.log("clientData", clientData)
        for (var i = 0; i < datatoupdate.addSession.length; i++) {
            var assign = {

                "clientId": clientId,
                "clientName": datatoupdate.clientName,
                "staffId": datatoupdate.staffId,
                "phone": datatoupdate.phoneNumber,
                "date": new Date(datatoupdate.addSession[i].date),
                "status": 0,
                "packageId": datatoupdate.packageId,
                "address": datatoupdate.address,
                "serviceId": datatoupdate.serviceId,
                "endTime": datatoupdate.addSession[i].slotEndTime,
                "startTime": datatoupdate.addSession[i].slotStartTime,
                "duration": datatoupdate.addSession[i].duration,
                "slot": datatoupdate.addSession[i].slot,
                "typeOfTreatment": datatoupdate.typeOfTreatment,
                "latitude": datatoupdate.clientAddressLatitude,
                "longitude": datatoupdate.clientAddressLogitude,
                "bookedCount": 1
            }

            var saveAssignData = new AssignService(assign);
            let [err2, assignServiceData] = await handle(saveAssignData.save())
        }
    }

    return Promise.resolve(clientData);
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
    console.log("singleArray", singleArray)
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
    for (let i = 0; i < data.noOfSession; i++) {
        dateSlot.push(formattedDate(recurringdate[i].toString()))
    }
    console.log("dateSlot", dateSlot)
    var slotArr = [];
    for (var i = 0; i < dateSlot.length; i++) {
        let temp = {
            "staffId": data.staffId,
            "date": dateSlot[i],
            "slotId": data.slotId,
            "duration": data.duration,
            "typeOfTreatment": data.typeOfTreatment
        }
        console.log("temp", temp)
        let [err, assign] = await handle(AssignServiceAPI.getSlotsForAssignService(temp))
        console.log("assign", assign)
        var slotsData = {
            date: dateSlot[i],
            slots: assign
        }
        slotArr.push(slotsData)
    }
    if (lodash.isEmpty(slotArr)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(slotArr);
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
    // clientApi.clientDetails(req, 'DELETE SPOC');
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
    console.log(id)
    var packageIdValue = Math.floor((Math.random() * 100000000000) + 1);
    console.log(packageIdValue)
    let [err2, clientData] = await handle(Client.findOneAndUpdate({ _id: id, }, { $push: { 'packageId': packageIdValue } }, { new: true, useFindAndModify: false }).lean());
    console.log("clientData", clientData)

}
function slotCheck(start)
{
    var bHr = (start.split(':')[0]);
    var bMin = (start.split(':')[1]);
    var AST = Number(bHr + bMin);
    return AST
}
module.exports = {
    create: create,
    getClientDatabyId: getClientDatabyId,
    getAllClientDetails: getAllClientDetails,
    UpdateClient: UpdateClient,
    sendOTP: sendOTP,
    requestAdditionalService: requestAdditionalService,
    saveRecurringSession: saveRecurringSession,
    enableDisableClient: enableDisableClient,
    generatePackageId: generatePackageId
}