const express = require("express")
const router = express.Router();


const { handleAdminCreateAccounts, handleAdminLogin, handleAdminReports, handleAdminSideDetailReports } = require('../controller/admin')


router.post("/admin-create-account", handleAdminCreateAccounts);
router.post("/admin-login", handleAdminLogin);



// admin side Reports
router.get("/admin-reports/:id", handleAdminReports);
router.get("/admin-mr-doctor-patients-reports/:id", handleAdminSideDetailReports);


module.exports = router


