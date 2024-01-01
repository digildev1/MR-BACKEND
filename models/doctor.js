const mongoose = require('mongoose');



const doctorSchema = new mongoose.Schema({
    SCCODE: {
        type: String,
        unqiue: true,
    },
    DRNAME: {
        type: String,
    },
    QUALIFICATION: String,
    SPECIALITY: String,
    SPECBYPRACTICE: String,
    PLANNEDVISITS: Number,
    CLASS: String,
    LOCALITY: String,
    STATION: String,
    STATE: String,
    ADDRESS: String,
    PIN: Number,
    MOBILENO: Number,
    EMAIL: String,
    TOTAL_POTENTIAL: Number,
    BUSTODIV: Number,
    PATIENTSPERDAY: Number,
    doc: Date,

    // mobileNumber: Number,
    // Gender: String,
    // scCode: String,
    // city: String,
    // speciality: String,
    // location: String,

    patients: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }
    ]
})

module.exports = mongoose.model('Doctor', doctorSchema);