const component = "Auth API";
const async = require('async');
const StaffAPI = require('./staff.api');
const models = require('../models');
const Staff = models.Staff;
const LoginModel = models.Login;
const ERR = require('../errors.json');
const lodash = require('lodash');
const security = require('../util/security');
const uuid = require('../util/misc');
const crypto = require('crypto');
const html = require('../util/html');
const Email = require('../util/email');
const config = require('config');
const mongoose = require('mongoose');
const twilioConfig = require('../services/twilio/twilio');

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}
const log = require('../util/logger').log(component, __filename);

/* Login functionality */
async function login(loginCred, password, role) {
    log.debug(component, 'Inside Login Functionality', role);
    log.close();
    let data = {
        empId: loginCred,
        password: password,
        role: role
    }
    /* checking email availability */
    let [err, user] = await handle(StaffAPI.checkLoginAvailablity(data));
    return new Promise((resolve, reject) => {
        if (err) return reject(err);
        if (!lodash.isEmpty(user)) {
            if (!(user[0].password == security.hash(user[0].createdAt, password))) {
                return reject(ERR.INVALID_CREDENTIALS);
            }
            return resolve(user[0]);
        }
        else
            return reject(ERR.NO_RECORDS_FOUND);
    })
}

const checkPasswordDoctor = async (userId, password) => {
    log.debug(component, 'Inside Password checking functionality'); log.close();
    let query = [
        {
            $match: { '_id': mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: 'login',
                localField: '_id',
                foreignField: 'Staff',
                as: 'loginData'
            }
        }
    ];
    let [doctorErr, doctordata] = await handle(DoctorModel.aggregate(query));
    return new Promise((resolve, reject) => {
        if (doctorErr) return reject(doctorErr);
        else {
            if (doctordata[0].loginData[0].password == security.hash(doctordata[0].createdDate, password)) {
                return resolve(true);
            }
            else {
                return resolve(false);
            }
        }
    })
}

/* Change password - Requires Old password and new password */
async function changePassword(request) {
    log.debug(component, 'Change Password functionality');
    log.close();
    let oldPassword = request.body.oldPassword;
    let newPassword = request.body.newPassword;
    /* Getting user details */
    let [userError, userData] = await handle(LoginModel.findOne({ 'user': request.user.user }).lean());
    return new Promise((resolve, reject) => {
        if (userError) return reject(userError);
        else if (userData) {
            (async () => {
                if (userData.role == "PORTAL_STAFF") {
                    var [usererr, usrData] = await handle(Staff.findOne({ 'empId': userData['empId'] }))
                    if (usererr) return reject(usererr);
                    userData.user = usrData;
                }
                if (security.hash(userData.createdAt, oldPassword) == userData.password) {
                    userData.password = security.hash(userData.createdAt, newPassword);
                    let [err, updated] = await handle(LoginModel.findOneAndUpdate({ 'user': request.user.user }, userData, { new: true, useFindAndModify: false }));
                    if (err) return reject(err);
                    else {
                        var changePasswordData = {
                            password: updated.password,
                            role: updated.role,
                            createdAt: updated.createdAt,
                            phone: updated.phone,
                            email: updated.email,
                            empId: updated.empId
                        }
                        var changePassword = new LoginModel(changePasswordData);
                        let [newErr, valueData] = await handle(changePassword.save());
                        if (newErr) return Promise.reject(newErr);
                        const subject = "Change Password Success";
                        let userName = '';
                        userName = userData.user.staffName;
                        html.create({
                            data: {
                                userName: `${userName}`,
                                brandLogo: `${config.AWSCredentails.S3StorageLinkForimages}brand/brand-logo.png`,
                            },
                            templateName: "change_password_success"
                        }, (err, contents) => {
                            log.debug(component, 'Email content', { attach: contents });
                            if (err == null)
                                require('../util/email').send(userData.email, subject, contents, undefined, () => {
                                    return resolve(contents);
                                });
                            else {
                                return reject(err)
                            }
                        });
                    }
                }
                else {
                    log.error(component, 'Old Password is incorrect');
                    log.close();
                    return reject(ERR.INVALID_OLD_PASSWORD);
                }
            })();
        }
    })
}

