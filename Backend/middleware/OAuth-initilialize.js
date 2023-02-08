/**
 * Created by Manjesh on 15-05-2016.
 */

var oauthServer = require('oauth2-server');
const config=require('config');

var oauth = new oauthServer({
  model:  require('./OAuth-model.js'),
  requireClientAuthentication: {password: false,refresh_token:false},
  alwaysIssueNewRefreshToken:false,
  accessTokenLifetime:config.oauth.accessTokenExpiry,
  refreshTokenLifetime:config.oauth.refreshTokenExpiry,
});

module.exports = oauth;