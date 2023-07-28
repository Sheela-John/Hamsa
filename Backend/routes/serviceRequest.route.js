const COMPONENT = "serviceRequest Router";
const router = require('express').Router();
const lodash = require('lodash');
const serviceRequestAPI = require('../api/serviceRequest.api');
const ERR = require('../errors.json');
const config = require('config');
const authenticate = require('../middleware/OAuth-Authentication');
const log = require('../util/logger').log(COMPONENT, ___filename);

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

/* Created Services API */
router.post('/', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, serviceRequestData] = await handle(serviceRequestAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: serviceRequestData });
})

    /* Update Services API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        req.body._id = req.params._id;
        let [err, serviceRequestData] = await handle(serviceRequestAPI.UpdateserviceRequest(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: serviceRequestData, message: "serviceRequestData Updated Successfully!" });
    })

    /* Get By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for Services by ID'); log.close();
        let [err, serviceRequestData] = await handle(serviceRequestAPI.getserviceRequestDataById(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get serviceRequestData by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'serviceRequest found');
            log.close();
            return res.json({ status: true, data: serviceRequestData });
        }
    })

    /* Get all serviceRequest detail*/
    .get('/get/allserviceRequest', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all serviceRequest'); log.close();
        let [err, serviceRequestData] = await handle(serviceRequestAPI.getAllserviceRequestDetails())
        if (err) {
            log.error(COMPONENT, 'find all serviceRequest error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All serviceRequest fetch Successful');
            log.close();
            return res.json({ status: true, data: serviceRequestData, message: 'Get all serviceRequest Data Successfully!' });
        }
    })

module.exports = router;