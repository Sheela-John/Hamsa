const mongoose = require('mongoose');

const travelAllowanceSchema = new mongoose.Schema({
    staffId: { type: String },
    clientId: { type: String },
    assignedServiceId: { type: String },
    date: { type: Date },
    distanceInMeters: { type: Number },
    distanceInKiloMeters: { type: Number },
    durationInSeconds: { type: Number },
    durationInMinutes: { type: Number },
    travelAllowanceCost: { type: Number },
    status: { type: Number } /* 0 - Completed ,  1 - Start Distance MisMatch , 2 - End Distance MsiMatch */
}, {
    collection: 'travelAllowance',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('travelAllowance', travelAllowanceSchema);
module.exports = model; 