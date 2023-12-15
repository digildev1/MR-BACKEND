const express = require("express")
const router = express.Router();


const { handleAdminCreateAccounts, handleAdminLogin, handleAdminReports } = require('../controller/admin')


router.post("/admin-create-account", handleAdminCreateAccounts);
router.post("/admin-login", handleAdminLogin);



// admin side Reports

router.get("/admin-reports/:id", handleAdminReports);


module.exports = router


