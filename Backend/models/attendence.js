const mongoose = require('mongoose');

const attendenceSchema = new mongoose.Schema({
    date: { type: Date },
    isPresent: { type: Boolean, default: false },
    staffId: { type: String }
}, {
    collection: 'attendence',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('attendence', attendenceSchema);
module.exports = model; 