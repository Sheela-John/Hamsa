'use strict'
const component = "Client API";
const models = require('../models');
const Security = require("../util/security");
const Staff = models.Staff;
const AssignServiceForClient = models.AssignServiceForClient;
const AssignServiceForBranch = models.AssignServiceForBranch;
const Client = models.Client;
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
                // loginClient
                // sendEmail,
            ], function (err, result) {
                if (err) return reject(err);
                return resolve(result);
            });
            function saveClient(cb) {
                (async () => {
                    clientData.role = "PORTAL_CLIENT";
                    var saveModel = new Client(clientData);
                    let [err, client] = await handle(saveModel.save())
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
                    clientDataModel['phone'] = clientDatafromFunction.phone;
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
                $and: [{
                    $or: [
                        { 'ipNumber': loginCred.ipNumber }]
                    // { 'phone': loginCred.phone }]
                }]
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
    if (clientErr) return Promise.reject(clientErr);
    if (lodash.isEmpty(clientData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(clientData);
}

/* Get All Client Detail */
async function getAllClientDetails() {
    log.debug(component, 'Get All Client Detail'); log.close();
    let [err, clientData] = await handle(Client.find({}).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(clientData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(clientData);
}

/* To Update Client - API */
const UpdateClient = async function (datatoupdate) {
    log.debug(component, 'Updating a Client', { 'attach': datatoupdate }); log.close();
    let clientId = datatoupdate._id;
    delete datatoupdate._id
    let [err, clientData] = await handle(Client.findOneAndUpdate({ "_id": clientId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (err) return Promise.reject(err);
    else return Promise.resolve(clientData);
}

module.exports = {
    create: create,
    getClientDatabyId: getClientDatabyId,
    getAllClientDetails: getAllClientDetails,
    UpdateClient: UpdateClient
}