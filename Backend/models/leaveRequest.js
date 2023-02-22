const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    staffId: { type: String },
    staffName: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    reason: { type: String },
    leaveStatus: { type: Number, default: 0 } // 0 - Applied , 1 - Accepted , 2 - Denied
}, {
    collection: 'leaveRequest',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('leaveRequest', leaveRequestSchema);
module.exports = model; 