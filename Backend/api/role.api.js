'use strict'
const component = "Role API";
const models = require('../models');
const Security = require("../util/security");
const Role = models.Role;
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

/* Create Role */
async function create(roleData) {
    log.debug(component, 'Creating a Role', { 'attach': roleData }); log.close();
    var saveModel = new Role(roleData);
    let [err, roleDataSaved] = await handle(saveModel.save())
    if (err) return Promise.reject(err);
    else return Promise.resolve(roleDataSaved)
}

/* To Update Role - API */
const UpdateRole = async function (datatoupdate) {
    log.debug(component, 'Updating a Role', { 'attach': datatoupdate }); log.close();
    let roleId = datatoupdate._id;
    delete datatoupdate._id
    let [roleErr, roleData] = await handle(Role.findOneAndUpdate({ "_id": roleId }, datatoupdate, { new: true, useFindAndModify: false }))
    if (roleErr) return Promise.reject(roleErr);
    else return Promise.resolve(roleData);
}

/* Get Role by Id */
async function getRoleDataById(roleId) {
    log.debug(component, 'Getting Role Data by Id');
    log.close();
    let [roleErr, roleData] = await handle(Role.findOne({ '_id': roleId }).lean());
    if (roleErr) return Promise.reject(roleErr);
    if (lodash.isEmpty(roleData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(roleData);
}

/* Get All Role Detail */
async function getAllRoleDetails() {
    log.debug(component, 'Get All Role Detail'); log.close();
    let [err, roleData] = await handle(Role.find({}).lean());
    if (err) return Promise.reject(err);
    if (lodash.isEmpty(roleData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(roleData);
}

/* Enable / Disable Role By Role Id */
const enableDisableRole = async (roleId) => {
    log.debug(component, 'Enable and Disable functionality');
    log.close();
    let [enableDisableErr, enableDisableData] = await handle(Role.findOne({ "_id": roleId }));
    if (enableDisableErr) return Promise.reject(enableDisableErr);
    if (enableDisableData.status == 0) var query = { "$set": { "status": 2 } }
    else var query = { "$set": { "status": 0 } }
    let [err, enableDisableValue] = await handle(Role.findOneAndUpdate({ "_id": roleId }, query, { new: true, useFindAndModify: false }))
    if (err) return Promise.reject(err);
    else return Promise.resolve(enableDisableValue);
}

module.exports = {
    create: create,
    UpdateRole: UpdateRole,
    getRoleDataById: getRoleDataById,
    getAllRoleDetails: getAllRoleDetails,
    enableDisableRole: enableDisableRole
}