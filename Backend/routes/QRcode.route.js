const COMPONENT = "QRCodeImage ROUTER";

const router = require('express').Router();
const lodash = require('lodash');
const QRcodeImageAPI = require('../api/QRcodeImage.api');
const ERR = require('../errors.json');
const authenticate = require('../middleware/OAuth-Authentication');
/* For error handling in async await function */
const log = require('../util/logger').log(COMPONENT, __filename);
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

router.post('/uploadQRcodeImageData', async (req, res, next) => {
    log.debug(COMPONENT, 'uploading Image'); log.close();
    QRcodeImageAPI.uploadQRcodeImageData(req, res, function (err, data) {
        if (!err) return res.json({ "status": true, "data": data });
        else {
            return next(err);
        }
    });
})
    .post('/aws/getImagePresignedUrl', async (req, res, next) => {

        log.debug(COMPONENT, 'getPDFPresignedUrl'); log.close();
        let [err, QRcodeImageData] = await handle(QRcodeImageAPI.getImagePresignedUrl(req.body));
        if (err) {
            log.error(COMPONENT, 'getPDFPresignedUrl', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'getPDFPresignedUrl');
            log.close();
            return res.json({ status: true, data: QRcodeImageData });
        }
    })

module.exports = router;
