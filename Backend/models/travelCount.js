const mongoose = require('mongoose');

const travelCountSchema = new mongoose.Schema({
   staffId:{
    type:String
   },
   date:{
    type:String
   },
   assignServiceId:{
    type:String
   },
   count:{
    type:Number,
    default:0
   }
}, {
    collection: 'travelCount',
    versionKey: false,
    timestamps: true
});


const model = mongoose.model('travelCount', travelCountSchema);
module.exports = model; 