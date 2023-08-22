const express = require("express");
const passwordControllers = require("../controllers/password");
const router = express.Router();

router.post("/forgotpassword", passwordControllers.sendEmail);
router.get("/resetpassword/:forgotId", passwordControllers.showResetForm);
router.post("/resetpassword/:forgotId", passwordControllers.submitResetForm);

module.exports = router;
