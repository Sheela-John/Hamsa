const mongoose = require('mongoose');

const travelAllowanceSchema = new mongoose.Schema({
    travelExpenseCost:{
        type:String
    },
    travelExpenseMode:{
        type:String
    }
}, {
    collection: 'travelAllowance',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('travelAllowance', travelAllowanceSchema);
module.exports = model; 