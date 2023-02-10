const mongoose = require('mongoose');

const assignServiceForBranchSchema = new mongoose.Schema({
    staffId: { type: String },
    date: { type: Date },
    branchId: { type: String },
    branchAddress: { type: String },
    phone: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    status: { type: Number, default: 0 } /* 0 - Active ,  1 - Deleted , 2 - Disabled */
}, {
    collection: 'assignServiceForBranch',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('assignServiceForBranch', assignServiceForBranchSchema);
module.exports = model; 