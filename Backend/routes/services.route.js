const COMPONENT = "Services Router";
const router = require('express').Router();
const lodash = require('lodash');
const ServicesAPI = require('../api/services.api');
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
    let [err, servicesData] = await handle(ServicesAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: servicesData });
})

    /* Update Services API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        req.body._id = req.params._id;
        let [err, servicesData] = await handle(ServicesAPI.UpdateServices(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: servicesData, message: "Services Updated Successfully!" });
    })

    /* Get By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for Services by ID'); log.close();
        let [err, servicesData] = await handle(ServicesAPI.getServicesDataById(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get Services by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'Services found');
            log.close();
            return res.json({ status: true, data: servicesData });
        }
    })

    /* Get all Services detail*/
    .get('/get/allServices', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all Services'); log.close();
        let [err, servicesData] = await handle(ServicesAPI.getAllServicesDetails())
        if (err) {
            log.error(COMPONENT, 'find all Services error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All Services fetch Successful');
            log.close();
            return res.json({ status: true, data: servicesData, message: 'Get all Services Data Successfully!' });
        }
    })

    /* Enable or Disable By Services Id */
    .get('/enableanddisable/:id', async (req, res, next) => {
        let [enableDisableErr, enableDisableData] = await handle(ServicesAPI.enableDisableServices(req.params.id));
        if (enableDisableErr) return res.status(200).json(lodash.merge({ status: false }, enableDisableErr));
        else return res.status(200).json({ status: true, "data": enableDisableData });
    })

module.exports = router;
