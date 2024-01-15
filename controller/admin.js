
const PatientModel = require("../models/patient");
const adminModels = require("../models/admin");
const MrModel = require("../models/mr");
const DoctorModel = require('../models/doctor');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")
const SECRET = process.env.SECRET;


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
                const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.SECRET);
                return res.status(200).json({
                    msg: "Login",
                    success: true,
                    admin,
                    token
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




// const handleAdminSideDetailReports = async (req, res) => {
//     const adminId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(adminId)) {
//         return res.status(400).json({ error: 'Invalid admin ID format' });
//     }

//     try {
//         const adminData = await adminModels
//             .findById(adminId)
//             .lean()
//             .exec();

//         if (!adminData || !adminData.Mrs) {
//             return res.status(404).json({ error: 'Admin not found or has no related data' });
//         }

//         const header = [
//             'adminId',
//             'adminName',
//             'Gender',
//             'MobileNumber',
//             'mrName',
//             'mrCode',
//             'mrHQ',
//             'mrDESG',
//             'mrDoc',
//             'mrTotalDoctor',
//             'doctorName',
//             'doctorScCode',
//             'doctorSpeciality',
//             'doctorLocality',
//             'doctorTotalPatients',
//             'doctorState',
//             'patientName',
//             'patientAge',
//             'PatientType',
//             'PatientDoc',
//             'patientRepurchaseLength',
//             'patientRepurchaseData',
//         ];

//         const rows = [header];

//         for (const mrId of adminData.Mrs) {
//             const mr = await MrModel
//                 .findById(mrId)
//                 .populate({
//                     path: 'doctors',
//                     model: 'Doctor',
//                     populate: {
//                         path: 'patients',
//                         model: 'Patient'
//                     }
//                 })
//                 .exec();
//             if (!mr) {
//                 continue;
//             }
//             const mrRow = [
//                 adminData.AdminId || 'N/A',
//                 adminData.Name || 'N/A',
//                 adminData.Gender || 'N/A',
//                 adminData.MobileNumber || 'N/A',
//                 mr.MRNAME || 'N/A',
//                 mr.MRCODE || 'N/A',
//                 mr.HQ || 'N/A',
//                 mr.DESG || 'N/A',
//                 mr.doc || 'N/A',
//                 mr.doctors ? mr.doctors.length || 'N/A' : 'N/A',
//                 mr.doctors ? mr.doctors[0].DRNAME || 'N/A' : 'N/A',
//                 mr.doctors ? mr.doctors[0].SCCODE || 'N/A' : 'N/A',
//                 mr.doctors ? mr.doctors[0].SPECIALITY || 'N/A' : 'N/A',
//                 mr.doctors ? mr.doctors[0].LOCALITY || 'N/A' : 'N/A',
//                 mr.doctors[0].patients[0] ? (mr.doctors[0].patients[0].length || 'N/A') : 'N/A',
//                 mr.doctors[0] ? mr.doctors[0].STATE || 'N/A' : 'N/A',
//                 mr.doctors.patients ? mr.doctors.patients.PatientName || 'N/A' : 'N/A',
//                 mr.doctors.patients ? mr.doctors.patients.PatientAge || 'N/A' : 'N/A',
//                 mr.doctors.patients ? mr.doctors.patients.PatientType || 'N/A' : 'N/A',
//                 mr.doctors.patients ? mr.doctors.patients.doc || 'N/A' : 'N/A',
//                 mr.doctors.patients ? mr.doctors.patients.Repurchase?.length || 'N/A' : 'N/A',
//                 mr.doctors.patients ? mr.doctors.patients.Repurchase || 'N/A' : 'N/A',
//             ]
//             rows.push(mrRow);
//             if (mr.doctors) {
//                 mr.doctors.forEach(doctor => {
//                     const doctorRow = [
//                         adminData.AdminId || 'N/A',
//                         adminData.Name || 'N/A',
//                         adminData.Gender || 'N/A',
//                         adminData.MobileNumber || 'N/A',
//                         mr.MRNAME || 'N/A',
//                         mr.MRCODE || 'N/A',
//                         mr.HQ || 'N/A',
//                         mr.DESG || 'N/A',
//                         mr.doc || 'N/A',
//                         mr.doctors.length || 'N/A',
//                         doctor.DRNAME || 'N/A',
//                         doctor.SCCODE || 'N/A',
//                         doctor.SPECIALITY || 'N/A',
//                         doctor.LOCALITY || 'N/A',
//                         doctor.patients ? doctor.patients.length || 'N/A' : 'N/A',
//                         doctor.STATE ? doctor.STATE || 'N/A' : 'N/A',
//                         doctor.patients ? doctor.patients.PatientName || 'N/A' : 'N/A',
//                         doctor.patients ? doctor.patients.PatientAge || 'N/A' : 'N/A',
//                         doctor.patients ? doctor.patients.PatientType || 'N/A' : 'N/A',
//                         doctor.patients ? doctor.patients.doc || 'N/A' : 'N/A',
//                         // doctor.patients ? doctor.patients.Repurchase.length || 'N/A' : 'N/A',
//                         doctor.patients ? doctor.patients.Repurchase || 'N/A' : 'N/A',
//                     ];
//                     rows.push(doctorRow);
//                 });
//             }
//         }
//         return res.json(rows);
//     } catch (error) {
//         console.error(error);
//         const errMsg = error.message;
//         return res.status(500).json({ success: false, errMsg, error: 'Internal Server Error' });
//     }
// };



const handleAdminSideDetailReports = async (req, res) => {
    const adminId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return res.status(400).json({ error: 'Invalid admin ID format' });
    }

    try {
        const adminData = await adminModels
            .findById(adminId)
            .lean()
            .exec();

        if (!adminData || !adminData.Mrs) {
            return res.status(404).json({ error: 'Admin not found or has no related data' });
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
            'PatientDoc',
            'patientRepurchaseLength',
            'patientRepurchaseData',
        ];

        const rows = [header];

        for (const mrId of adminData.Mrs) {
            const mr = await MrModel
                .findById(mrId)
                .populate({
                    path: 'doctors',
                    model: 'Doctor',
                    populate: {
                        path: 'patients',
                        model: 'Patient'
                    }
                })
                .exec();
            if (!mr) {
                continue;
            }

            if (mr.doctors) {
                mr.doctors.forEach(doctor => {
                    if (doctor.patients) {
                        doctor.patients.forEach(patient => {
                            const patientRow = [
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
                                doctor.DRNAME || 'N/A',
                                doctor.SCCODE || 'N/A',
                                doctor.SPECIALITY || 'N/A',
                                doctor.LOCALITY || 'N/A',
                                doctor.patients ? doctor.patients.length || 'N/A' : 'N/A',
                                doctor.STATE ? doctor.STATE || 'N/A' : 'N/A',
                                patient.PatientName || 'N/A',
                                patient.PatientAge || 'N/A',
                                patient.PatientType || 'N/A',
                                patient.doc || 'N/A',
                                patient.Repurchase ? patient.Repurchase.length || 'N/A' : 'N/A',
                                patient.Repurchase || 'N/A',
                            ];
                            rows.push(patientRow);
                        });
                    }
                });
            }
        }

        return res.json(rows);
    } catch (error) {
        console.error(error);
        const errMsg = error.message;
        return res.status(500).json({ success: false, errMsg, error: 'Internal Server Error' });
    }
};



const handleSuperAdminCount = async (req, res, next) => {
    const superAdminCount = await adminModels.countDocuments({ Admin_TYPE: 'SUPER_ADMIN' });
    if (superAdminCount >= 3) {
        return req.status(403).json({
            msg: "Can't create more than 3 super admin"
        })
    }
    next();
}



const handleSuperAdminCreate = async (req, res) => {
    try {
        const userId = req.headers['userId'];
        const role = req.headers['userRole'];

        const admin1 = await adminModels.findById({ _id: userId });
        if (!admin1) return res.json({ msg: "Main Admin Not Found" })
        if (role !== '1') {
            return res.json("You are not Default admin");
        }
        const { Name, AdminId, Password, Gender, MobileNumber } = req.body;
        console.log(req.body);
        const admin = await adminModels.findOne({ AdminId: AdminId });
        if (admin) {
            return res.status(400).json({
                msg: "AdminId Already Exitsts",
                success: false,
            })
        }

        const newAdmin = new adminModels({
            Name,
            AdminId,
            Password,
            Gender,
            MobileNumber,
            role: "SUPER_ADMIN"
        })

        if (newAdmin.role === 'SUPER_ADMIN') {
            const superAdminCount = await adminModels.countDocuments({ role: 'SUPER_ADMIN' });
            if (superAdminCount >= 3) {
                return res.status(403).json({
                    msg: "Can't create more than 3 super admin",
                });
            }
            newAdmin.SUPER_ADMIN_COUNT += 1;
        }
        await newAdmin.save();
        return res.status(200).json({
            success: true,
            newAdmin
        });

    } catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        });
    }
}


