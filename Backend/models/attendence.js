const mongoose = require('mongoose');

const attendenceSchema = new mongoose.Schema({
    date: { type: Date },
    switchStatus: { type: String},
    staffId: { type: String },
    startTime: { type: String },
    endTime: { type: String }
}, {
    collection: 'attendence',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('attendence', attendenceSchema);
module.exports = model; 