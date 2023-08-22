const AWS = require("aws-sdk");

const Expense = require("../models/expense");
const User = require("../models/user");
const DownloadUrl = require("../models/reportUrl");
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
  // try {
  //   let response = await Expense.findAll({
  //     where: { userId: req.user.id },
  //   });
  //   res.json({ response, premium: req.user.isPremium });
  // } catch (err) {
  //   res.status(500).json({ success: false, err });
  // }
  const page = req.query.page || 1;
  let totalItems;
  Expense.count()
    .then((total) => {
      totalItems = total;
      return Expense.findAll({
        offset: (page - 1) * 10,
        limit: 10,
      });
    })
    .then((products) => {
      res.json({
        products: products,
        currentPage: page,
        hasNextPage: 10 * page < totalItems,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / 10),
      });
    });
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

async function uploadToS3(data, fileName) {
  const BUCKET_NAME = "";
  const USER_KEY = "";
  const USER_SECRET = "";

  let s3Bucket = new AWS.S3({
    accessKeyId: USER_KEY,
    secretAccessKey: USER_SECRET,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: "public-read",
  };
  return new Promise((resolve, rej) => {
    s3Bucket.upload(params, (err, response) => {
      if (err) {
        rej(err);
      } else {
        resolve(response.Location);
      }
    });
  });
}

module.exports.downloadReport = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    const stringified = JSON.stringify(expenses);

    const fileName = `expense.txt/${req.user.id}/${new Date()}`;
    const fileUrl = await uploadToS3(stringified, fileName);
    DownloadUrl.create({ id: fileUrl, userId: req.user.id });
    res.status(200).json({ fileUrl, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: true, fileUrl: "", err });
  }
};
