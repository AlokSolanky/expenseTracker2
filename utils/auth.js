const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports.Authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    const userObj = jwt.verify(
      token,
      "ljalgmklgjal20359ijfljo209jlkjalkvjaijsaoijwg"
    );
    console.log("USER ID ->>>>>>>>>>", userObj.userId);

    User.findByPk(userObj.userId)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    return res.status(401).json({ success: true });
  }
};
