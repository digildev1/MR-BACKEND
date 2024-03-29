const express = require("express")
const router = express.Router();

const { createDoctor, getPatientForThisDoctor, getAllDoctors, getDoctorById, getMrReports,getMrReports2 } = require("../controller/doctor")

router.post("/create-doctor/:id", createDoctor);
router.get("/get-doctor-patient/:id", getPatientForThisDoctor);
router.get('/get-all-doctors', getAllDoctors);
router.get("/get-doctorby-id/:id", getDoctorById);


// reports api 

router.get("/get-reports-data/:mrId", getMrReports);
router.get("/get-mr-data/:mrId", getMrReports2);

module.exports = router