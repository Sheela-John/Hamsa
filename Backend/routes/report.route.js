const COMPONENT = "Report Router";
const router = require('express').Router();
const lodash = require('lodash');
const ReportAPI = require('../api/report.api');
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

/* Get Services Report Data */
router.post('/activityReport', async (req, res, next) => {
    let [err, reportData] = await handle(ReportAPI.activityReport(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: reportData });
})

/* Get therapist Total Completed & Assigned Tasks */
router.post('/therapistReport', async (req, res, next) => {
    let [err, reportData] = await handle(ReportAPI.therapistReport(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: reportData });
})

/* Attendence Report */
router.post('/attendenceReport', async (req, res, next) => {
    let [err, reportData] = await handle(ReportAPI.attendenceReport(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: reportData });
})

module.exports = router;