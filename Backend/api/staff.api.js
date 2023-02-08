'use strict'
const component = "Staff API";
const models = require('../models');
const Security = require("../util/security");
const Staff = models.Staff;
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
const generateRandomPassword = require('../util/generateCode').randomString;
const genrateDefaultImage = require('../util/generateCode').genrateDefaultImage;


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

/* Create staff */
async function create(staffData) {
    log.debug(component, 'Creating staff functionality1', staffData);
    log.close();
    if (staffData.gender) {
        staffData.defaultImageUrl = genrateDefaultImage(staffData.gender);
    }

    if (staffData.dob) {
        staffData.dob = new Date(staffData.dob);
        let copiedDate = new Date(staffData.dob.getTime());
        staffData['dob'] = copiedDate;
    }
    let [staffErr, staff] = await handle(checkForExistingUser(staffData));
    if (staffErr) return Promise.reject(staffErr);
    if (!(lodash.isEmpty(staff))) return Promise.reject(ERR.DUPLICATE_RECORD);
    return new Promise((resolve, reject) => {
        if (staffErr) return reject(staffErr);
        if (!lodash.isEmpty(staff)) {
            return reject(ERR.ACCOUNT_ALREADY_REGISTERED);
        }
        else {
            async.waterfall([
                saveStaff,
                createLoginCredentials,
                loginStaff
                // sendEmail,
            ], function (err, result) {
                if (err) return reject(err);
                return resolve(result);
            });
            function saveStaff(cb) {
                (async () => {
                    staffData.role = "PORTAL_STAFF";
                    var saveModel = new Staff(staffData);
                    let [err, staff] = await handle(saveModel.save())
                    if (err) cb(err, null);
                    else {
                        staff.password = staffData.password;
                        staff.savepassword = staffData.password;
                        cb(null, staff);
                    }
                })();
            }
            function createLoginCredentials(staffDatafromFunction, cb) {
                log.debug(component, 'Inside Create Login Functionality', { attach: staffDatafromFunction });
                (async () => {
                    let staffDataModel = {};
                    staffDataModel['empId'] = staffDatafromFunction.empId;
                    staffDataModel['email'] = staffDatafromFunction.email;
                    staffDataModel['role'] = "PORTAL_STAFF";
                    staffDataModel['staffRole'] = staffDatafromFunction.staffRole;
                    staffDataModel['password'] = Security.hash(staffDatafromFunction.createdAt, staffDatafromFunction.password);
                    staffDataModel['phone'] = staffDatafromFunction.phone;
                    staffDataModel['user'] = staffDatafromFunction._id;
                    staffDataModel['createdAt'] = staffDatafromFunction.createdAt;
                    const loginModel = new Login(staffDataModel);
                    let [loginerr, loginData] = await handle(loginModel.save());
                    if (loginerr) cb(loginerr, null);
                    else {
                        cb(null, staffDatafromFunction);
                    }
                })();
            }
            function loginStaff(staffData, cb) {
                (async () => {
                    let [err, loginStaff] = await handle(userLogin(staffData.empId, staffData.savepassword, 'PORTAL_STAFF'));
                    if (err) cb(err, null);
                    else {
                        cb(null, staffData);
                    }
                })();
            }
            // function sendEmail(staff, cb) {
            //     if ((staffData.email != '') && (staffData.email != undefined)) {
            //         let subject = 'Verification Code';
            //         var codeNew = generateCode.randomString(4, 'a#');
            //         html.create({
            //             data: {
            //                 brandLogo: `${config.AWSCredentails.S3StorageLinkForimages}brand/brand-logo.png`,
            //                 name: `${staff.email}`,
            //                 password: `${staff.password}`
            //             },
            //             templateName: 'verification_code'
            //         }, (err, contents) => {
            //             if (err) cb(err, null);
            //             else {
            //                 Email.send(staff.email, subject, contents, undefined, () => {
            //                     log.debug(component, 'Verification Code email successfull');
            //                     log.close()
            //                     delete staff.password;
            //                     cb(null, staff);
            //                 });
            //             }
            //         });
            //     }
            //     else {
            //         cb(null, staff);
            //     }
            // }
        }
    })
}

async function checkForExistingUser(loginCred) {
    let query =
        [{
            $match: {
                $and: [{
                    $or: [
                        { 'empId': loginCred.empId }]
                    // { 'phone': loginCred.phone }]
                }]
            }
        }]
    return new Promise((resolve, reject) => {
        Login.aggregate(query).collation({ locale: "en", strength: 2 }).exec((err, staff) => {
            if (err) {
                log.error(component, { attach: err });
                log.close();
                return reject(err);
            }
            if (staff.length > 0) {
                return resolve(staff);

            }
            return resolve([]);
        })
    })
}

