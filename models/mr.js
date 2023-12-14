const mongoose = require('mongoose');


const mrSchema = new mongoose.Schema({

    DIV: String,
    STATE: String,
    MRCODE: {
        type: String,
        unique: true
    },
    PASSWORD: {
        type: String,
        trim: true
    },
    MRNAME: String,
    HQ: String,
    DESG: String,
    DOJ: String,
    EFF_DATE: String,
    MOBILENO: String,


    loginLogs: [
        {
            timestamp: {
                type: Date,
                default: Date.now,
            },
            cnt: {
                type: Number,
                required: false,
                default: 0
            },
        },
    ],
    doctors: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
    ],
});


module.exports = mongoose.model('MR', mrSchema);

