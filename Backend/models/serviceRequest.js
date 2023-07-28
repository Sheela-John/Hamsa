const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
   clientId:{
    type:String
   },
   time:{
    type:String
   },
   date:{
    type:String
   },
   status:{
    type:Number
   },
   staffId:{
    type:String
   },
   serviceId:{
    type:String
   }

}, {
    collection: 'serviceRequest',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('serviceRequest', serviceRequestSchema);
module.exports = model; 