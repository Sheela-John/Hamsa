'use strict'
const component = "Staff API";
const models = require('../models');
const Security = require("../util/security");
const Staff = models.Staff;
const Branch=models.Branch;
const Role=models.Role;
const Login = models.Login;
const LeaveRequest = models.LeaveRequest;
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
            [
                {
                    $match: {'empId': loginCred.empId
                       // $and: [{ 'empId': loginCred.empId },
                        //{ 'role': loginCred.role }]

                    }
                }
            ]
    }
    else {
        query =
            [
                {
                    $match: {'empId': loginCred.empId
                        // $and: [{ 'empId': loginCred.empId },
                        // { 'role': loginCred.role }]

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
    let [err, staffData] = await handle(Staff.find().lean());
    console.log(staffData)
    for(var i=0;i<staffData.length;i++)
    {
        let [err, branchData] = await handle(Branch.findOne({_id:staffData[i].branchId}).lean());
        let [err1, roleData] = await handle(Role.findOne({_id:staffData[i].staffRole}).lean());
        staffData[i].branchId=branchData.branchName;
        staffData[i].staffRole=roleData.name;
    }
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

async function checkForExistingUserForSendingEmail(loginCred) {
    let query =
        [{
            $match: {
                $and: [{
                    $or: [
                        { 'email': loginCred.email },
                    ]
                }]
            }
        }]
    return new Promise((resolve, reject) => {
        Login.aggregate(query).collation({ locale: "en", strength: 2 }).exec((err, user) => {
            if (err) {
                log.error(component, { attach: err });
                log.close();
                return reject(err);
            }
            if (user.length > 0) {
                return resolve(user);
            }
            return resolve([]);
        })
    })
}

async function updateUserforForgotPassword(userData) {
    log.debug(component, 'updating user');
    log.close();
    return new Promise((resolve, reject) => {
        /*   Deleting Email before update as there is possibility for new email*/
        delete userData.email;
        delete userData.role;
        delete userData.phone;
        Staff.findOneAndUpdate({ '_id': userData._id }, userData, { new: true, useFindAndModify: false }).lean().then(updatedUser => {
            return resolve(removeSecuredKeys(updatedUser));
        }).catch(err => {
            log.error(component, { attach: err });
            log.close();
            return reject(err);
        })
    })
}

function removeSecuredKeys(data) {
    delete data.resetPasswordExpire;
    delete data.resetPasswordToken;
    delete data.emailVerificationCode;
    delete data.emailCodeExpiry;
    delete data.s_customer_id;
    return data;
}

/* Create Admin */
async function createAdmin(adminData) {
    log.debug(component, 'Creating Admin functionality1', adminData);
    log.close();
    if (adminData.gender) {
        adminData.defaultImageUrl = genrateDefaultImage(adminData.gender);
    }

    if (adminData.dob) {
        adminData.dob = new Date(adminData.dob);
        let copiedDate = new Date(adminData.dob.getTime());
        adminData['dob'] = copiedDate;
    }
    let [adminErr, admin] = await handle(checkForExistingUser(adminData));
    if (adminErr) return Promise.reject(adminErr);
    if (!(lodash.isEmpty(admin))) return Promise.reject(ERR.DUPLICATE_RECORD);
    return new Promise((resolve, reject) => {
        if (!lodash.isEmpty(admin)) {
            return reject(ERR.ACCOUNT_ALREADY_REGISTERED);
        }
        else {
            async.waterfall([
                saveAdmin,
                createLoginCredentials
            ], function (err, result) {
                if (err) return reject(err);
                return resolve(result);
            });
            function saveAdmin(cb) {
                (async () => {
                    adminData.role = "PORTAL_ADMIN";
                    var saveModel = new Staff(adminData);
                    let [err, adminSave] = await handle(saveModel.save())
                    if (err) cb(err, null);
                    else {
                        adminSave.password = adminData.password;
                        adminSave.savepassword = adminData.password;
                        cb(null, adminSave);
                    }
                })();
            }
            function createLoginCredentials(adminDatafromFunction, cb) {
                log.debug(component, 'Inside Create Login Functionality', { attach: adminDatafromFunction });
                (async () => {
                    let staffDataModel = {};
                    staffDataModel['empId'] = adminDatafromFunction.empId;
                    staffDataModel['email'] = adminDatafromFunction.email;
                    staffDataModel['role'] = "PORTAL_ADMIN";
                    staffDataModel['staffRole'] = adminDatafromFunction.staffRole;
                    staffDataModel['password'] = Security.hash(adminDatafromFunction.createdAt, adminDatafromFunction.password);
                    staffDataModel['phone'] = adminDatafromFunction.phone;
                    staffDataModel['user'] = adminDatafromFunction._id;
                    staffDataModel['createdAt'] = adminDatafromFunction.createdAt;
                    const loginModel = new Login(staffDataModel);
                    let [loginerr, loginData] = await handle(loginModel.save());
                    if (loginerr) cb(loginerr, null);
                    else {
                        cb(null, adminDatafromFunction);
                    }
                })();
            }
        }
    })
}

/* Get All Admin Detail */
async function findAllAdmin() {
    log.debug(component, 'Get All Admin Detail'); log.close();
    let [err, adminData] = await handle(Staff.find({ "role": "PORTAL_ADMIN" }).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(adminData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(adminData);
}

/* Get Admin By Id */
async function findAdminById(adminId) {
    log.debug(component, 'Get Admin By Id'); log.close();
    let [err, adminData] = await handle(Staff.findOne({ "_id": adminId }).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(adminData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(adminData);
}

const find = {
    profile: function (userData) {
        return new Promise((resolve, reject) => {
            if (userData.role == 'PORTAL_STAFF') {
                Staff.findOne({ '_id': userData.id }).lean().exec((err, user) => {
                    if (err) {
                        log.error(component, { attach: err });
                        log.close();
                        return reject(err);
                    }
                    else if (!lodash.isEmpty(user)) {
                        /* Deleting location Key if it is empty */
                        return resolve(removeSecuredKeys(user));
                    }
                    else return reject(ERR.NO_SUCH_ID)
                })
            }
        })
    }
}

const leaveRequest = async function (data) {
    log.debug(component, 'Creating Leave Request From Staff', data);
    log.close();

    let [findStaffErr, staffNameData] = await handle(Staff.findOne({ '_id': mongoose.Types.ObjectId(data.staffId) }));
    if (findStaffErr) return Promise.reject(findStaffErr);

    data.startDate = new Date(data.startDate);
    let someDate = data.startDate
    let copiedAppointmentDate = new Date(someDate.getTime());
    data['startDate'] = copiedAppointmentDate;

    data.endDate = new Date(data.endDate);
    let someDate1 = data.endDate
    let copiedAppointmentDate1 = new Date(someDate1.getTime());
    data['endDate'] = copiedAppointmentDate1;

    data['staffName'] = staffNameData.staffName;
    var saveModel = new LeaveRequest(data);
    let [err, leaveRequestData] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(leaveRequestData)
}

const getAllLeaveRequest = async function () {
    log.debug(component, 'Get All Staff Leave Requests'); log.close();
    let [err, leaveData] = await handle(LeaveRequest.find({}).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(leaveData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(leaveData);
}

const getLeaveRequestById = async function (leaveId) {
    log.debug(component, 'Get Staff Leave Requests By Id'); log.close();
    let [err, leaveData] = await handle(LeaveRequest.findOne({ '_id': leaveId }).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(leaveData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(leaveData);
}

const getLeaveRequestByStatus = async function (data) {
    log.debug(component, 'Get Staff Leave Requests By Status'); log.close();
    let [err, leaveData] = await handle(LeaveRequest.find({ 'leaveStatus': data.leaveStatus }).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(leaveData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(leaveData);
}

const searchLeaveRequestByStaff = (data) => {
    log.debug(component, 'Search Leave Requests in dropdown/typeahead');
    log.close();
    var query = [
        {
            $match: {
                $or: [
                    { "staffName": new RegExp(data.searchString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi') },
                    { "staffName": new RegExp(data.searchString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi') }
                ]
            }
        }
    ];
    return new Promise((resolve, reject) => {
        LeaveRequest.aggregate(query)
            .then(fetchedDocuments => {
                log.debug(component, 'Search Leave Requests data');
                log.close();
                return resolve(fetchedDocuments);
            }).catch(err => {
                log.error(component, 'error Search the Leave Requests data');
                log.close();
                return reject(err);
            })
    })
}

const getLeaveRequestByStaffId = async function (staffId) {
    log.debug(component, 'Get Leave Requests by Staff Id');
    log.close();
    let [err, leaveData] = await handle(LeaveRequest.find({ 'staffId': staffId }).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(leaveData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(leaveData);
}

module.exports = {
    create: create,
    UpdateStaff: UpdateStaff,
    getStaffDataById: getStaffDataById,
    getAllStaffDetails: getAllStaffDetails,
    enableDisableStaff: enableDisableStaff,
    checkLoginAvailablity: checkLoginAvailablity,
    checkForExistingUserForSendingEmail: checkForExistingUserForSendingEmail,
    updateUserforForgotPassword: updateUserforForgotPassword,
    createAdmin: createAdmin,
    findAllAdmin: findAllAdmin,
    findAdminById: findAdminById,
    find: find,
    leaveRequest: leaveRequest,
    getAllLeaveRequest: getAllLeaveRequest,
    getLeaveRequestById: getLeaveRequestById,
    getLeaveRequestByStatus: getLeaveRequestByStatus,
    searchLeaveRequestByStaff: searchLeaveRequestByStaff,
    getLeaveRequestByStaffId: getLeaveRequestByStaffId
}