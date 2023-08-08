const mongoose = require('mongoose');

const distanceSchema = new mongoose.Schema({
      from:{type:Number},
      to:{type:Number},
      cost:{type:Number}
})

const travelAllowanceSchema = new mongoose.Schema({
    costType:{ type:Number,default: 0 }, //0- per km, 1- by distance
    travelExpenseMode:{type:String },
    newPerKmCost:{type:Number},
    distance:{ type: [distanceSchema] }
}, {
    collection: 'travelAllowance',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('travelAllowance', travelAllowanceSchema);
module.exports = model; 