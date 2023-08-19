const express = require("express");
const userAuth = require("../utils/auth");
const expenseControllers = require("../controllers/expense");
const router = express.Router();

router.post("/", userAuth.Authenticate, expenseControllers.postExpense);
router.get("/", userAuth.Authenticate, expenseControllers.getExpense);
router.delete(
  "/:expenseId",
  userAuth.Authenticate,
  expenseControllers.deleteExpense
);

module.exports = router;
