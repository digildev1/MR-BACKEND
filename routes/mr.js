const express = require('express');
const router = express.Router();
const multer = require("multer")

const { createMr, loginMr, getDoctorForThisMr, getAllMR, getMrById, UpdateMrMobileNumber, handleExcelSheetUpload } = require('../controller/mr');

const upload = multer({ dest: 'uploads/' });

router.post("/create-mr/:id", createMr);
router.post("/login-mr", loginMr);
router.get("/get-mr-doctor/:id", getDoctorForThisMr);
router.get("/get-all-mr", getAllMR);
router.get("/get-mr-by-id/:mrId", getMrById);


router.put("/update-mr-mobile-number", UpdateMrMobileNumber);


router.post("/upload-mr-doctor-patients/:id", upload.single('file'), handleExcelSheetUpload);


module.exports = router