const MrModel = require('../models/mr');
const DoctorModel = require('../models/doctor');
const PatienModel = require("../models/patient");


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
            doc: Date.now(),
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


const getMrReports = async (req, res) => {
    const { mrId } = req.params;

    try {
        const mr = await MrModel.findById(mrId).populate({
            path: 'doctors',
            populate: {
                path: 'patients',
                model: 'Patient'
            }
        });

        if (!mr) {
            return res.status(400).json({
                msg: "MR NOT FOUND"
            });
        }

        const totalDoctors = mr.doctors.length;
        const totalPatients = mr.doctors.reduce((acc, doctor) => acc + doctor.patients.length, 0);

        const totalRepurchases = mr.doctors.reduce((acc, doctor) => {
            return acc + doctor.patients.reduce((patientAcc, patient) => {
                return patientAcc + (patient.Repurchase ? patient.Repurchase.length : 0);
            }, 0);
        }, 0);

        res.status(200).json({
            success: true,
            totalDoctors,
            totalPatients,
            totalRepurchases
        });
    } catch (error) {
        const errMsg = error.message;
        console.log("Error in getMrReports");
        return res.status(500).json({
            success: false,
            errMsg
        });
    }
};





const getMrReports2 = async (req, res) => {
    const { mrId } = req.params;

    try {
        const mr = await MrModel.findById(mrId).populate({
            path: 'doctors',
            populate: {
                path: 'patients',
                model: 'Patient'
            }
        });

        if (!mr) {
            return res.status(400).json({
                msg: "MR NOT FOUND"
            });
        }

        const totalDoctors = mr.doctors.length;
        const totalPatients = mr.doctors.reduce((acc, doctor) => acc + doctor.patients.length, 0);

        const totalRepurchases = mr.doctors.reduce((acc, doctor) => {
            return acc + doctor.patients.reduce((patientAcc, patient) => {
                return patientAcc + (patient.Repurchase ? patient.Repurchase.length : 0);
            }, 0);
        }, 0);

        // Include details of doctors and patients
        const doctorsDetails = mr.doctors.map(doctor => ({
            doctorId: doctor._id,
            doctorName: doctor.DRNAME,
            speciality: doctor.SPECIALITY,
            patients: doctor.patients.map(patient => ({
                patientId: patient._id,
                patientName: patient.PatientName,
                type: patient.PatientType,
                repurchaseCount: patient.Repurchase ? patient.Repurchase.length : 0,
                repurchases: patient.Repurchase || []
            }))
        }));

        res.status(200).json({
            success: true,
            totalDoctors,
            totalPatients,
            totalRepurchases,
            doctorsDetails
        });
    } catch (error) {
        const errMsg = error.message;
        console.log("Error in getMrReports");
        return res.status(500).json({
            success: false,
            errMsg
        });
    }
};























module.exports = {
    createDoctor,
    getPatientForThisDoctor,
    getAllDoctors,
    getDoctorById,
    getMrReports,
    getMrReports2
}