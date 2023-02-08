const component = 'Calculate Slot Count'
const moment = require('moment');
const models = require('../models');
const settingsModel = models.Settings;
const ERR = require('../errors.json');
const lodash = require('lodash');
const constantInitialDate = require('../constants').constantDate;

/* For error handling in async await function */
const handle = (promise) => {
    return promise
      .then(data => ([undefined, data]))
      .catch(error => Promise.resolve([error, undefined]));
  }

/* Finding intervals between time */
const intervals = (startTime,endTime,duration) => {
    var result = [];
    var current = moment(startTime).utc();
    while (current < endTime) {
        result.push(current.format('YYYY-MM-DD HH:mm'));
        current.add(Number(duration), 'minutes');
    }
    return result.length;
}

/* Calculating the count of total slots */
const checkSlotCount = async(originalSession,newSession) => {
    let newArray;
    if(!lodash.isArray(newSession)) newArray = [...originalSession,...[newSession]];
    else newArray = originalSession;
    let slotCount = 0;
    newArray.forEach((session,index)=>{
    let constantDate = new Date(constantInitialDate);
    let startTimeSplit = session.startTime.split(':');
    let endTimeSplit = session.endTime.split(':');
    let sessionStartTime = constantDate.setUTCHours(startTimeSplit[0], startTimeSplit[1]);
    let sessionEndTime = constantDate.setUTCHours(endTimeSplit[0], endTimeSplit[1]);
    slotCount = slotCount + intervals(sessionStartTime,sessionEndTime,session.durationPerSlot.split(' ')[0]);
    })
    return checkCountValidity(slotCount);
}

/* check count exceeded allocated limit or not*/
const checkCountValidity = async(slotCount) => {
    let [settingsErr,settings] = await handle(settingsModel.findOne({}).lean());
    return new Promise((resolve,reject)=>{
        if(settingsErr) return reject(settingsErr);
        if(slotCount < Number(settings.allowedAppointmentsPerDay)) reject(ERR.ALLOCATED_SLOT_REACHED)
        else return resolve(true);
    })
    
}

module.exports = {
    checkSlotCount:checkSlotCount
}