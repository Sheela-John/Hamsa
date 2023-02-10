const COMPONENT = "Assign Services Router";
const router = require('express').Router();
const lodash = require('lodash');
const AssignServiceAPI = require('../api/assignService.api');
const ERR = require('../errors.json');
const config = require('config');
const authenticate = require('../middleware/OAuth-Authentication');
const log = require('../util/logger').log(COMPONENT, __filename);

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

/* Created Assign Service API */
router.post('/client', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

module.exports = router;