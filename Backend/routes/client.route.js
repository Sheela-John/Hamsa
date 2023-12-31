const COMPONENT = "Client Router";
const router = require('express').Router();
const lodash = require('lodash');
const ClientAPI = require('../api/client.api');
const ERR = require('../errors.json');
const log = require('../util/logger').log(COMPONENT, ___filename);

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

/* Created Client API */
router
    .post('/', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
        let [err, clientData] = await handle(ClientAPI.create(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: clientData });
    })

    .post('/saveRecurringSession', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
        let [err, clientData] = await handle(ClientAPI.saveRecurringSession(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: clientData });
    })

    /* Get Client By Id */
    .get('/:id', async (req, res, next) => {
        log.debug(COMPONENT, 'Search for Client by ID'); log.close();
        let [err, clientData] = await handle(ClientAPI.getClientDatabyId(req.params.id));
        if (err) {
            log.error(COMPONENT, 'Get Client by Id error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'Client found');
            log.close();
            return res.json({ status: true, data: clientData });
        }
    })

    /* Get all Client detail*/
    .get('/get/allClient', async (req, res, next) => {
        log.debug(COMPONENT, 'Searching for all Client'); log.close();
        let [err, clientData] = await handle(ClientAPI.getAllClientDetails())
        if (err) {
            log.error(COMPONENT, 'find all Client error', { attach: err });
            log.close();
            return res.json({ status: false, err: Object.assign(ERR.UNKNOWN, { message: err.message }) });
        }
        else {
            log.debug(COMPONENT, 'All Client fetch Successful');
            log.close();
            return res.json({ status: true, data: clientData, message: 'Get all Client Data Successfully!' });
        }
    })

    /* Update Client API */
    .put('/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        // req.body._id = req.params._id;
        let [err, clientData] = await handle(ClientAPI.updateClient(req.body, req.params._id));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: clientData, message: "Client Updated Successfully!" });
    })
    .put('/UpdateClientDetails/:_id', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
         req.body._id = req.params._id;
        let [err, clientData] = await handle(ClientAPI.UpdateClientDetails(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: clientData, message: "Client Updated Successfully!" });
    })
    /* Send OTP to Mobile */
    .post('/generateOTP', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING)
        let [err, clientData] = await handle(ClientAPI.sendOTP(req.body));
        // const response = await fast2sms.sendMessage({ authorization: "3xFtQ8aNIclXJq6CnzsoDjgWAu1HiVe47GTLkpYRbBwmMyKvrd7mJied0uv6wW5bytko8RAMqPrFlxCS", message: "Hello", numbers: [req.body.phone] });
        if (err) return next(err);
        // res.send(response);
        else return res.status(200).json({ status: true, data: clientData, message: "OTP Send to Client Successfully!" });
    })

    /* Additional Service Request */
    .post('/additionalServiceRequest', async (req, res, next) => {
        if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
        let [err, requestData] = await handle(ClientAPI.requestAdditionalService(req.body));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: requestData, message: "Additional Service Request Send Successfully" })
    })

    .post('/generatePackageId/:id', async (req, res, next) => {
        // if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
        let [err, requestData] = await handle(ClientAPI.generatePackageId(req.params.id));
        if (err) return next(err);
        else return res.status(200).json({ status: true, data: requestData, message: "Package Id Generated Successfully" })
    })

    .get('/enableanddisable/:id', async (req, res, next) => {
        let [enableDisableErr, enableDisableData] = await handle(ClientAPI.enableDisableClient(req.params.id));
        if (enableDisableErr) return res.status(200).json(lodash.merge({ status: false }, enableDisableErr));
        else return res.status(200).json({ status: true, data: enableDisableData });
    })

    .post('/getClientDetailsByPackageId', async (req, res, next) => {
        let [enableDisableErr, enableDisableData] = await handle(ClientAPI.getClientDetailsByPackageId(req.body));
        if (enableDisableErr) return res.status(200).json(lodash.merge({ status: false }, enableDisableErr));
        else return res.status(200).json({ status: true, data: enableDisableData });
    })

    // Get assign service Data by package id
    .post('/getAssignServiceByPackageId', async (req, res, next) => {
        let [assignErr, assignData] = await handle(ClientAPI.getAssignServiceByPackageId(req.body));
        if (assignErr) return res.status(200).json(lodash.merge({ status: false }, assignErr));
        else return res.status(200).json({ status: true, data: assignData });
    })

module.exports = router;