const mongoose = require('mongoose');



const rolePositionSchema = new mongoose.Schema({
  addRole:{
    type:Array
  },
  role:{
    type:String
  },
  roleStatus:{
    type:String
  }
}, {
    collection: 'rolePosition',
    versionKey: false,
    timestamps: true
});

const model = mongoose.model('rolePosition', rolePositionSchema);
module.exports = model; 