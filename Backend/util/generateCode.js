/**
 * generateEmailCode. utils
 */

// Function to generate OTP 
'use strict'
const config = require('config');

function generateVerificationCode() {
    // Generates  a 4 digit OTP  
    var digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}


function genrateSubcriptionCode() {
    // Generates  a 16 digit license 
    var length = 16;
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

/*To generate Default Image*/
function genrateDefaultImage(gender) {
    let genderIdentity
    var [array, imageUrl] = [[], ''];
    // if ((gender == '') || (gender == undefined)) {
    //     genderIdentity = 2;
    // }
    // else {
    //     genderIdentity = parseInt(gender);
    // }
    genderIdentity = ((gender == '') || (gender == undefined)) ? 2 : parseInt(gender)


    switch (genderIdentity) {
        case 0:
            array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
            imageUrl = config.defaultImages.maleurl;
            break;
        case 1:
            array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            imageUrl = config.defaultImages.femaleurl;
            break;
        case 2:
            array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            imageUrl = config.defaultImages.othersurl;
            break;
    }
    let result = array[Math.floor(Math.random() * array.length)]
    return imageUrl + result + '.png'
}

module.exports = {
    generateVerificationCode: generateVerificationCode,
    genrateSubcriptionCode: genrateSubcriptionCode,
    randomString: randomString,
    genrateDefaultImage: genrateDefaultImage,
}