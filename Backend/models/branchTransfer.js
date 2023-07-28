const mongoose = require('mongoose');

const branchTransferSchema = new mongoose.Schema({
    branchTransferType: { type: Number },
    startDate:{
        type:String
    },
    endDate:{
        type:String
    },
    startTime:{
        type:String
    },
    endTime:{
        type:String
    },
    branchId: { type: String },
    staffId:{
        type:String
    },
    latitude: { type: Number },
    longitude: { type: Number },
    status: { type: Number, default: 0 } /* 0 - Active ,  1 - Deleted , 2 - Disabled */
}, {
    collection: 'branchTransfer',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('branchTransfer', branchTransferSchema);
module.exports = model; 