const mongoose = require('mongoose');

const distanceSchema = new mongoose.Schema({
      from:{type:String},
      to:{type:String},
      cost:{type:String}
})

const travelAllowanceSchema = new mongoose.Schema({
    costType:{ type:Number,default: 0 }, //0- per km, 1- by distance
    travelExpenseMode:{type:String },
    distance:distanceSchema
}, {
    collection: 'travelAllowance',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('travelAllowance', travelAllowanceSchema);
module.exports = model; 