const handleReportAdminCreate = async (req, res) => {
    try {
        const userId = req.headers['userId'];
        const role = req.headers['userRole'];
        let adminCheck = await adminModels.findById({ _id: userId });
        if (!adminCheck) return res.json({ msg: "No Admin Type Found" });
        if (role !== 'SUPER_ADMIN') return res.json({ msg: "Only SuperAdmin Create Report Admin" });
        const { Name, AdminId, Password, Gender, MobileNumber } = req.body;
        const admin = await adminModels.findOne({ AdminId: AdminId });
        if (admin) {
            return res.status(400).json({
                msg: "Report Admin Already Exitsts",
                success: false,
            })
        }
        const reportAdmin = new adminModels({
            Name,
            AdminId,
            Password,
            Gender,
            MobileNumber,
            role: "REPORT_ADMIN"
        })
        await reportAdmin.save();
        return res.status(200).json({
            success: true,
            reportAdmin
        });
    }
    catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error in Report Admin creation ",
            errMsg
        });
    }
}






const handleCreateContentAdmin = async (req, res) => {
    try {
        const userId = req.headers['userId'];
        const role = req.headers['userRole'];

        let adminCheck = await adminModels.findById({ _id: userId });
        if (!adminCheck) return res.json({ msg: "No Admin Type Found" });

        if (role !== 'SUPER_ADMIN') return res.json({ msg: "Only SuperAdmin Create Content Admin" });


        const { Name, AdminId, Password, Gender, MobileNumber } = req.body;
        console.log({ Name, AdminId, Password, Gender, MobileNumber })
        const admin = await adminModels.findOne({ AdminId: AdminId });
        if (admin) {
            return res.status(400).json({
                msg: "Content Admin Already Exitsts",
                success: false,
            })
        }

        const contentAdmin = new adminModels({
            Name,
            AdminId,
            Password,
            Gender,
            MobileNumber,
            role: "CONTENT_ADMIN"
        })
        await contentAdmin.save();
        return res.status(200).json({
            success: true,
            contentAdmin
        });
    }
    catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        });
    }
}

