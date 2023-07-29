const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    slotName: { type: String },
    startTime: { type: String },
    endTime: { type: String },
})

const roleSchema = new mongoose.Schema({
   name:{type:String},
    // startTime: { type: Date },
    // endTime: { type: Date },
    slots: { type: [slotSchema] }
    // status: { type: Number, default: 0 } /* 0 - Active ,  1 - Deleted , 2 - Disabled */
}, {
    collection: 'role',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('role', roleSchema);
module.exports = model; 