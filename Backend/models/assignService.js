const mongoose = require('mongoose');

const assignServiceSchema = new mongoose.Schema({
    packageId: { type: String },
    clientId: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    transport: { type: String },
    endDate: { type: String },
    startDate: { type: String },
    staffId: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    branchId: { type: String },
    phone: { type: String },
    date: { type: String },
    branchType: { type: Number }, //0- homebranch 1- branch
    status: { type: Number, default: 0 },//0-upcoming   1-completed 2 - reschedule  3-Distance Mismatch
    opType: { type: Number }, //0-same branch 1-other branch
    duration: { type: String },
    address: { type: String },
    serviceId: { type: String },
    slot: { type: String },
    typeOfTreatment: { type: Number },
    onlineLink: { type: String },
    otherBranchId: { type: String },
    slatitude: { type: Number },
    slongitude: { type: Number },
    elatitude: { type: Number },
    elongitude: { type: Number },
    bookedCount: { type: Number, default: 1 },
    travelDistanceinKM: { type: Number,default:0 },
    travelDurationinMinutes: { type: Number,default:0  },
    rating: { type: Number, default: 0 },
    feedBack: { type: String },
    paymentRefNum: { type: String },
    actualStartTime: {
        type: String
    },
    actualEndTime: {
        type: String
    },
    reason: { type: String },
    travelStartLatitude: {
        type: Number
    },
    travelStartLongitude: {
        type: Number
    },
    travelEndLatitude: {
        type: Number
    },
    travelEndLongitude: {
        type: Number
    },
    travelCount:{
        type:Number,
        default:0
    },
    travelAmount:{
        type:Number,
        default:0
    },
    startDistance:{
        type:Number,
        default:0
    },
    endDistance:{
        type:Number,
        default:0
    },
    autoInvoiceId:{
        type:String
    }
}, {
    collection: 'assignService',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('assignService', assignServiceSchema);
module.exports = model; 