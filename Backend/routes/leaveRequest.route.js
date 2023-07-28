const COMPONENT = "leaveRequest Router";
const router = require('express').Router();
const lodash = require('lodash');
const leaveRequestAPI = require('../api/leaveRequest.api');
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

/* Created leaveRequest API */
router.post('/', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, leaveRequestData] = await handle(leaveRequestAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: leaveRequestData });
})

    /* Update leaveRequest API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        req.body._id = req.params._id;
        let [err, leaveRequestData] = await handle(leaveRequestAPI.UpdateleaveRequest(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: leaveRequestData, message: "leaveRequestData Updated Successfully!" });
    })

    /* Get By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for leaveRequest by ID'); log.close();
        let [err, leaveRequestData] = await handle(leaveRequestAPI.getleaveRequestDataById(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get leaveRequestData by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'leaveRequestData found');
            log.close();
            return res.json({ status: true, data: leaveRequestData });
        }
    })

    /* Get all leaveRequest detail*/
    .get('/get/allleaveRequest', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all leaveRequestData'); log.close();
        let [err, leaveRequestData] = await handle(leaveRequestAPI.getAllleaveRequestDetails())
        if (err) {
            log.error(COMPONENT, 'find all leaveRequest error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All leaveRequestData fetch Successful');
            log.close();
            return res.json({ status: true, data: leaveRequestData, message: 'Get all leaveRequestData Data Successfully!' });
        }
    })

module.exports = router;