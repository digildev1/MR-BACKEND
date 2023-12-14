const express = require("express")
const router = express.Router();


const { handleAdminCreateAccounts, handleAdminLogin } = require('../controller/admin')


router.post("/admin-create-account", handleAdminCreateAccounts);
router.post("/admin-login", handleAdminLogin);


module.exports = router


