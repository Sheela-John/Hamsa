const COMPONENT = "Branch Router";
const router = require('express').Router();
const lodash = require('lodash');
const BranchAPI = require('../api/branch.api');
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

/* Created Branch API */
router.post('/', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, branchData] = await handle(BranchAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: branchData });
})

    /* Update Branch API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        req.body._id = req.params._id;
        let [err, branchData] = await handle(BranchAPI.UpdateBranch(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: branchData, message: "Branch Updated Successfully!" });
    })

    /* Get By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for Branch by ID'); log.close();
        let [err, branchData] = await handle(BranchAPI.getBranchDataById(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get Branch by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'Branch found');
            log.close();
            return res.json({ status: true, data: branchData });
        }
    })

    /* Get all Branch detail*/
    .get('/get/allStaff', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all Branch'); log.close();
        let [err, branchData] = await handle(BranchAPI.getAllBranchDetails())
        if (err) {
            log.error(COMPONENT, 'find all Branch error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All Branch fetch Successful');
            log.close();
            return res.json({ status: true, data: branchData, message: 'Get all Branch Data Successfully!' });
        }
    })

    /* Enable or Disable By Branch Id */
    .get('/enableanddisable/:id', async (req, res, next) => {
        let [enableDisableErr, enableDisableData] = await handle(BranchAPI.enableDisableBranch(req.params.id));
        if (enableDisableErr) return res.status(200).json(lodash.merge({ status: false }, enableDisableErr));
        else return res.status(200).json({ status: true, "data": enableDisableData });
    })

module.exports = router;
