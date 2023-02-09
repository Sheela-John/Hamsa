const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    status: { type: Number, default: 0 } /* 0 - Active ,  1 - Deleted , 2 - Disabled */
}, {
    collection: 'role',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('role', roleSchema);
module.exports = model; 