var db = {};

db.Staff = require('./staff');
db.Login = require('./login');
db.Role = require('./role');
db.OAuthAccessToken = require('./OAuthAccessToken.js');
db.OAuthRefreshToken = require('./OAuthRefreshToken.js');

module.exports = db;