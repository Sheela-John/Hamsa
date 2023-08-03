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
router.post('/', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.assignServiceClient(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Created Assign Branch API */
router.post('/branch', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.assignServiceBranch(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services by Single Staff for Single Date */
router.post('/assignedServicesbyStaff/date', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAssignedServicesbyStaff(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})
router.post('/travelDistance', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.travelDistance(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})
/* Get All Assigned Services */
router.get('/allAssignedServices', async (req, res, next) => {
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAllAssignedServices());
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services - Of Client */
router.get('/:id', async (req, res, next) => {
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAssignedServicesById(req.params.id));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services - Of Branch */
router.get('/ofBranch/:id', async (req, res, next) => {
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAssignedServicesofBranchById(req.params.id));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services ( Client & Branch ) - Single Staff Id */
router.get('/allAssignedServicesforStaff', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAllAssignedServicesforStaff(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services by Single Branch Id */
router.get('/allAssignedServices/byBranch', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAllAssignedServicesbySingleBranch(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services by Client Name */
router.get('/allAssignedServices/byClient', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAllAssignedServicesbyClient(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services by Single Service Id */
router.post('/allAssignedServices/byService', async (req, res, next) => {
    if (lodash.isEmpty(req.body)) return next(ERR.MANDATORY_FIELD_MISSING);
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAllAssignedServicesbyServiceId(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services of All Branches */
router.get('/allAssignedServices/allBranches', async (req, res, next) => {
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAllAssignedServicesofAllBranches(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services of All Services */
router.get('/allAssignedServices/allServices', async (req, res, next) => {
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAllAssignedServicesofAllServices(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services of Single Staff by Staff Id in All Branches */
router.get('/allAssignedServices/byStaffId/allBranches', async (req, res, next) => {
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAssignedServicesofStaffbyIdinAllBranches(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Get All Assigned Services of Single Staff by Staff Id in All Services */
router.get('/allAssignedServices/byStaffId/allServices', async (req, res, next) => {
    let [err, assignServiceData] = await handle(AssignServiceAPI.getAssignedServicesofStaffbyIdinAllServices(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceData });
})

/* Start Services from Branch */
router.post('/onBranchStartToClientPlace', async (req, res, next) => {
    let [err, onBranchStartData] = await handle(AssignServiceAPI.onBranchStartToClientPlace(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: onBranchStartData });
})

/* Start Services from Client Place */
router.post('/serviceOnStart/client', async (req, res, next) => {
    let [err, startData] = await handle(AssignServiceAPI.serviceOnStart(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: startData });
})

/* End Services from Client Place */
router.post('/serviceOnEnd/client', async (req, res, next) => {
    let [err, endData] = await handle(AssignServiceAPI.serviceOnEnd(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: endData });
})

/* Update Client Service */
router.put('/updateClient/:id', async (req, res, next) => {
    req.body.clientServiceId = req.params.id;
    let [err, updateData] = await handle(AssignServiceAPI.updateClient(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: updateData });
})

/* Update Branch Service */
router.put('/updateAssignService/:id', async (req, res, next) => {
    req.body.assignServiceId = req.params.id;
    let [err, updateData] = await handle(AssignServiceAPI.updateAssignService(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: updateData });
})
router.post('/getAssignServiceDataByStaffIdAndDate', async (req, res, next) => {
    let [err, assignServiceDataData] = await handle(AssignServiceAPI.getAssignServiceDataByStaffIdAndDate(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceDataData });
})
router.post('/getSlotsForAssignService', async (req, res, next) => {
    let [err, assignServiceDataData] = await handle(AssignServiceAPI.getSlotsForAssignService(req.body));
    if (err) return next(err);
    else return res.status(200).json({ status: true, data: assignServiceDataData });
})
module.exports = router;