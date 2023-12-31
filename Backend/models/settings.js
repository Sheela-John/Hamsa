const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // twoWheelerAverageDistance: { type: Number },
    // twoWheelerTravelExpenseCost: { type: Number },
    // fourWheelerAverageDistance: { type: Number },
    // fourWheelerTravelExpenseCost: { type: Number },
    // startDate: { type: Date },
    // endDate: { type: Date },
    // status: { type: Number, default: 0 }, /* 0 - Active ,  1 - Deleted , 2 - Disabled */
    averageDistance:{
        type:Number
    },
    

}, {
    collection: 'settings',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('settings', settingsSchema);
module.exports = model; 