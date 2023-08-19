const Expense = require("../models/expense");

module.exports.postExpense = async (req, res) => {
  try {
    let response = await Expense.create({
      name: req.body.name,
      amount: req.body.amount,
      type: req.body.type,
      userId: req.user.id,
    });
    res.json({ response });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
};

module.exports.getExpense = async (req, res) => {
  try {
    let response = await Expense.findAll({
      where: { userId: req.user.id },
    });
    res.json({ response, premium: req.user.isPremium });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
};

module.exports.deleteExpense = async (req, res) => {
  {
    try {
      let response = await Expense.destroy({
        where: { id: req.params.expenseId, userId: req.user.id },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, err });
    }
  }
};
