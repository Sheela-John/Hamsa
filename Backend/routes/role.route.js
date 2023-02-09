const COMPONENT = "Role Router";
const router = require('express').Router();
const lodash = require('lodash');
const RoleAPI = require('../api/role.api');
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

/* Created Role API */
router.post('/', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, roleData] = await handle(RoleAPI.create(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: roleData });
})

    /* Update Role API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        req.body._id = req.params._id;
        let [err, roleData] = await handle(RoleAPI.UpdateRole(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: roleData, message: "Role Updated Successfully!" });
    })

    /* Get By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for Role by ID'); log.close();
        let [err, roleData] = await handle(RoleAPI.getRoleDataById(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get Role by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'Role found');
            log.close();
            return res.json({ status: true, data: roleData });
        }
    })

    /* Get all Role detail*/
    .get('/get/allRole', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all Role'); log.close();
        let [err, roleData] = await handle(RoleAPI.getAllRoleDetails())
        if (err) {
            log.error(COMPONENT, 'find all Role error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All Role fetch Successful');
            log.close();
            return res.json({ status: true, data: roleData, message: 'Get all Role Data Successfully!' });
        }
    })

    /* Enable or Disable By Role Id */
    .get('/enableanddisable/:id', async (req, res, next) => {
        let [enableDisableErr, enableDisableData] = await handle(RoleAPI.enableDisableRole(req.params.id));
        if (enableDisableErr) return res.status(200).json(lodash.merge({ status: false }, enableDisableErr));
        else return res.status(200).json({ status: true, "data": enableDisableData });
    })

module.exports = router;
