const express = require("express")
const router = express.Router();

const { createPatients, getAllPatient, dataPushToPatient, getPaitentById } = require("../controller/patient");

router.post('/create-patient/:id', createPatients);
router.get('/get-all-patients', getAllPatient);
router.put('/update-patient-repurchase/:id', dataPushToPatient);


router.get("/get-patient-by-id/:id", getPaitentById);


module.exports = router;