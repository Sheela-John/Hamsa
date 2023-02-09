const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    staffName: { type: String },
    email: { type: String },
    empId: { type: String },
    phone: { type: String },
    Address: { type: String },
    staffRole: { type: String },
    role: { type: String },
    Branch: { type: String },
    gender: { type: Number },
    dob: { type: Date },
    defaultImageUrl: { type: String },
    userProfileImage: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    status: { type: Number, default: 0 } /* 0 - Active ,  1 - Deleted , 2 - Disabled */
}, {
    collection: 'staff',
    versionKey: false,
    timestamps: true
});


const model = mongoose.model('staff', staffSchema);
module.exports = model; 