const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../utils/database");
module.exports.postExpense = async (req, res) => {
  const trans = await sequelize.transaction();
  try {
    let response = await Expense.create(
      {
        name: req.body.name,
        amount: req.body.amount,
        type: req.body.type,
        userId: req.user.id,
      },
      { transaction: trans }
    );

    let amount = req.body.amount - 0;
    amount = amount + req.user.totalExpense;

    await User.update(
      { totalExpense: amount },
      { where: { id: req.user.id }, transaction: trans }
    );
    await trans.commit();
    res.json({ response });
  } catch (err) {
    await trans.rollback();
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
    const trans = await sequelize.transaction();
    let amount;
    try {
      let result = await Expense.findAll({
        where: { id: req.params.expenseId },
      });
      amount = result[0].amount;

      let response = await Expense.destroy({
        where: { id: req.params.expenseId, userId: req.user.id },
        transaction: trans,
      });

      amount = req.user.totalExpense - amount;

      await User.update(
        { totalExpense: amount },
        { where: { id: req.user.id }, transaction: trans }
      );
      await trans.commit();
      res.status(200).json({ success: true });
    } catch (err) {
      await trans.rollback();
      console.log(err);
      res.status(500).json({ success: false, err });
    }
  }
};
