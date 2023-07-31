const mongoose = require('mongoose');

const assignServiceSchema = new mongoose.Schema({
   packageId:{
    type:String
   },
   clientId:{
    type:String
   },
   startTime:{
    type:String
   },
   endTime:{
    type:String
   },
   transport:{
    type:String
   },
   endDate:{
    type:String
   },
   startDate:{
    type:String
   },
   staffId:{
    type:String
   },
   lattitude:{
    type:String
   },
   longitude:{
    type:String
   },
   branchId:{
    type:String
   },
   phone:{
    type:String
   },
   date:{
    type:String
   },
   status:{
    type:Number
   },
   duration:{
    type:String
   },
   address:{
    type:String
   },
   serviceId:{
    type:String
   },
   slot:{
    type:String
   },
   typeOfTreatment:{
    type:String
   },
   onlineLink:{
    type:String
   },
   otherBranchId:{
    type:String
   },
   bookedCount:{
    type:Number
   }
}, {
    collection: 'assignService',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('assignService', assignServiceSchema);
module.exports = model; 