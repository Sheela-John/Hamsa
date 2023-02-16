const mongoose = require('mongoose');

const assignServiceForBranchSchema = new mongoose.Schema({
    staffId: { type: String },
    date: { type: Date },
    branchId: { type: String },
    branchAddress: { type: String },
    phoneForBranch: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    status: { type: Number, default: 0 } /* 0 - Assigned ,  1 - Completed , 2 - Rescheduled , 3 - Not Available */
}, {
    collection: 'assignServiceForBranch',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('assignServiceForBranch', assignServiceForBranchSchema);
module.exports = model; 