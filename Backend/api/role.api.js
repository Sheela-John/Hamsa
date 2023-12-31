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
    var rolename = [];
    let [err, rolevalue] = await handle(Role.find({}))
    for (var i = 0; i < rolevalue.length; i++) {
        rolename.push(rolevalue[i].name.toUpperCase());
    }
    if (rolename.includes(roleData.name.toUpperCase())) {
        return Promise.reject(ERR.ROLE_EXISTS)
    }
    else {
        var saveModel = new Role(roleData);
        let [err, roleDataSaved] = await handle(saveModel.save())
        if (err) return Promise.reject(err);
        else return Promise.resolve(roleDataSaved)
    }
}

/* To Update Role - API */
const UpdateRole = async function (datatoupdate) {
    log.debug(component, 'Updating a Role', { 'attach': datatoupdate });
    log.close();
    var rolename = [];
    let [err, rolevalue] = await handle(Role.find({ '_id': {'$ne':datatoupdate._id}}))
    for (var i = 0; i < rolevalue.length; i++) {
        rolename.push(rolevalue[i].name.toUpperCase());
    }
    if (rolename.includes(datatoupdate.name.toUpperCase())) {
        return Promise.reject(ERR.ROLE_EXISTS)
    }
    else {
        var slotArray = datatoupdate.slots;
        for (var i = 0; i < slotArray.length; i++) {
            if (slotArray[i].slotId) {
                let [error, updatedRole] = await handle(Role.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(datatoupdate._id), "slots._id": mongoose.Types.ObjectId(slotArray[i].slotId) },
                    {
                        '$set': {
                            '_id' : datatoupdate._id,
                            'name' : datatoupdate.name,
                            'slots.$.slotName': slotArray[i].slotName,
                            'slots.$.startTime': slotArray[i].startTime,
                            'slots.$.endTime': slotArray[i].endTime,
                            'slots.$.isDeleted': slotArray[i].isDeleted
                        }
                    },
                    { new: true, useFindAndModify: false }));
                if (error) return Promise.reject(error);
            }
            else if (!slotArray[i].slotId) {
                let [error, slots] = await handle(Role.findOneAndUpdate({ "_id": datatoupdate._id }, { $push: { 'slots': slotArray[i] } }, { new: true, useFindAndModify: false }));
                if (error) return Promise.reject(error);
                return Promise.resolve(slots)

            }
        }
    }
}

/* Get Role by Id */
async function getRoleDataById(roleId) {
    log.debug(component, 'Getting Role Data by Id');
    log.close();
    let [roleErr, roleData] = await handle(Role.findOne({ '_id': roleId }).lean());
    if (roleErr) return Promise.reject(roleErr);
    var temp = [];
    var temperory = [];
    var slotValue = [];
    var slots = [];
    var arrayslot = roleData.slots;
    for (var j = 0; j < arrayslot.length; j++) {
        if (arrayslot[j].isDeleted == 0) {
            temp.push(arrayslot[j])
            temperory.push(arrayslot[j])
        }
        var rolevalue = {
            _id: roleData._id,
            name: roleData.name,
            slots: temperory
        }
    }
    if (lodash.isEmpty(roleData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(rolevalue);
}

/* Get All Role Details */
async function getAllRoleDetails() {
    log.debug(component, 'Get All Role Detail'); log.close();
    let [err, roleData] = await handle(Role.find({}).lean());
    if (err) return Promise.reject(err);
    var temp = [];
    var temperory = [];
    var slotValue = [];
    var slots = [];
    for (var i = 0; i < roleData.length; i++) {
        for (var j = 0; j < roleData[i].slots.length; j++) {
            if (roleData[i].slots[j].isDeleted == 0) {
                temp.push(roleData[i].slots[j])
                temperory.push(roleData[i].slots[j])
            }
            var rolevalue = {
                _id: roleData[i]._id,
                name: roleData[i].name,
                slots: temperory
            }
        }
        temperory = [];
        slotValue.push(rolevalue)
    }

    if (lodash.isEmpty(roleData)) return Promise.reject(ERR.NO_RECORDS_FOUND);
    return Promise.resolve(slotValue);
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

async function deleteSlot(data) {
    log.debug(component, 'delete slot');
    log.close();
    let [err, roleData] = await handle(Role.findOne({ "_id": data.id }));
    if (err) return Promise.reject(err);
    for (var i = 0; i < roleData.slots.length; i++) {
        if (roleData.slots[i].id == data.slotId) {
            let [error, slotData] = await handle(Role.findOneAndUpdate({ "_id": data.id, "slots": { "$elemMatch": { "_id": (data.slotId) } } }, { $set: { 'slots.$.isDeleted': 1 } }, { new: true, useFindAndModify: false }).lean());
            if (error) return Promise.reject(error);
            return Promise.resolve(slotData);
        }
    }
}

module.exports = {
    create: create,
    UpdateRole: UpdateRole,
    getRoleDataById: getRoleDataById,
    getAllRoleDetails: getAllRoleDetails,
    enableDisableRole: enableDisableRole,
    deleteSlot: deleteSlot
}