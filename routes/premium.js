const express = require("express");
const userAuth = require("../utils/auth");
const premiumControllers = require("../controllers/premium");
const router = express.Router();

router.post(
  "/member/updateStatus",
  userAuth.Authenticate,
  premiumControllers.updateStatus
);
router.get(
  "/member/premium",
  userAuth.Authenticate,
  premiumControllers.getRazor
);
router.get("/premium/leaderBoard", premiumControllers.showLeaderBoard);

module.exports = router;
