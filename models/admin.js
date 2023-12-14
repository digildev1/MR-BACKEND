const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    Name: String,
    AdminId: {
        type: String,
        unique: true,
    },
    Password: String,
    Gender: String,
    MobileNumber: String,
    Mrs: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'MR' }
    ]
})

module.exports = mongoose.model('admin', adminSchema)