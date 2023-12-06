const DoctorModel = require("../models/doctor");
const PatientModel = require("../models/patient");
const moment = require('moment');




const createPatients = async (req, res) => {
    try {
        const { PatientName, MobileNumber, PatientAge, PatientType, DurationOfTherapy, TotolCartiridgesPurchase, DateOfPurchase, Delivery, Demo, TherapyStatus, TM } = req.body
        const id = req.params['id'];

        const dateFormat = moment(DateOfPurchase, 'YYYY-MM-DD', true);

        console.log({ dateFormat, DateOfPurchase });

        const doctor = await DoctorModel.findById({ _id: id });
        if (!doctor) return res.status(400).json({
            msg: "Doctor is Not Found",
            success: false
        });

        const patient = new PatientModel({
            PatientName,
            MobileNumber,
            PatientAge,
            PatientType,
            Repurchase: {
                DurationOfTherapy,
                TotolCartiridgesPurchase,
                DateOfPurchase: dateFormat.isValid() ? dateFormat.toDate() : null,
                Delivery,
                Demo,
                TherapyStatus,
                TM
            }
        });






        const savedPatient = await patient.save();

        doctor.patients.push(savedPatient._id);
        await doctor.save();

        return res.status(201).json({ success: true, message: 'Patient created and associated with Doctor' });

    } catch (error) {
        const errMsg = error.message
        console.log("Error in createPatients");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}


const dataPushToPatient = async (req, res) => {
    const id = req.params['id'];
    const {
        DurationOfTherapy,
        TotolCartiridgesPurchase,
        DateOfPurchase,
        Delivery,
        Demo,
        TherapyStatus,
        TM,
        Switch,
        SubComments
    } = req.body;

    console.log({
        DurationOfTherapy,
        TotolCartiridgesPurchase,
        DateOfPurchase,
        Delivery,
        Demo,
        TherapyStatus,
        TM,
        Switch,
        SubComments
    });

    if (isNaN(DurationOfTherapy)) {
        return res.status(400).json({ msg: "DurationOfTherapy must be a valid number" });
    }

    const dateFormat = moment(DateOfPurchase, 'DD/MM/YYYY', true);
    console.log({ dateFormat, DateOfPurchase });

    try {
        const patient = await PatientModel.findById({ _id: id });
        if (!patient) return res.status(400).json({ msg: "Patient not found" });
        if (Switch === 1) {

            // YES CONDITION
            const repurchaseData = {
                DurationOfTherapy,
                TotolCartiridgesPurchase,
                DateOfPurchase,
                Delivery,
                Demo,
                TherapyStatus,
            };
            if (TherapyStatus === 'Dropped out') {
                repurchaseData.SubComments = SubComments;
            }
            if (Delivery === 'Team mate') {
                repurchaseData.TM = TM
            }
            patient.Repurchase.push(repurchaseData);
            await patient.save();
        } else if (Switch === 0) {
            // NO CONDITION
            const repurchaseData = {
                TotolCartiridgesPurchase,
                DateOfPurchase: dateFormat.isValid() ? dateFormat.toDate() : null,
                Delivery,
                Demo,
                TherapyStatus,
            };
            if (TherapyStatus === 'Dropped out') {
                repurchaseData.SubComments = SubComments;
            }
            if (Delivery === 'Team mate') {
                repurchaseData.TM = TM
            }
            patient.Repurchase.push(repurchaseData);
            await patient.save();
        }
        return res.json({patient , success: true});
    } catch (error) {
        const err = error.message
        console.error("Error in dataPushToPatient:");
        return res.status(500).json({ msg: "Internal Server Error", err });
    }
};

const getAllPatient = async (req, res) => {
    try {
        const patient = await PatientModel.find({});
        console.log(patient);
        return res.json(patient)
    } catch (error) {
        const errMsg = error.message
        console.log("Error in createPatients");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}


const getPaitentById = async (req, res) => {

    try {
        const { id } = req.params;
        console.log("id: ", id);
        const patient = await PatientModel.findById({ _id: id });
        console.log(patient);
        return res.status(200).json(patient)
    }
    catch (error) {
        const errMsg = error.message
        console.log("Error in getPaitentById");
        return res.status(500).json({
            success: false,
            errMsg
        })
    }
}


module.exports = {
    createPatients,
    getAllPatient,
    dataPushToPatient,
    getPaitentById
}
