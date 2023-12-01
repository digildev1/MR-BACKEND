const express = require('express');
const router = express.Router();


const { createMr, loginMr, getDoctorForThisMr, getAllMR } = require('../controller/mr')

router.post("/create-mr", createMr);
router.post("/login-mr", loginMr);
router.get("/get-mr-doctor/:id", getDoctorForThisMr);
router.get("/get-all-mr", getAllMR)



module.exports = router