/* Forgot Password - Requires email*/
async function forgotPassword(data) {
    const subject = "Password Reset";
    /* checking email availability */
    let [err, user] = await handle(StaffAPI.checkForExistingUserForSendingEmail(data));
    return new Promise((resolve, reject) => {
        if (err) return reject(err);
        if (lodash.isEmpty(user)) return reject(ERR.EMAIL_NOT_REGISTERED);
        /* saving profile data in separate key */
        let profileData = {};
        profileData._id = user[0].user;
        profileData.role = data.role;
        async.waterfall([
            function frameLink(cb) {
                crypto.randomBytes(128, (err, buf) => {
                    let token = buf.toString('hex');
                    cb(err, token);
                });
            },
            function updateUser(token, cb) {
                if (profileData) {
                    profileData.resetPasswordToken = token;
                    profileData.resetPasswordExpire = Date.now() + 3600000; //Hour
                }
                /* update user */
                StaffAPI.updateUserforForgotPassword(profileData).then(updatedProfile => {
                    cb(null, token, updatedProfile);
                }).catch(err => {
                    cb(err);
                })
            },
            function sendMail(token, updatedProfile, cb) {
                let userName = '';
                userName = updatedProfile.staffName;
                /* Creating HTML template */
                html.create({
                    data: {
                        userName: `${userName}`,
                        passwordResetLink: `${config.adminResetUrl}auth/reset-password/${token}`,
                        brandLogo: `${config.AWSCredentails.S3StorageLinkForimages}brand/brand-logo.png`,
                    },
                    templateName: "reset_password_link"
                }, (err, contents) => {
                    if (err == null)
                        require('../util/email').send(data.email, subject, contents, undefined, () => {
                            cb(null);
                        });
                    else {
                        cb(err);
                    }
                })
            }
        ], (err, result) => {
            if (err) {
                log.error(component, 'Sending Reset Password link error', { attach: err });
                log.close();
                return reject(err);
            }
            else {
                log.debug(component, 'Forgot Password Link Success');
                log.close();
                return resolve(result)
            }
        })
    })
}

/* Reset password functionality */
function resetPassword(data) {
    const subject = "Password Reset Successfull";
    return new Promise((resolve, reject) => {
        async.waterfall([
            function verifyToken(cb) {
                Staff.findOne({ "resetPasswordToken": data.resetPasswordToken }, (err, userData) => {
                    if (err) cb(err);
                    else if (lodash.isEmpty(userData))
                        cb(ERR.INVALID_RESET_TOKEN);
                    else {
                        cb(null, userData)
                    };
                })
            },
            function verifyTokenExpiryAndUpdatePassword(profileData, cb) {
                /* updating login schema with new password */
                profileData = profileData.toObject();
                let newpassword = security.hash(profileData.createdAt, data.password);
                (async () => {
                    let [err, updated] = await handle(LoginModel.findOneAndUpdate({ user: profileData._id }, { $set: { password: newpassword } }, { new: true, useFindAndModify: false }));
                    if (err) cb(err);
                    var resetPassword = {
                        password: updated.password,
                        role: updated.role,
                        createdAt: updated.createdAt,
                        phone: updated.phone,
                        email: updated.email,
                        empId: updated.empId
                    };
                    var resetPasswordData = new LoginModel(resetPassword);
                    let [newErr, valueData] = await handle(resetPasswordData.save());
                    if (newErr) return Promise.reject(newErr);
                    cb(null, profileData);
                })();
            },
            function updateProfileSchema(profileData, cb) {
                /* Resetting the reset password token */
                profileData.resetPasswordToken = null;
                profileData.resetPasswordExpire = null;
                StaffAPI.updateUserforForgotPassword(profileData).then(updatedProfile => {
                    cb(null, updatedProfile);
                }).catch(err => {
                    cb(err);
                })
            },
            function sendSuccessMail(userProfile, cb) {
                let userName = '';
                userName = userProfile.staffName;
                log.debug(component, 'Send Reset password successfull mail sent');
                log.close();
                /* Creating HTML template */
                html.create({
                    data: {
                        userName: `${userName}`,
                        brandLogo: `${config.AWSCredentails.S3StorageLinkForimages}brand/brand-logo.png`,
                    },
                    templateName: 'reset_password_success'
                }, (err, contents) => {
                    if (err) cb(err);
                    else
                        require('../util/email').send(userProfile.email, subject, contents, undefined, () => {
                            return cb(null);
                        });
                })
            }
        ], (err, result) => {
            if (err) {
                log.error(component, 'Error Resetting password', { attach: err });
                log.close();
                return reject(err);
            }
            else {
                log.debug(component, 'Reset Password Success');
                log.close();
                return resolve(result);
            }
        })
    })
}

/* For Doctors Login credetional Genrate Mail */
async function genaratePassword(data) {
    log.debug(component, 'Authentication Details for Telemedicine');
    log.close();
    const subject = "Telemedicine Login Credentials";
    return new Promise((resolve, reject) => {
        /* Creating HTML template */
        html.create({
            data: {
                name: `${data.name}`,
                email: `${data.email}`,
                brandLogo: `${config.AWSCredentails.S3StorageLinkForimages}brand/brand-logo.png`,
                password: `${data.password}`
            },
            templateName: 'genarate_password'
        }, (err, contents) => {
            if (err) return reject(err);
            else {
                require('../util/email').send(data.email, subject, contents, undefined, () => {
                    log.debug(component, 'Admin notification email successfull');
                    log.close()
                    return resolve(null);
                });
            }
        })
    })
}