const verifyJwtForClient = async (req, res) => {

    try {
        const token = req.params.token;
        if (token) {
            const decodedToken = await jwt.verify(token, process.env.SECRET);
            const userRole = decodedToken.role;
            const userId = decodedToken.id;

            return res.json({ userRole, userId })
        } else {
            return res.json({ msg: "token not found" })
        }
    } catch (error) {
        console.error('Error decoding JWT:', error.message);
        const errMessage = error.message
        return res.json({ msg: errMessage })
    }
}

const handleAdminPatientWiseReports = async (req, res) => {
    try {
        const reports = await DoctorModel.find()
            .populate({
                path: 'patients',
                populate: {
                    path: 'Repurchase',
                },
            })
            .exec();
        const formattedReports = [];

        reports.forEach((doctor) => {
            doctor.patients.forEach((patient) => {
                const repurchases = patient.Repurchase;
                const latestRepurchase = repurchases.length > 0 ? repurchases[repurchases.length - 1] : null;

                const formattedReport = {
                    doctorName: doctor.DRNAME,
                    doctorMobile: doctor.MOBILENO,
                    patientName: patient.PatientName,
                    patientType: patient.PatientType,
                    patientMobileNumber: patient.MobileNumber,
                    patientAge: patient.PatientAge,
                    status: latestRepurchase ? [latestRepurchase] : [],
                };

                formattedReports.push(formattedReport);
            });
        });

        return res.status(200).json(formattedReports);
    } catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: 'Internal Server Error',
            errMsg,
        });
    }
};




