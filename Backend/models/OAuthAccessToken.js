/**
 * Created by Manjesh on 14-05-2016.
 */

 'use strict';

 var mongoose = require('mongoose'),
   Schema = mongoose.Schema;
 const config=require('config');
 
 var OAuthAccessTokenSchema = new Schema({
   access_token: String,
   accessTokenExpires: {type:Date},
   scope:  String,
   user:  String
 });
 
 OAuthAccessTokenSchema.index({accessTokenExpires: 1},{expireAfterSeconds: 0});
 
 module.exports = mongoose.model('OAuthAccessToken', OAuthAccessTokenSchema);
 