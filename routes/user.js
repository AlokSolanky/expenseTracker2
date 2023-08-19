const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.post("/signup", userController.signUpUser);
router.post("/signin", userController.signInUser);

module.exports = router;
