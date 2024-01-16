const express = require("express")
const router = express.Router();


const { handleAdminCreateAccounts, handleAdminLogin, handleAdminReports, handleAdminSideDetailReports, handleSuperAdminCount, handleSuperAdminCreate, handleCreateContentAdmin, verifyJwtForClient, handleReportAdminCreate, handleAdminPatientWiseReports, handleDoctorWisePatientCount, handleMrAndPatientReports, handleDetailedReport, PrescriberReport } = require('../controller/admin');
const { isAuthenticated } = require("../middleware/auth");


router.post("/admin-create-account", handleAdminCreateAccounts);
router.post("/admin-login", handleAdminLogin);


// admin side Reports
router.get("/admin-reports/:id", handleAdminReports);
router.get("/admin-mr-doctor-patients-reports/:id", handleAdminSideDetailReports);


// admin route for 

router.post("/create-super-dc-admin", isAuthenticated, handleSuperAdminCount, handleSuperAdminCreate);
router.post("/create-content-dc-admin", isAuthenticated, handleCreateContentAdmin);
router.post("/create-report-dc-admin", isAuthenticated, handleReportAdminCreate);



router.get("/verify-jwt/:token", verifyJwtForClient);



// reports 

router.get("/admin-patient-wise-reports", handleAdminPatientWiseReports);


router.get("/Doctor-Wise-Patient-Recruited-Count", handleDoctorWisePatientCount);


router.get("/Mr-And-Patient-Reports", handleMrAndPatientReports);

router.get("/Admin-Detailed-Reports", handleDetailedReport);

router.get("/Admin-Prescriber-Report", PrescriberReport);




module.exports = router


