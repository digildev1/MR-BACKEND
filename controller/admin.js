
const PatientModel = require("../models/patient");
const adminModels = require("../models/admin");
const MrModel = require("../models/mr");
const DoctorModel = require('../models/doctor');
const mongoose = require('mongoose');

const handleAdminCreateAccounts = async (req, res) => {
    try {
        const { Name, AdminId, Password, Gender, MobileNumber } = req.body;

        // Log incoming data
        console.log('Incoming data:', req.body);

        const admin = "";

        console.log('AdminId to search:', AdminId);
        try {
            admin = await adminModels.findOne({ AdminId });
            console.log('Existing Admin:', admin);
        } catch (error) {
            console.error('Error in findOne:', error);
        }



        console.log('Existing Admin:', admin);


        if (admin) {
            // Log if the condition is met
            console.log('AdminId Already Exists');

            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Pragma', 'no-cache');
            return res.status(400).json({
                msg: "AdminId Already Exists",
                success: false
            });
        }

        const newAdmin = new adminModels({
            Name: Name,
            AdminId: AdminId,
            Password: Password,
            Gender: Gender,
            MobileNumber: MobileNumber
        });

        // Log the new admin data before saving
        console.log('New Admin Data:', newAdmin);

        await newAdmin.save();

        // Log success response
        console.log('Admin successfully created:', newAdmin);

        return res.status(200).json({
            success: true,
            newAdmin
        });
    } catch (error) {
        const errMsg = error.message;

        // Log the error message
        console.log({ errMsg });

        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        });
    }
}

const handleAdminLogin = async (req, res) => {
    try {
        const { AdminId, Password } = req.body;
        console.log(req.body);
        const admin = await adminModels.findOne({ AdminId });
        console.log({ admin })
        if (admin) {
            if (admin.Password === Password) {
                return res.status(200).json({
                    msg: "Login",
                    success: true,
                    admin
                })
            } else {
                return res.status(400).json({
                    msg: "Password is Incorrect",
                    success: false,
                })
            }
        } else {
            return res.status(400).json({
                msg: "Admin Not Found",
                success: false
            })
        }
    } catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        })
    }
}

const handleAdminReports = async (req, res) => {
    s
    try {
        const adminId = req.params.id;
        const admin = await adminModels.findById(adminId);

        if (!admin) {
            return res.json({ msg: "Admin Not Found" });
        }

        const mrs = await MrModel.find({ _id: { $in: admin.Mrs } });

        const mrWithDoctors = await MrModel.aggregate([
            {
                $match: {
                    _id: { $in: admin.Mrs }
                }
            },
            {
                $lookup: {
                    from: "doctors",
                    localField: "doctors",
                    foreignField: "_id",
                    as: "doctors"
                }
            },
            {
                $project: {
                    MRNAME: 1,
                    doctorsCount: { $size: "$doctors" }
                }
            }
        ]);

        // Find the total number of patients under each doctor
        const doctorWithPatients = await DoctorModel.aggregate([
            {
                $match: {
                    _id: { $in: mrs.flatMap(mr => mr.doctors).flatMap(doctor => doctor.patients) }
                }
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "patients",
                    foreignField: "_id",
                    as: "patients"
                }
            },
            {
                $project: {
                    DRNAME: 1,
                    patientsCount: { $size: "$patients" }
                }
            }
        ]);
        return res.json({ admin, mrs, mrWithDoctors, doctorWithPatients });
    } catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        });
    }
};


const handleAdminSideDetailReports = async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid admin ID format' });
    }

    try {
        const adminData = await adminModels.findById(id).lean().exec();

        if (!adminData) {
            return res.status(404).json({ error: 'Admin not found or has no related data' });
        }

        const mrIds = adminData.Mrs || [];
        const mrData = await MrModel.find({ _id: { $in: mrIds } })
            .populate({
                path: 'doctors',
                model: 'Doctor',
                populate: {
                    path: 'patients',
                    model: 'Patient'
                }
            })
            .exec();

        if (!mrData) {
            return res.status(404).json({ error: 'MR data not found' });
        }

        const header = [
            'adminId',
            'adminName',
            'Gender',
            'MobileNumber',
            'mrName',
            'mrCode',
            'mrHQ',
            'mrDESG',
            'mrDoc',
            'mrTotalDoctor',
            'doctorName',
            'doctorScCode',
            'doctorSpeciality',
            'doctorLocality',
            'doctorTotalPatients',
            'doctorState',
            'patientName',
            'patientAge',
            'PatientType',
            'patientRepurchaseLength',
            'patientRepurchaseData',

        ];

        const rows = [header];

        mrData.forEach(mr => {
            const row = [
                adminData.AdminId || 'N/A',
                adminData.Name || 'N/A',
                adminData.Gender || 'N/A',
                adminData.MobileNumber || 'N/A',
                mr.MRNAME || 'N/A',
                mr.MRCODE || 'N/A',
                mr.HQ || 'N/A',
                mr.DESG || 'N/A',
                mr.doc || 'N/A',
                mr.doctors.length || 'N/A',
                mr.doctors[0] ? mr.doctors[0].DRNAME || 'N/A' : 'N/A',
                mr.doctors[0] ? mr.doctors[0].SCCODE || 'N/A' : 'N/A',
                mr.doctors[0] ? mr.doctors[0].SPECIALITY || 'N/A' : 'N/A',
                mr.doctors[0] ? mr.doctors[0].LOCALITY || 'N/A' : 'N/A',
                mr.doctors[0] ? mr.doctors[0].patients.length || 'N/A' : 'N/A',
                mr.doctors[0] ? mr.doctors[0].STATE || 'N/A' : 'N/A',
                mr.doctors[0] && mr.doctors[0].patients[0] ? mr.doctors[0].patients[0].PatientName || 'N/A' : 'N/A',
                mr.doctors[0] && mr.doctors[0].patients[0] ? mr.doctors[0].patients[0].PatientAge || 'N/A' : 'N/A',
                mr.doctors[0] && mr.doctors[0].patients[0] ? mr.doctors[0].patients[0].PatientType || 'N/A' : 'N/A',
                mr.doctors[0] && mr.doctors[0].patients[0] ? mr.doctors[0].patients[0].Repurchase.length || 'N/A' : 'N/A',
                mr.doctors[0] && mr.doctors[0].patients[0] ? mr.doctors[0].patients[0].Repurchase || 'N/A' : 'N/A',


            ];

            rows.push(row);
        });

        return res.json(rows);
    } catch (error) {
        console.error(error);
        const errMsg = error.message;
        return res.status(500).json({ success: false, errMsg, error: 'Internal Server Error' });
    }
};










module.exports = {
    handleAdminCreateAccounts,
    handleAdminLogin,
    handleAdminReports,
    handleAdminSideDetailReports
}

