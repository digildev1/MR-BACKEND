const MrModel = require('../models/mr');
const DoctorModel = require("../models/doctor")
const PatientModel = require("../models/patient");
const AdminModel = require("../models/admin");

const bcrypt = require('bcrypt');
const fs = require("fs");
const csv = require('csv-parser');
const xlsx = require('xlsx');

const createMr = async (req, res) => {
    try {
        const { DIV, STATE, MRCODE, PASSWORD, MRNAME, HQ, DESG, DOJ, EFF_DATE, MOBILENO } = req.body;
        const mr = await MrModel.findOne({ MRCODE: MRCODE });
        const Id = req.params.id;
        const admin = await AdminModel.findById({ _id: Id });

        if (mr) {
            return res.status(400).json({
                msg: "Mr Already Exists",
                success: false
            })
        }
        const newMr = new MrModel({
            DIV,
            STATE,
            MRCODE,
            PASSWORD,
            MRNAME,
            HQ,
            DESG,
            DOJ,
            EFF_DATE,
            MOBILENO,
            doc: Date.now(),
        });
        // Save the new MR to the database
        await newMr.save();
        admin.Mrs.push(newMr._id);
        await admin.save();
        return res.status(201).json({
            msg: 'MR created successfully',
            success: true,
            mr: newMr,
        });
    } catch (error) {
        const errMsg = error.message
        console.log("Error in CreateMr");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}

const loginMr = async (req, res) => {
    try {
        const { MRCODE, PASSWORD } = req.body;
        const mr = await MrModel.findOne({ MRCODE: MRCODE });
        if (!mr) {
            return res.status(400).json({
                msg: "Mr not Found",
                success: false
            })
        } else {
            if (PASSWORD == mr.PASSWORD) {
                mr.loginLogs.push({
                    timestamp: new Date(),
                    cnt: mr.loginLogs.length + 1
                });
                await mr.save();
                return res.status(200).json({
                    msg: "Login Done",
                    success: true,
                    mr
                })
            } else {
                return res.status(400).json({
                    msg: "Password is not correct",
                    success: false
                })
            }
        }
    }
    catch (error) {
        const errMsg = error.message
        console.log("Error in loginMr");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}

const getDoctorForThisMr = async (req, res) => {
    try {

        const id = req.params['id'];
        console.log(id);
        const mr = await MrModel.findById({ _id: id }).populate('doctors').select("-_id -DIV -STATE -MRCODE -PASSWORD -MRNAME -HQ -DESG -DOJ -EFF_DATE -loginLogs");
        console.log(mr);

        if (!mr) {
            return res.status(400).json({
                msg: "No Doctor Found For This MR",
                success: false
            });
        }


        const doctorsArray = mr.doctors.map(doctor => ({
            id: doctor._id,
            doctorName: doctor.DRNAME,
            doctorSpecialty: doctor.SPECIALITY,
            doctorLocality: doctor.LOCALITY,
            doctorState: doctor.STATE,
            doctorMobileNo: doctor.MOBILENO,
        }));
        return res.status(200).json(doctorsArray);
    } catch (error) {
        const errMsg = error.message;
        console.log("Error in getDoctorForThisMr");
        return res.status(500).json({
            success: false,
            errMsg
        });
    }
};

const getAllMR = async (req, res) => {

    try {
        const mrs = await MrModel.find({}).select("_id MRNAME");
        if (!mrs) return res.status(400);
        return res.json(mrs);
    }
    catch (error) {
        const errMsg = error.message
        console.log("Error in loginMr");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}

const getMrById = async (req, res) => {
    try {
        const mrId = req.params.mrId;
        const mr = await MrModel.findById({ _id: mrId }).exec();
        if (!mr) {
            res.status(400).json({
                success: false,
                msg: "Mr Not Found"
            })
        }
        res.json(mr);
    } catch (error) {
        const errmsg = error.message;
        console.log("Error in getMrById");
        return res.status(500).json({
            success: false,
            errmsg
        })
    }
}

const UpdateMrMobileNumber = async (req, res) => {

    try {

        const { mrId, mobileNumber } = req.body;

        const mr = await MrModel.findById({ _id: mrId });
        if (!mr) {
            res.status(400).json({
                success: false,
                msg: "Mr Not Found"
            })
        }

        mr.MOBILENO = mobileNumber;

        // Save the updated document
        const updatedMr = await mr.save();
        console.log(updatedMr.MOBILENO);

        return res.status(200).json({
            success: true,
            mr: updatedMr,
            msg: "Mobile number updated successfully"
        });

    }

    catch (error) {
        const errmsg = error.message;
        console.log("Error in UpdateMrMobileNumber");
        return res.status(500).json({
            success: false,
            errmsg
        })
    }
}

const handleExcelSheetUpload = async (req, res) => {
    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const id = req.params.id;

        const admin = await AdminModel.findById({ _id: id })
        if (!admin) return res.status(401).json({ msg: "Admin Not Found" })


        console.log(admin);

        for (const row of sheetData) {
            let existingMr = await MrModel.findOne({ MRCODE: row.MRCODE });

            if (!existingMr) {
                existingMr = await new MrModel({
                    DIV: row.DIV,
                    STATE: row.STATE,
                    MRCODE: row.MRCODE,
                    PASSWORD: row.PASSWORD,
                    MRNAME: row.MRNAME,
                    HQ: row.HQ,
                    DESG: row.DESG,
                    DOJ: row.DOJ,
                    EFF_DATE: row.EFF_DATE,
                    MOBILENO: row.MOBILENO,
                    doc: Date.now()
                });

                await existingMr.save();
                await admin.Mrs.push(existingMr._id);

                console.log(admin.Mrs)
            }

            const newDoctor = await new DoctorModel({
                DRNAME: row.DRNAME,
                MOBILENO: row.MOBILENO,
                SCCODE: row.SCCODE,
                STATE: row.STATE,
                LOCALITY: row.LOCALITY,
            });

            await newDoctor.save();

            existingMr.doctors.push(newDoctor._id);
            await existingMr.save();

            const newPatient = await new PatientModel({
                PatientName: row.PatientName,
                MobileNumber: row.MobileNumber,
                PatientAge: row.PatientAge,
                PatientType: row.PatientType,
                doc: Date.now(),
                Repurchase: [
                    {
                        DurationOfTherapy: row.DurationOfTherapy,
                        TotolCartiridgesPurchase: row.TotolCartiridgesPurchase,
                        DateOfPurchase: row.DateOfPurchase,
                        TherapyStatus: row.TherapyStatus,
                        Delivery: row.Delivery,
                        TM: row.TM,
                    }
                ]
            });

            await newPatient.save();
            newDoctor.patients.push(newPatient._id);
            await newDoctor.save();
        }

        await admin.save();

        res.status(200).json({ message: 'Data uploaded successfully' });
    } catch (error) {
        console.error(error);
        const errMsg = error.message;
        res.status(500).json({ error: 'Internal server error', errMsg });
    }
};





module.exports = {
    createMr,
    loginMr,
    getDoctorForThisMr,
    getAllMR,
    getMrById,
    UpdateMrMobileNumber,
    handleExcelSheetUpload
}