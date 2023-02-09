var db = {};

db.Staff = require('./staff');
db.Login = require('./login');
db.Role = require('./role');
db.OAuthAccessToken = require('./OAuthAccessToken.js');
db.OAuthRefreshToken = require('./OAuthRefreshToken.js');
db.Branch = require('./branch');
db.Settings = require('./settings');

module.exports = db;