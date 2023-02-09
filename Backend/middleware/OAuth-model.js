/**
 * Created by Manjesh on 14-05-2016.
 */

var _ = require('lodash');
var mongodb = require('../models');
var authApi = require('../api/auth.api');
var OAuthAccessToken = mongodb.OAuthAccessToken;
var OAuthRefreshToken = mongodb.OAuthRefreshToken;

/* Gets called during  authentication */
function getAccessToken(bearerToken) {
  return OAuthAccessToken
    //User,OAuthClient
    .findOne({ access_token: bearerToken })
    .then(function (accessToken) {
      if (!accessToken) return false;
      var token = accessToken;
      token.user = {};
      token.client = {};
      token.scope = token.scope
      token.accessTokenExpiresAt = token.accessTokenExpires;
      return token;
    })
    .catch(function (err) {
    });
}

/* Gets called on issuing token during login*/
function getClient(clientId, clientSecret) {
  var clientWithGrants = {
    client_id: 'democlient',
    client_secret: 'democlientsecret',
    redirect_uri: 'http://localhost/cb'
  };
  clientWithGrants.grants = ['password', 'refresh_token']
  clientWithGrants.redirectUris = [clientWithGrants.redirect_uri]
  delete clientWithGrants.redirect_uri
  return clientWithGrants;
}

/* Gets called during login */
function getUser(loginCred, passwordwithRole) {
  let [password, role] = passwordwithRole.split(',');
  /* login Logic */
  return new Promise((resolve, reject) => {
    authApi.login(loginCred, password, role).then(data => {
      resolve(data);
    }).catch(err => {
      reject(err);
    })
  })
}
/* Gets called on issuing new access token by getting refresh token */
function revokeToken(token) {
  return OAuthRefreshToken.findOne({
    where: {
      refresh_token: token.refreshToken
    }
  }).then(function (rT) {
    if (rT) rT.destroy();
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
    var expiredToken = token
    expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredToken
  }).catch(function (err) {
  });
}

/* Gets called on login functionality which saves token */
function saveToken(token, client, user) {
  /*  Setting up scope in token */
  token.scope = token.scope == undefined ? user.role : token.scope;
  return Promise.all([
    OAuthAccessToken.create({
      access_token: token.accessToken,
      accessTokenExpires: token.accessTokenExpiresAt,
      user: user.user,
      scope: token.scope
    }),
    token.refreshToken ? OAuthRefreshToken.create({ // no refresh token for client_credentials
      refresh_token: token.refreshToken,
      refreshTokenExpires: token.refreshTokenExpiresAt,
      user: user.user,
      scope: token.scope
    }) : [],

  ])
    .then(function (resultsArray) {
      return _.assign(
        {
          client: client,
          user: user,
        },
        token
      )
    })
    .catch(function (err) {
    });
}

/* Gets called on getting new access token */
function getRefreshToken(refreshToken) {
  if (!refreshToken || refreshToken === 'undefined') return false
  //[OAuthClient, User]
  return OAuthRefreshToken
    .findOne({ refresh_token: refreshToken })
    .then(function (savedRT) {
      if (savedRT) {
        var tokenTemp = {
          user: savedRT ? savedRT.user : {},
          client: {},
          refreshTokenExpiresAt: savedRT ? new Date(savedRT.refreshTokenExpires) : null,
          refreshToken: refreshToken,
          refresh_token: refreshToken,
          scope: savedRT.scope
        };
        return tokenTemp;
      }
    }).catch(function (err) {
    });
}

/* Verify scope before accessing protected Api's */
function verifyScope(token, scope) {
  if (scope.indexOf(',') > 0)
    scope = scope.split(',');
  else
    scope = [scope];
  return scope.includes(token.scope);
}
module.exports = {
  getAccessToken: getAccessToken,
  getClient: getClient,
  getRefreshToken: getRefreshToken,
  getUser: getUser,
  revokeToken: revokeToken,
  saveToken: saveToken,
  verifyScope: verifyScope,
}



