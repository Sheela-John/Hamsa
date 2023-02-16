const mongoose = require('mongoose');

const assignServiceForClientSchema = new mongoose.Schema({
    staffId: { type: String },
    staffName: { type: String },
    date: { type: Date },
    clientId: { type: String },
    clientName: { type: String },
    address: { type: String },
    phone: { type: String },
    service: { type: String },
    time: { type: Date },
    serviceEndTime: { type: Date }, // Service End Time is from Staff Ending the Service in Client Place
    status: { type: Number, default: 0 } /* 0 - Assigned ,  1 - Completed , 2 - Rescheduled , 3 - Not Available , 4 - Distance MisMatch */
}, {
    collection: 'assignServiceForClient',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('assignServiceForClient', assignServiceForClientSchema);
module.exports = model; 