const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
   branchId:{
    type:String
   },
   empId:{
    type:String
   },
   staffName:{
    type:String
   },
   phone:{
    type:String
   },
   status:{
    type:String,
    default:0
   },
   address:{
    type:String
   },
   staffRole:{
    type:String
   },
   email:{
    type:String
   },
   branchId:{
    type:String
   },
   isDeleted:{
    type:Number,
    default:0
   },
   role:{
    type:String
   }
}, {
    collection: 'staff',
    versionKey: false,
    timestamps: true
});


const model = mongoose.model('staff', staffSchema);
module.exports = model; 