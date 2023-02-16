var db = {};

db.Staff = require('./staff');
db.Login = require('./login');
db.Role = require('./role');
db.OAuthAccessToken = require('./OAuthAccessToken.js');
db.OAuthRefreshToken = require('./OAuthRefreshToken.js');
db.Branch = require('./branch');
db.Settings = require('./settings');
db.AssignServiceForClient = require('./assignServiceforClient');
db.AssignServiceForBranch = require('./assignServiceforBranch');
db.Client = require('./client');
db.Services = require('./services');
db.clientDistance = require('./clientDistance');
db.TravelAllowance = require('./travelAllowance');
db.Attendence = require('./attendence');

module.exports = db;