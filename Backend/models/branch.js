const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    branchName: { type: String },
    branchAddress: { type: String },
    status: { type: Number, default: 0 } /* 0 - Active ,  1 - Deleted , 2 - Disabled */
}, {
    collection: 'branch',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('branch', branchSchema);
module.exports = model; 