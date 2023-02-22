const COMPONENT = "STAFF ROUTER";
const router = require('express').Router();
const lodash = require('lodash');
const StaffAPI = require('../api/Staff.api');
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

/* Created Staff API */
router.post('/', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, staffData] = await handle(StaffAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: staffData });
})

    /* Update Staff API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        req.body._id = req.params._id;
        let [err, staffData] = await handle(StaffAPI.UpdateStaff(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: staffData, message: "Staff Updated Successfully!" });
    })

    /* Get By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for Staff by ID'); log.close();
        let [err, staffData] = await handle(StaffAPI.getStaffDataById(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get Staff by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'Staff found');
            log.close();
            return res.json({ status: true, data: staffData });
        }
    })

    /* Get all Staff detail*/
    .get('/get/allStaff', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all Staff'); log.close();
        let [err, staffData] = await handle(StaffAPI.getAllStaffDetails())
        if (err) {
            log.error(COMPONENT, 'find all Staff error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All Staff fetch Successful');
            log.close();
            return res.json({ status: true, data: staffData, message: 'Get all Staff Data Successfully!' });
        }
    })

    /* Enable or Disable By Staff Id */
    .get('/enableanddisable/:id', async (req, res, next) => {
        let [enableDisableErr, enableDisableData] = await handle(StaffAPI.enableDisableStaff(req.params.id));
        if (enableDisableErr) return res.status(200).json(lodash.merge({ status: false }, enableDisableErr));
        else return res.status(200).json({ status: true, "data": enableDisableData });
    })

    /* Created Admin API */
    .post('/createAdmin', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
        let [err, adminData] = await handle(StaffAPI.createAdmin(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: adminData });
    })

    /* Find Admin API */
    .get('/find/allAdmin', async (req, res, next) => {
        let [err, adminData] = await handle(StaffAPI.findAllAdmin());
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: adminData });
    })

    /* Find Admin by Id API */
    .get('/find/adminById/:id', async (req, res, next) => {
        let [err, adminData] = await handle(StaffAPI.findAdminById(req.params.id));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: adminData });
    })

    //get user profile
    .get('/get/profile', authenticate(), async (req, res, next) => {
        var userData = {
            role: req.user.scope,
            id: req.user.user
        }
        let [err, userdata] = await handle(StaffAPI.find.profile(userData));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: userdata });
    })

    // Apply for Leave by Staff
    .post('/leaveRequest', authenticate(), async (req, res, next) => {
        req.body.staffId = req.user.user;
        let [err, leaveData] = await handle(StaffAPI.leaveRequest(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: leaveData });
    })

    // Get All Leave Requests
    .get('/all/leaveRequest', async (req, res, next) => {
        let [err, leaveData] = await handle(StaffAPI.getAllLeaveRequest());
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: leaveData });
    })

    // Get Leave Requests By Id
    .get('/leaveRequest/:id', async (req, res, next) => {
        let [err, leaveData] = await handle(StaffAPI.getLeaveRequestById(req.params.id));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: leaveData });
    })

    // Get Leave Requests By Status
    .get('/leaveRequest', async (req, res, next) => {
        let [err, leaveData] = await handle(StaffAPI.getLeaveRequestByStatus(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: leaveData });
    })

    .post('/search/leaveRequest', async (req, res, next) => {
        let [err, leaveData] = await handle(StaffAPI.searchLeaveRequestByStaff(req.body));
        if (err) return next(err);
        else res.json({ status: true, "data": leaveData });
    })

    // Get Leave Requests By Status
    .get('/leaveRequest/byStaffId/:id', async (req, res, next) => {
        let [err, leaveData] = await handle(StaffAPI.getLeaveRequestByStaffId(req.params.id));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: leaveData });
    })

module.exports = router;
