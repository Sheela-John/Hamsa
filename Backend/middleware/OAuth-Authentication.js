/**
 * Created by Manjesh on 14-05-2016.
 */

var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response; 
const oauth=require('./OAuth-initilialize');   
// const licenseApi = require('../api/license.api');
const models = require('../models');
const Login = models.Login;
const lodash = require('lodash');
const { stubFalse } = require('lodash');
const async = require('async');

/* For error handling in async await function */
const handle = (promise) => {
  return promise
      .then(data => ([undefined, data]))
      .catch(error => Promise.resolve([error, undefined]));
}

module.exports = function(options){
  var options = options || {};
  return async function(req, res, next) {
    var request = new Request({
      headers: {authorization: req.headers.authorization},
      method: req.method,
      query: req.query,
      body: req.body
    });
    var response = new Response(res);

    oauth.authenticate(request, response,options)
      .then(function (token) {
        // Request is authorized.
        req.user = token;
        (async() =>{
          let [userErr,user] = await handle(Login.findOne({'user':req.user.user}));
          if(userErr) res.status(500).json({"status":500,"message":"Internal Server Error"});
          else if(user.status != 0) res.status(901).json({'status':901,'message':'User has been deleted or deactivated'});
          else next();
        })();
        // }
      })
      .catch(function (err) {
        // Request is not authorized.
        res.status(err.code || 500).json(err)
      });
  }
}
