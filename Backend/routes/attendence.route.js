const COMPONENT = "Attendence Router";
const router = require('express').Router();
const lodash = require('lodash');
const AttendenceAPI = require('../api/attendence.api');
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

/* Created Attendence API */
router.post('/', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, attendenceData] = await handle(AttendenceAPI.entryAttendence(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: attendenceData });
})

  /* Update Attendence API */
  .put('/:_id', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
    req.body._id = req.params._id;
    let [err, branchData] = await handle(AttendenceAPI.UpdateAttendence(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: branchData, message: "Attendence Updated Successfully!" });
})

/* Get Attendence of Particluar Staff */
router.get('/:id', async (req, res, next) => {
    let [err, attendenceData] = await handle(AttendenceAPI.getAttendenceofStaff(req.params.id));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: attendenceData });
})

/* Get Attendence of Particluar Staff from Date Range */
router.post('/getAttendenceReport', async (req, res, next) => {
    let [err, attendenceData] = await handle(AttendenceAPI.getAttendenceofStaffByDateRange(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: attendenceData });
})

/* Get Attendence of Particluar Staff of Today */
router.post('/getAttendenceofToday', async (req, res, next) => {
    let [err, attendenceData] = await handle(AttendenceAPI.getAttendenceofToday(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: attendenceData });
})

module.exports = router;