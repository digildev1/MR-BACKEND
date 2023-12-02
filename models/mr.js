const mongoose = require('mongoose');


const mrSchema = new mongoose.Schema({

    DIV: String,
    STATE: String,
    MRCODE: {
        type: String,
        unquie: true
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
    // Zone: String,
    // Region: String,
    // MobileNumber: Number,
    // email: {
    //     type: String,
    //     unique: true,
    // },
    // ReportingManager: {
    //     type: String,
    // },
    // RegionalManagerName: {
    //     type: String
    // },
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
