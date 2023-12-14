const mongoose = require("mongoose");



const PatientSchema = new mongoose.Schema({
    PatientName: {
        type: String
    },
    MobileNumber: Number,
    PatientAge: Number,
    PatientType: String,

    Repurchase: [{
        DurationOfTherapy: Number,
        TotolCartiridgesPurchase: String,
        DateOfPurchase: Date,
        TherapyStatus: String,
        Delivery: String,
        TM: String,
        SubComments: String
    }]
});
module.exports = mongoose.model('Patient', PatientSchema)