/* Login functionality */
async function userLogin(loginCred, password, role) {
    log.debug(component, 'Inside Login Functionality', role);
    log.close();
    let data = {
        empId: loginCred,
        password: password,
        role: role
    }
    /* checking email availability */
    let [err, staff] = await handle(checkLoginAvailablity(data));
    return new Promise((resolve, reject) => {
        if (err) return reject(err);
        if (!lodash.isEmpty(staff)) {
            if (!(staff[0].password == security.hash(staff[0].createdAt, password))) {
                return reject(ERR.INVALID_CREDENTIALS);
            }
            return resolve(staff[0]);
        }
        else
            return reject(ERR.NO_RECORDS_FOUND);
    })
}

async function checkLoginAvailablity(loginCred) {
    let query = [];
    if (loginCred.role == 'PORTAL_ADMIN') {
        query =
            [{
                $match: {
                    $and: [{
                        $or: [
                            { 'email': loginCred.email },
                            { 'phoneNumber': loginCred.phone }]
                    }, {
                        $or: [
                            { 'role': 'PORTAL_ADMIN' }]
                    }]
                }
            }

            ]
    }
    else {
        query =
            [
                {
                    $match: {
                        $and: [{ 'empId': loginCred.empId },
                        { 'role': loginCred.role }]

                    }
                }
            ]
    }
    return new Promise((resolve, reject) => {
        Login.aggregate(query).collation({ locale: "en", strength: 2 }).exec((err, staff) => {
            if (err) {
                log.error(component, { attach: err });
                log.close();
                return reject(err);
            }

            if (staff.length > 0) {
                return resolve(staff);

            }
            else return resolve([]);
        })
    })
}

/* To Update Staff - API */
const UpdateStaff = async function (datatoupdate) {
    log.debug(component, 'Updating a Staff', { 'attach': datatoupdate }); log.close();
    let staffId = datatoupdate._id;
    if (datatoupdate.gender) {
        datatoupdate.defaultImageUrl = genrateDefaultImage(datatoupdate.gender);
    }
    // if (datatoupdate.userProfileImage != undefined && datatoupdate.userProfileImage != "") {
    //     if (datatoupdate.userProfileImage.match(/^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i)) {
    //         var [err, profileImageData] = await handle(profileImageStore(datatoupdate));
    //         if (profileImageData != undefined) datatoupdate.userProfileImage = profileImageData.userProfileImage;
    //     } else {
    //         delete datatoupdate.userProfileImage;
    //     }
    // }
    delete datatoupdate._id
    let [staffErr, staffData] = await handle(Staff.findOneAndUpdate({ "_id": staffId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (staffErr) return Promise.reject(staffErr);
    var updateData = {
        phone: staffData.phone,
        email: staffData.email,
        empId: staffData.empId
    }
    let [loginErr, loginData] = await handle(Login.findOneAndUpdate({ "user": staffId }, updateData, { new: true, useFindAndModify: false }))
    if (loginErr) return Promise.reject(loginErr);
    else return Promise.resolve(staffData);
}

/* Get Staff by Id */
async function getStaffDataById(staffId) {
    log.debug(component, 'Getting Staff Data by Id');
    log.close();
    let [staffErr, staffData] = await handle(Staff.findOne({ '_id': staffId }).lean());
    if (staffErr) return Promise.reject(staffErr);
    if (lodash.isEmpty(staffData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(staffData);
}

/* Get All Staff Detail */
async function getAllStaffDetails() {
    log.debug(component, 'Get All Staff Detail'); log.close();
    let [err, staffData] = await handle(Staff.find({ "role": "PORTAL_STAFF" }).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(staffData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(staffData);
}

/* Enable / Disable Staff By Staff Id */
const enableDisableStaff = async (contactId) => {
    log.debug(component, 'Enable and Disable functionality');
    log.close();
    let [enableDisableErr, enableDisableData] = await handle(Staff.findOne({ "_id": contactId }));
    if (enableDisableErr) return Promise.reject(enableDisableErr);
    if (enableDisableData.status == 0) var query = { "$set": { "status": 2 } }
    else var query = { "$set": { "status": 0 } }
    let [err, enableDisableValue] = await handle(Staff.findOneAndUpdate({ "_id": contactId }, query, { new: true, useFindAndModify: false }))
    if (err) return Promise.reject(err);
    else return Promise.resolve(enableDisableValue);
}

module.exports = {
    create: create,
    UpdateStaff: UpdateStaff,
    getStaffDataById: getStaffDataById,
    getAllStaffDetails: getAllStaffDetails,
    enableDisableStaff: enableDisableStaff
}