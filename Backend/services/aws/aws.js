const aws = require('aws-sdk');
const component = 'AWS Configuration';
const config = require('config');
const log = require('../../util/logger').log(component, ___filename);

aws.config.update({
    accessKeyId: config.AWSCredentails.AWS_ACCESS_KEY,
    secretAccessKey: config.AWSCredentails.AWS_SECRET_ACCESS_KEY,
    region: config.AWSCredentails.REGION
});

var s3 = new aws.S3();

//Upload Object to s3
function putObject(data, bucket, key) {
    log.debug(component, 'Uploading Data into aws');
    let contentType = 'application/pdf';
    return new Promise ((resolve, reject) =>{
        s3.putObject({
            Bucket: bucket,
            Body: data,
            Key: key,
            ACL: 'private',
            ContentType: contentType
        }, function(err, data){
            if(err) return reject(err)
            else return resolve(data)
        })
    })
}

//Delete Object from s3
function deleteObject(data ,cb){
    log.debug(component, 'Deleting data from aws');
    return new Promise ((resolve, reject) =>{
        s3.deleteObject({
            Bucket: config.AWSCredentails.PRIVATE_BUCKET_NAME,
            Key: data.key,
        }, function(err, data){
            if(err) return reject(err)
            else{
                log.debug(component, 'Data deleted from aws', { attach: data });
                log.close();
                return resolve(data)
            }
        })
    })
    
}

function deleteVideo(data){
    log.debug(component, 'Deleting data from aws : '+config.AWSCredentails.PUBLIC_BUCKET_NAME+" data.key : "+data.key);
    return new Promise ((resolve, reject) =>{
        s3.deleteObject({
            Bucket: config.AWSCredentails.PUBLIC_BUCKET_NAME,
            Key: data.key,
        }, function(err, data){
            if(err) return reject(err)
            else{
                log.debug(component, 'Data deleted from aws', { attach: data });
                log.close();
                return resolve(data)
            }
        })
    })
}

module.exports = {
    deleteObject: deleteObject,
    deleteVideo:deleteVideo,
    putObject: putObject
}