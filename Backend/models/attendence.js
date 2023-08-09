const mongoose = require('mongoose');

const attendenceSchema = new mongoose.Schema({
    date: { type: Date },
    switchStatus: { type: String},
    staffId: { type: String },
    startTime: { type: String,default:"09:00" },
    endTime: { type: String,default:"17:30" },
    inTime:{type:String},
    outTime:{type:String},
    inTimeArray:{type:Array},
    outTimeArray:{type:Array}
}, {
    collection: 'attendence',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('attendence', attendenceSchema);
module.exports = model; 