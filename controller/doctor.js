const MrModel = require('../models/mr');
const DoctorModel = require('../models/doctor');




const createDoctor = async (req, res) => {
    try {
        const { SCCODE, DRNAME, QUALIFICATION, SPECIALITY, SPECBYPRACTICE, PLANNEDVISITS, CLASS, LOCALITY, STATION, STATE, ADDRESS, PIN, MOBILENO, EMAIL, TOTAL_POTENTIAL, BUSTODIV, PATIENTSPERDAY } = req.body
        const { id } = req.params;

        const newDoctor = new DoctorModel({
            SCCODE,
            DRNAME,
            QUALIFICATION,
            SPECIALITY,
            SPECBYPRACTICE,
            PLANNEDVISITS,
            CLASS,
            LOCALITY,
            STATION,
            STATE,
            ADDRESS,
            PIN,
            MOBILENO,
            EMAIL,
            TOTAL_POTENTIAL,
            BUSTODIV,
            PATIENTSPERDAY,
        });

        const savedDoctor = await newDoctor.save();
        const mr = await MrModel.findById(id);
        if (mr) {
            mr.doctors.push(savedDoctor._id);
            await mr.save();
        } else {
            return res.status(404).json({ success: false, message: 'MR not found' });
        }
        return res.status(201).json({ success: true, message: 'Doctor created and associated with MR' });
    }
    catch (error) {
        console.error('Error in createDoctor:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getPatientForThisDoctor = async (req, res) => {
    try {
        const id = req.params['id'];
        const doctor = await DoctorModel.findById({ _id: id }).populate('patients').select('-_id -SCCODE -DRNAME -QUALIFICATION -SPECIALITY -SPECBYPRACTICE -PLANNEDVISITS -CLASS -LOCALITY -STATION -STATE -ADDRESS -PIN -MOBILENO -EMAIL -TOTAL_POTENTIAL -BUSTODIV -PATIENTSPERDAY');

        console.log(doctor);
        if (!doctor) return res.status(400).json({
            msg: "No Doctor Found For This MR",
            success: false
        })
        return res.status(200).json(doctor)
    }
    catch (error) {
        const errMsg = error.message
        console.log("Error in getPatientForThisDoctor");
        return res.status(500).json({
            success: false,
            errMsg
        });
    }
}

const getAllDoctors = async (req, res) => {
    try {
        const getAllDoctors = await DoctorModel.find({}).select("-patients");
        return res.json(getAllDoctors);
    }
    catch (error) {
        const errMsg = error.message
        console.log("Error in getAllDoctors");
        return res.status(500).json({
            success: false,
            errMsg
        });
    }
}


const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params
        console.log(" id -> ", id)
        const doctor = await DoctorModel.findById(id)
        return res.json(doctor)
    }
    catch (error) {
        const errMsg = error.message
        console.log("Error in getDoctorById");
        return res.status(500).json({
            success: false,
            errMsg
        });
    }
}





module.exports = {
    createDoctor,
    getPatientForThisDoctor,
    getAllDoctors,
    getDoctorById
}