const mongoose = require('mongoose');

const servicesSchema = new mongoose.Schema({
    serviceName: { type: String },
    duration: { type: Number },
    status: { type: Number, default: 0 } /* 0 - Active ,  1 - Deleted , 2 - Disabled */
}, {
    collection: 'services',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('services', servicesSchema);
module.exports = model; 