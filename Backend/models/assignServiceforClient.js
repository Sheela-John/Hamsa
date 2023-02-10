const mongoose = require('mongoose');

const assignServiceForClientSchema = new mongoose.Schema({
    staffId: { type: String },
    date: { type: Date },
    clientName: { type: String },
    address: { type: String },
    phone: { type: String },
    service: { type: String },
    time: { type: Date },
    status: { type: Number, default: 0 } /* 0 - Assigned ,  1 - Not Available , 2 - Rescheduled */
}, {
    collection: 'assignServiceForClient',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('assignServiceForClient', assignServiceForClientSchema);
module.exports = model; 