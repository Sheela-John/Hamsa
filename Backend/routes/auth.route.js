const COMPONENT = "AUTH ROUTE";
const router = require('express').Router();
const AuthAPI = require('../api/auth.api');
const async = require('async');
const lodash = require('lodash');
const authenticate = require('../middleware/OAuth-Authentication.js');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var oauth = require('../middleware/OAuth-initilialize.js');
const config = require('config');
const ERR = require('../errors.json');
const log = require('../util/logger').log(COMPONENT, __filename);

/* For error handling in async await function */
const handle = (promise) => {
    return promise
        .then(data => ([undefined, data]))
        .catch(error => Promise.resolve([error, undefined]));
}

router.post('/login', (req, res) => {
    req.body.grant_type = 'password';
    req.body.client_id = 'my-app';
    req.body.password = req.body.password + ',' + req.body.role;
    var request = new Request(req);
    var response = new Response(res);
    oauth
        .token(request, response)
        .then(function (token) {
            /* remove unnecessary values in response */
            delete token.client;
            return res.json(lodash.merge({ status: true }, token))
        }).catch(function (err) {
            /* remove unnecessary values in response */
            delete err.statusCode; delete err.code; delete err.name; delete err.status;
            return res.status(200).json(lodash.merge({ status: false }, err.message));
        });
});

router.post('/refreshToken', (req, res) => {
    req.body.client_id = 'my-app';
    req.body.grant_type = 'refresh_token';
    var request = new Request(req);
    var response = new Response(res);

    oauth
        .token(request, response)
        .then(function (token) {
            /* remove unnecessary values in response */
            delete token.client; delete token.user;
            return res.json(lodash.merge({ status: true }, token))
        }).catch(function (err) {
            /* remove unnecessary values in response */
            delete err.statusCode; delete err.code; delete err.name; delete err.status;
            return res.status(200).json(lodash.merge({ status: false }, err));
        })
});


router.post('/change-password', authenticate("PORTAL_STAFF,PORTAL_ADMIN"), async (req, res) => {
    if (lodash.isEmpty(req.body)) return res.status(200).json(lodash.merge({ status: false }, ERR.MANDATORY_FIELD_MISSING));
    let [err, status] = await (handle(AuthAPI.changePassword(req)));
    if (err) res.status(200).json(lodash.merge({ status: false }, err));
    else res.status(200).json({ status: true, "message": "Password Changed Successfully" });

});
router.post('/loginClient', async (req, res) => {
    console.log("req",req.body)
    if (lodash.isEmpty(req.body)) return res.status(200).json(lodash.merge({ status: false }, ERR.MANDATORY_FIELD_MISSING));
    let [err, statusData] = await (handle(AuthAPI.loginClient(req.body)));
    if (err) res.status(200).json(lodash.merge({ status: false }, err));
    else res.status(200).json({ status: true,data: statusData });

});

router.post('/forgot-password', async (req, res) => {
    if (lodash.isEmpty(req.body)) return res.status(200).json(lodash.merge({ status: false }, ERR.MANDATORY_FIELD_MISSING));
    let [err, status] = await (handle(AuthAPI.forgotPassword(req.body)));
    if (err) res.status(200).json(lodash.merge({ status: false }, err));
    else res.status(200).json({ status: true, "message": "Reset Password Link has been sent successfully" });

});

router.post('/reset-password', async (req, res) => {
    if (lodash.isEmpty(req.body)) return res.status(200).json(lodash.merge({ status: false }, ERR.MANDATORY_FIELD_MISSING));
    let [err, status] = await (handle(AuthAPI.resetPassword(req.body)));
    if (err) res.status(200).json(lodash.merge({ status: false }, err));
    else res.status(200).json({ status: true, "message": "Password Resetted Successfully" });
});

module.exports = router;