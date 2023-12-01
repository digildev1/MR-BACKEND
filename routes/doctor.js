const express = require("express")
const router = express.Router();

const { createDoctor, getPatientForThisDoctor, getAllDoctors, getDoctorById } = require("../controller/doctor")



router.post("/create-doctor/:id", createDoctor);
router.get("/get-doctor-patient/:id", getPatientForThisDoctor);
router.get('/get-all-doctors', getAllDoctors);


router.get("/get-doctorby-id/:id", getDoctorById);



module.exports = router