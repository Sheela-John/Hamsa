const COMPONENT = "Settings Router";
const router = require('express').Router();
const lodash = require('lodash');
const SettingsAPI = require('../api/settings.api');
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

/* Created Settings API */
router.post('/', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, settingsData] = await handle(SettingsAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: settingsData });
})

    /* Update Settings API */
    .put('/', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        let [err, settingsData] = await handle(SettingsAPI.UpdateSettings(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: settingsData, message: "Settings Updated Successfully!" });
    })

    /* Get By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for Settings by ID'); log.close();
        let [err, settingsData] = await handle(SettingsAPI.getSettingsDataById(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get Settings by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'Settings found');
            log.close();
            return res.json({ status: true, data: settingsData });
        }
    })

    /* Get all Settings detail*/
    .get('/get/allSettings', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all Settings'); log.close();
        let [err, settingsData] = await handle(SettingsAPI.getAllSettingsDetails())
        if (err) {
            log.error(COMPONENT, 'find all Settings error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All Settings fetch Successful');
            log.close();
            return res.json({ status: true, data: settingsData, message: 'Get all Settings Data Successfully!' });
        }
    })

    /* Enable or Disable By Settings Id */
    .get('/enableanddisable/:id', async (req, res, next) => {
        let [enableDisableErr, enableDisableData] = await handle(SettingsAPI.enableDisableSettings(req.params.id));
        if (enableDisableErr) return res.status(200).json(lodash.merge({ status: false }, enableDisableErr));
        else return res.status(200).json({ status: true, "data": enableDisableData });
    })

module.exports = router;
