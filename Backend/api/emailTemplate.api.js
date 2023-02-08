'use strict'
const component = 'EmailTemplate API';
const model = require('../models');
const lodash = require('lodash');
const EmailTemplateModal = model.EmailTemplate;
const ERR = require('../errors.json');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

const log = require('../util/logger').log(component, ___filename);

async function getAllEmailTemplates() {
    log.debug(component, 'get All Email Templete');
    log.close();
    return new Promise((resolve, reject) => {
        EmailTemplateModal.find({}).lean().then(templateData => {
            log.debug(component, 'successfully retrived Templetes');
            log.close();
            return resolve(templateData);
        }).catch(err => {
            log.error(component, 'error in retriving templetes', { attach: err });
            log.close();
            return reject(err);
        })
    })
}

const updateEmailTemplate = async (data) => {
    log.debug(component, 'updating Email Templete');
    log.close();
    return new Promise((resolve, reject) => {
        EmailTemplateModal.findOneAndUpdate({ _id: ObjectId(data._id) }, data, { new: true, useFindAndModify: false }).lean().then(updatedTemplate => {
            log.debug(component, 'successfully updated Templete');
            log.close();
            return resolve(updatedTemplate);
        }).catch(err => {
            log.error(component, 'error in updating templete', { attach: err });
            log.close();
            return reject(err);
        })
    })
}

const find = {
    by: {
        identifier: async (identifier) => {
            log.debug(component, 'Getting Email Templete by indentifier');
            log.close();
            let [err, TemplateData] = await handle(EmailTemplateModal.findOne({ 'identifier': identifier }).lean());
            return new Promise((resolve, reject) => {
                if (err) return reject(err);
                else return resolve(TemplateData);
            })
        }
    }
}

module.exports = {
    getAllEmailTemplates: getAllEmailTemplates,
    updateEmailTemplate: updateEmailTemplate,
    find: find
}