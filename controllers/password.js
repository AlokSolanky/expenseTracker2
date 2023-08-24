const Sib = require("sib-api-v3-sdk");
const uuid = require("uuid");
const path = require("path");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const PasswordRequest = require("../models/forgotPasswordRequests");

module.exports.sendEmail = async (req, res) => {
  let email = req.body.email;
  const user = await User.findOne({ where: { email } });
  if (user) {
    const id = uuid.v4();
    PasswordRequest.create({ id, isActive: true, userId: user.id });
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey =
      "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";

    const tranEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email: "pbadgly@gmail.com",
    };
    const recievers = [
      {
        email: email,
      },
    ];
    tranEmailApi
      .sendTransacEmail({
        sender,
        to: recievers,
        subject: "Verification Code",
        textContent: `Now you can reset you password`,
        htmlContent: `<a href="http://localhost:4000/password/resetpassword/${id}">Click Here</a>`,
      })
      .then(() => {
        console.log("succeed");
        res.status(200).json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ success: false });
      });
  } else {
    throw new Error("USER not Exist");
  }
};

module.exports.showResetForm = async (req, res) => {
  const id = req.params.forgotId;
  console.log(id);
  PasswordRequest.findOne({ where: { id } })
    .then((forgotpasswordrequest) => {
      if (forgotpasswordrequest) {
        res.sendFile(
          path.join(__dirname, "..", "..", "frontend", "resetPassword.html")
        );
        forgotpasswordrequest.update({ isActive: false });
      } else {
        res.status(401).json({ success: false, msg: "No reset request found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ Errror: err });
    });
};

module.exports.submitResetForm = async (req, res) => {
  let password = req.body.password;
  let id = req.params.forgotId;

  PasswordRequest.findOne({ where: { id } }).then((request) => {
    User.findOne({ where: { id: request.userId } }).then((user) => {
      if (user) {
        bcrypt.hash(password, 10, async (err, hash) => {
          user
            .update({ password: hash })
            .then(() => {
              res.json({ success: true, msg: "working till here" });
            })
            .catch((err) => {
              throw new Error(err);
            });
        });
      } else {
        res.status(404).json({ success: false, err: "No user exist" });
      }
    });
  });
};
