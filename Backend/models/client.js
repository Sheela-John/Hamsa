const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    clientName: { type: String },
    clientAddress: { type: String },
    phone: { type: String },
    status: { type: Number, default: 0 } /* 0 - Active ,  1 - Deleted , 2 - Disabled */
}, {
    collection: 'client',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('client', clientSchema);
module.exports = model; 