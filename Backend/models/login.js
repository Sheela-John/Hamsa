const mongoose = require('mongoose');


const loginSchema = new mongoose.Schema({
    email: { type: String },
    phone: { type: String },
    empId: { type: String },
    password: { type: String, default: '' },
    role: { type: String, required: true },
    staffRole: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId },
    status: { type: Number, required: true, default: 0 }, // 0 - active, 1 - deleted
    createdAt: { type: Date, required: true }
}, {
    collection: 'login',
    versionKey: false
});

const model = mongoose.model('login', loginSchema);

module.exports = model; 