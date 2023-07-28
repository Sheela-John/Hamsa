const COMPONENT = "travelAllowance Router";
const router = require('express').Router();
const lodash = require('lodash');
const TravelAllowanceAPI = require('../api/travelAllowance.api');
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
    let [err, travelAllowancetData] = await handle(TravelAllowanceAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: travelAllowancetData });
})

    /* Update Services API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        req.body._id = req.params._id;
        let [err, travelAllowancetData] = await handle(TravelAllowanceAPI.UpdatetravelAllowance(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: travelAllowancetData, message: "travelAllowancetData Updated Successfully!" });
    })

    /* Get By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for travelAllowancetData by ID'); log.close();
        let [err, travelAllowancetData] = await handle(TravelAllowanceAPI.gettravelAllowancetDataById(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get travelAllowancetData by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'travelAllowancetData found');
            log.close();
            return res.json({ status: true, data: travelAllowancetData });
        }
    })

    /* Get all travelAllowancetData detail*/
    .get('/get/alltravelAllowance', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all travelAllowancetData'); log.close();
        let [err, travelAllowancetData] = await handle(TravelAllowanceAPI.getAlltravelAllowanceDetails())
        if (err) {
            log.error(COMPONENT, 'find all travelAllowancetData error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All travelAllowancetData fetch Successful');
            log.close();
            return res.json({ status: true, data: travelAllowancetData, message: 'Get all travelAllowancetData Data Successfully!' });
        }
    })

module.exports = router;