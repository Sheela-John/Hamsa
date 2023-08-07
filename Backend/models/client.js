const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    uhid: { type: String },
    clientName: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    address: { type: String },
    clientAddressLatitude: { type: String },
    clientAddressLogitude: { type: String },
    emergencyNumber: { type: String },
    homeBranchId: { type: String },
    homeBranchAddress: { type: String },
    clientHomeBranchLattitude: { type: String },
    clientHomeBranchLogitude: { type: String },

    packageId: { type: String },
    noOfSession: { type: String },
    onWeekDay: { type: Array },
    amount: { type: String },
    staffId: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    serviceId: { type: String },
    typeOfTreatment: { type: Number },
    slot: { type: String },
    duration: { type: String },
    startTime: { type: String },
    endTime: { type: String },

    addSession: { type: Array },
    // clientStatus: { type: Number },
    // status: { type: Number, default: 0 },
    isDeleted: { type: Number, default: 0}
}, {
    collection: 'client',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('client', clientSchema);
module.exports = model; 