module.exports = {
    handleAdminCreateAccounts,
    handleAdminLogin,
    handleAdminReports,
    handleAdminSideDetailReports,
    handleSuperAdminCount,
    handleSuperAdminCreate,
    handleReportAdminCreate,
    handleCreateContentAdmin,
    verifyJwtForClient,
    handleAdminPatientWiseReports
}





// [
//     [
//         "adminId",
//         "adminName",
//         "Gender",
//         "MobileNumber",
//         "mrName",
//         "mrCode",
//         "mrHQ",
//         "mrDESG",
//         "mrDoc",
//         "mrTotalDoctor",
//         "doctorName",
//         "doctorScCode",
//         "doctorSpeciality",
//         "doctorLocality",
//         "doctorTotalPatients",
//         "doctorState",
//         "patientName",
//         "patientAge",
//         "PatientType",
//         "PatientDoc",
//         "patientRepurchaseLength",
//         "patientRepurchaseData"
//     ],
//     [
//         "johnadmin57",
//         "JohnDoe",
//         "Male",
//         "1234567890",
//         "Rinku",
//         "T463531",
//         "Goa North",
//         "DevOps",
//         "2024-01-01T09:29:12.517Z",

//         3, // Here the count is 3 so that for ths specific mr 3 doctor should be there.
//         "Test For admin",
//         "T463663",
//         "programmer",
//         "Texple",
//         2,
//         "Texas",
//         "first patient",
//         87,
//         "Old",
//         "2024-01-02T13:49:52.940Z",
//         1,
//         [
//             {
//                 "DurationOfTherapy": 24,
//                 "TotolCartiridgesPurchase": "3",
//                 "DateOfPurchase": null,
//                 "TherapyStatus": "",
//                 "Delivery": "Team mate",
//                 "TM": "JAY",
//                 "_id": "65941480b5b1bf9711e2939d"
//             }
//         ]
//     ],
//     [
//         "johnadmin57",
//         "JohnDoe",
//         "Male",
//         "1234567890",
//         "Rinku",
//         "T463531",
//         "Goa North",
//         "DevOps",
//         "2024-01-01T09:29:12.517Z",
//         3,
//         "second doctor",
//         "38362",
//         "coder",
//         "ryiw",
//         1,
//         "Texas",
//         "SECOND PATIENT",
//         45,
//         "New",
//         "2024-01-03T09:16:21.769Z",
//         1,
//         [
//             {
//                 "DurationOfTherapy": 6,
//                 "TotolCartiridgesPurchase": "3",
//                 "DateOfPurchase": null,
//                 "TherapyStatus": "",
//                 "Delivery": "Self",
//                 "TM": "",
//                 "_id": "659525e5cbe5779c331b2487"
//             }
//         ]
//     ],
//     [
//         "johnadmin57",
//         "JohnDoe",
//         "Male",
//         "1234567890",
//         "Rinku",
//         "T463531",
//         "Goa North",
//         "DevOps",
//         "2024-01-01T09:29:12.517Z",
//         3,
//         "third doctor",
//         "45432343",
//         "Graphic",
//         "Borivali",
//         "N/A",
//         "Missouri",
//         "N/A",
//         "N/A",
//         "N/A",
//         "N/A",
//         "N/A",
//         "N/A"
//     ]
// ]