const COMPONENT = "Branch Transfer Router";
const router = require('express').Router();
const lodash = require('lodash');
const BranchAPI = require('../api/branchTransfer.api');
const ERR = require('../errors.json');
const config = require('config');
const authenticate = require('../middleware/OAuth-Authentication');
const { BranchTransfer } = require('../models');
const branchTransferApi = require('../api/branchTransfer.api');
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
    let [err, branchTransferData] = await handle(branchTransferApi.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: branchTransferData });
})

    //Get All Branch Transfer

    .get('/get/allBranchTransfer', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all Branch Transfer'); log.close();
        let [err, branchTransferData] = await handle(branchTransferApi.getAllBranchTransferDetails())
        if (err) {
            log.error(COMPONENT, 'find all Branch Transfer error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All Branch Transfer fetch Successful');
            log.close();
            return res.json({ status: true, data: branchTransferData, message: 'Get all Branch Transfer Data Successfully!' });
        }
    })

    //Get Branch Transfer By Id

        
        .get('/:id', async (req, res, next) => {
            log.debug(COMPONENT, 'Search for Branch Transfer by ID'); log.close();
            let [err, branchTransferData] = await handle(branchTransferApi.getBranchTransferDataById(req.params.id));
            if (err) {
                log.error(COMPONENT, 'Get Branch Transfer by Id error', { attach: err });
                log.close();
                return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
            }
            else {
                log.debug(COMPONENT, 'Branch Transfer found');
                log.close();
                return res.json({ status: true, data: branchTransferData });
            }
        })
        .get('/getBranchTransferByStaffId/:id', async (req, res, next) => {
            log.debug(COMPONENT, 'Search for Branch Transfer by Staff ID'); log.close();
            let [err, branchTransferData] = await handle(branchTransferApi.getBranchTransferByStaffId(req.params.id));
            if (err) {
                log.error(COMPONENT, 'Get Branch Transfer by Staff Id error', { attach: err });
                log.close();
                return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
            }
            else {
                log.debug(COMPONENT, 'Branch Transfer found');
                log.close();
                return res.json({ status: true, data: branchTransferData });
            }
        })
        
    /* Update Branch API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        req.body._id = req.params._id;
        let [err, branchTransferData] = await handle(branchTransferApi.UpdatebranchTransferData(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: branchTransferData, message: "Branch Updated Successfully!" });
    })

    /* Enable / Disable Branch Transfer By Branch Transfer Id */

    .get('/enableanddisable/:id', async (req, res, next) => {
        let [enableDisableErr, enableDisableData] = await handle(branchTransferApi.enableDisablebranchTransferData(req.params.id));
        if (enableDisableErr) return res.status(200).json(lodash.merge({ status: false }, enableDisableErr));
        else return res.status(200).json({ status: true, "data": enableDisableData });
    })
    .delete('/deleteBranchTransfer/:_id', async (req, res, next) => {
        log.debug(COMPONENT, 'Delete BranchTransferData '); log.close();
        let [err, mentorData] = await handle(branchTransferApi.deleteBranchTransfer(req.params._id));
        if (err) {
            log.error(COMPONENT, 'Change BranchTransfer status error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'Changing BranchTransfer Status');
            log.close();
            return res.json({ "status": true, data: mentorData, "message": "BranchTransfer Status Changed!" })
        }
    });
module.exports = router;