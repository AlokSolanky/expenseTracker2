const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

function generateWebToken(id) {
  return jwt.sign(
    { userId: id },
    "ljalgmklgjal20359ijfljo209jlkjalkvjaijsaoijwg"
  );
}

module.exports.signUpUser = (req, res) => {
  try {
    User.findAll({ where: { email: req.body.email } }).then(([result]) => {
      if (!result) {
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
          await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            totalExpense: 0,
          });
          res.json({ result: "user created succesfully" });
        });
      } else {
        res.json({ result: "user already registered" });
      }
    });
  } catch (err) {
    res.json({ result: err });
  }
};

module.exports.signInUser = (req, res) => {
  User.findAll({ where: { email: req.body.email } })
    .then(([result]) => {
      if (result) {
        bcrypt.compare(req.body.password, result.password, (err, response) => {
          if (err) {
            res.status(500).json({ result: "Error" });
          }
          if (response) {
            res.status(200).json({
              result: "login successfully",
              success: true,
              token: generateWebToken(result.id),
            });
          } else {
            res
              .status(200)
              .json({ result: "password incorrect", success: false });
          }
        });
      } else {
        res.status(200).json({ result: "Not registered, Sign Up first" });
      }
    })
    .catch((err) => {
      res.json({ success: false, err });
    });
};
