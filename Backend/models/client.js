const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
   
   clientName:{
    type:String
   },
   phoneNumber:{
    type:String
   },
   amount:{
    type:String
   },
    staffId:{
    type:String
   },
   homeBranchId:{
    type:String
   },
   packageId:{
    type:String
   },
   clientHomeBranchLogitude:{
    type:String
   },
   clientHomeBranchLattitude:{
    type:String
   },
   clientAddressLogitude:{
    type:String
   },
   clientAddressLatitude:{
    type:String
   },
   serviceId:{
    type:String
   },
   typeOfTreatment:{
    type:Number
   },
   startTime:{
    type:String
   },
   endTime:{
    type:String
   },
   onWeekDay:{
    type:Array
   },
   startDate:{
    type:String
   },
   endDate:{
    type:String
   },
   uhid:{
    type:String
   },
   homeBranchAddress:{
    type:String
   },
   duration:{
    type:String
   },
   address:{
    type:String
   },
   addSession:{
    type:Array
   },
   emergencyNumber:{
    type:String
   },
   email:{
    type:String
   },
   slot:{
    type:String
   },
   clientStatus:{
    type:Number
   },
   noOfSession:{
    type:String
   },
   status:{
    type:Number,
    default:0
   },
   isDeleted:{
    type:Number,
    default:0
   }
}, {
    collection: 'client',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('client', clientSchema);
module.exports = model; 