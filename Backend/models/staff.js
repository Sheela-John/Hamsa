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
    type:String
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
   }
}, {
    collection: 'staff',
    versionKey: false,
    timestamps: true
});


const model = mongoose.model('staff', staffSchema);
module.exports = model; 