/* For Reset password token verification Token */
async function verifyResetPasswordToken(data) {
    log.debug(component, 'Reset password token verification');
    log.close();
    return new Promise((resolve, reject) => {
        (async () => {
            let [err, user] = await handle(Staff.findOne({ resetPasswordToken: data.token }));
            if (err) return reject(err);
            if (user) {
                var TimeNow = Date.now();
                var TokenExpiryTime = new Date(user.resetPasswordExpire).getTime();
                if (TokenExpiryTime < TimeNow) {
                    log.info(component, 'user reset token has expired');
                    log.close();
                    return reject(ERR.RESET_TOKEN_EXPIRED);
                }
                else {
                    log.info(component, "user found with vaild token");
                    log.close();
                    return resolve(user);
                }
            }
        })();
    })
}



async function updatePhoneVerifiedStatus(data) {
    log.debug(component, 'updating PhoneNumber Verfied Status');
    log.close();
    return new Promise((resolve, reject) => {
        (async () => {
            let [err, doctorData] = await handle(DoctorModel.findOneAndUpdate({ 'email': data.email }, { $set: { "phoneNumberVerfied": true } }, { new: true, useFindAndModify: false }).lean());
            if (err) return reject(err);
            else resolve(doctorData);
        })();
    }).catch(err => {
        return Promise.reject(err);
    })
}

async function contactUs(contactData) {
    log.debug(component, 'Contact us functionality');
    log.close();

    return new Promise((resolve, reject) => {
        async.waterfall([
            function getAdminDetails(cb) {
                Staff.findOne({ role: 'PORTAL_ADMIN' }).then(userDetail => {
                    log.debug(component, 'Successfully Retrieved the admin details');
                    log.close();
                    resolve(userDetail);
                    cb(null, userDetail);
                }).catch(err => {
                    log.error(component, 'Error Retrieving the admin details');
                    log.close();
                    cb(err);
                })
            },
            function sendMail(adminData, cb) {

                const subject = "New Contact Request";
                html.create({
                    data: {
                        adminName: `${adminData.name}`,
                        contactPersonName: `${contactData.name}`,
                        Email: `${contactData.email}`,
                        Mobile: `${contactData.mobile}`,
                        Message: `${contactData.message}`,
                        brandLogo: `${config.AWSCredentails.S3StorageLinkForimages}brand/brand-logo.png`,
                    },
                    templateName: "contact_mail_admin"
                }, (err, contents) => {
                    log.debug(component, 'Email content', { attach: contents });
                    if (err == null)
                        require('../util/email').send(adminData.email, subject, contents, undefined, () => {
                            cb(null);
                        });
                    else {
                        cb(err);
                    }
                });
            }
        ], (error, result) => {
            if (error) {
                log.error(component, 'There was error sending mail to admin');
                log.close();
                reject(error);
            }
            else {
                log.debug(component, 'Admin contact mail was successfull');
                log.close();
            }
        })
    })
}

/* Forgot Username - Requires email*/
async function forgotUserName(datas) {
    log.debug(component, 'Group Class Invite Link');
    log.close();
    return new Promise((resolve, reject) => {
        async.waterfall([
            sendEmailforforgotUserName
        ], function (err, result) {
            if (err) return reject(err);
            return resolve(result);
        });
        function sendEmailforforgotUserName(cb) {
            (async () => {
                let [err, user] = await handle(StaffAPI.checkForExistingAlternateEmail(datas));
                if (err) return reject(err);
                if (lodash.isEmpty(user)) return reject(ERR.EMAIL_NOT_REGISTERED);
                if (user != 0) {
                    let userName = '';
                    userName = datas.role == 'PORTAL_USER' ? user[0].name : user[0].fullName;
                    let subject = 'Send Account Details By Email';
                    html.create({
                        data: {
                            brandLogo: `${config.AWSCredentails.S3StorageLinkForimages}brand/brand-logo.png`,
                            name: `${userName}`,
                            email: `${user[0].email}`,
                        },
                        templateName: 'user_details'
                    }, (err, contents) => {
                        if (err) return cb(err, null);
                        else {
                            Email.send(datas.email, subject, contents, undefined, () => {
                                log.debug(component, 'Group Class Invite Link Send Successfully');
                                log.close()
                                cb(null, datas);
                            });
                        }
                    });
                }
                else {
                    console.log("Mail not send");
                }
            })();
        }
    })
}

module.exports = {
    login: login,
    changePassword: changePassword,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    genaratePassword: genaratePassword,
    verifyResetPasswordToken: verifyResetPasswordToken,
    contactUs: contactUs,
    forgotUserName: forgotUserName
}