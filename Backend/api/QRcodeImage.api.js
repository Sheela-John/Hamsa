'use strict';
const component = "QRcodeImage API";
const models = require('../models');
const ModuleModel = require('../models').Module;
const LoginModel = require('../models').Login;
const QrCodeImageModel = require('../models').QRcodeImage;
const lodash = require('lodash');
const mongoose = require('mongoose');
const ERR = require('../errors.json');
const multer = require('multer')
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const config = require('config');
const awsConfig = require('../services/aws/aws');
const log = require('../util/logger').log(component, ___filename);
/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}
//to save a course
const s3 = new AWS.S3({
    accessKeyId: config.AWSCredentails.AWS_ACCESS_KEY,
    secretAccessKey: config.AWSCredentails.AWS_SECRET_ACCESS_KEY,
    region: config.AWSCredentails.REGION
});
function removeSecuredKeys(data) {
    delete data.resetPasswordExpire;
    delete data.resetPasswordToken;
    delete data.emailVerificationCode;
    delete data.emailCodeExpiry;
    delete data.s_customer_id;
    return data;
}
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.AWSCredentails.PRIVATE_BUCKET_NAME + '/' + config.AWSCredentails.SUB_FOLDER + '/QRcodeImage',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        contentType: function (req, file, cb) {
            cb(null, file.mimetype);
        },
        key: function (req, file, cb) {
            var documentID = Date.now();
            req.body.documentID = documentID;
            req.body.mimetype = file.originalname.split('.').pop();
            cb(null, documentID + "." + req.body.mimetype)
        },
        acl: 'private'
    }),
    fileFilter: function fileFilter(req, file, cb) {
        if (!(['png', 'jpeg', 'jpg'].includes(file.originalname.split('.').pop().toLowerCase()))) {
            cb({ "message": "Invalid File Format - Supported Formats: 'png', 'jpeg','.jpg" }, false);
        } else {
            cb(null, true);
        }
    }
}
).single('image');

//Upload the image 
async function uploadQRcodeImageData(req, res, cb) {
    //clientApi.clientDetails(req, 'UPLOAD PDF TO AWS');
    log.debug(component, ' Upload data to aws'); log.close();
    upload(req, res, async function (err) {
        var data = req.body;
        let obj = JSON.parse(JSON.stringify(data));
        if (err) {
            return cb(err, null);
        }
        else {
            if (!req.file) {
                return cb("Please send file", null);
            }
            else {
                obj.image = "/QRcodeImage/" + obj.documentID + '.' + obj.mimetype;
                obj.imageFileName = data.imageFileName;
                obj.documentID = data.documentID;
                var saveData = new QrCodeImageModel(obj);

                saveData.save().then(user => {
                    log.debug(component, 'Saved File Url in QRCodeImage DB');
                    log.close();
                    return cb(null, removeSecuredKeys(user));
                })
                    .catch(err => {

                        log.error(component, 'Saved File Url in QRCodeImage  DB', { attach: err });
                        log.close();
                        const myKey = config.AWSCredentails.SUB_FOLDER + obj.image;
                        obj.key = myKey;
                        (async () => {
                            let [deleteDocumentErr, deleteDocumentResponse] = await handle(awsConfig.deleteObject(obj));
                            if (deleteDocumentErr) {
                                return reject(deleteDocumentErr);
                            }
                        })();
                        return cb(err);
                    })
            }
        }
    })
}

//Get image
async function getImagePresignedUrl(data) {
    log.debug(component, 'Retreiving document for user');
    console.log("data", data)
    log.close();
    var query = [

        {
            $match: {
                "documentID": data.documentID
            }
        },
        {
            $project: {
                _id: 0,
            }
        }
    ]
    let [err, documentData] = await handle(QrCodeImageModel.aggregate(query));
    console.log("documentData", documentData)
    return new Promise((resolve, reject) => {
        if (err) return reject(err);
        if (lodash.isEmpty(documentData)) return reject(ERR.NO_RECORDS_FOUND);
        else {
            log.debug(component, 'Document Fetched and ready to Fetch Presigned Url');
            log.close();
            const url = s3.getSignedUrl('getObject', {
                Bucket: config.AWSCredentails.PRIVATE_BUCKET_NAME,
                Key: config.AWSCredentails.SUB_FOLDER + documentData[0].image,
                Expires: config.AWSCredentails.SIGNED_URL_EXPIRY
            })
            console.log("url", url)
            return resolve(url)
        }
    })
}

module.exports = {

    uploadQRcodeImageData: uploadQRcodeImageData,
    getImagePresignedUrl: getImagePresignedUrl

}