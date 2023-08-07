const mongoose = require('mongoose');

const assignServiceSchema = new mongoose.Schema({
    packageId: {type: String},
    clientId: {type: String},
    startTime: {type: String},
    endTime: {type: String},
    transport: {type: String},
    endDate: {type: String },
    startDate: {type: String},
    staffId: {type: String},
    latitude: {type: String},
    longitude: {type: String},
    branchId: { type: String},
    phone: {type: String },
    date: {type: String },
    branchType :{type:Number}, //0- homebranch 1- branch
    status: {type: Number,default: 0 },//0-upcoming   1-completed 2 - reschedule
opType:{type:Number }, //0-same branch 1-other branch
onlineLink:{type:String},
    duration: {type: String },
    address: {type: String },
    serviceId: {type: String},
    slot: {type: String},
    typeOfTreatment: {type: Number},
    onlineLink: {type: String},
    otherBranchId: {type: String},
    slatitude: {type: Number},
    slongitude: {type: Number},
    elatitude: { type: Number},
    elongitude: { type: Number},
    bookedCount: {type: Number },
    travelDistanceinKM: {type: Number },
    travelDuration: {type: String },
    rating: {  type: Number, default: 0},
    feedBack: { type: String},
    paymentRefNum: {type: String },
    reason:{type:String}
}, {
    collection: 'assignService',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('assignService', assignServiceSchema);
module.exports = model; 