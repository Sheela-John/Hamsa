/**
 * Created by Manjesh on 14-05-2016.
 */
 'use strict';

 var mongoose = require('mongoose'),
   Schema = mongoose.Schema;
 
 var RefreshTokenSchema = new Schema({
   refresh_token: String,
   refreshTokenExpires: {type:Date},
   scope:  String,
   user:  String
 });
 
 module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
 