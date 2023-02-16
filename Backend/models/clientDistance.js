const mongoose = require('mongoose');

const clientDistanceSchema = new mongoose.Schema({
    staffId: { type: String },
    clientId: { type: String },
    assignedServiceId: { type: String },
    date: { type: Date },
    startStatus: { type: Boolean },
    endStatus: { type: Boolean },
    startDistance: { type: String },
    startDistanceValue: { type: Number },
    endDistance: { type: String },
    endDistanceValue: { type: Number },
    status: { type: Number } /* 0 - Completed ,  1 - Start Distance MisMatch , 2 - End Distance MsiMatch */
}, {
    collection: 'clientDistance',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('clientDistance', clientDistanceSchema);
module.exports = model; 