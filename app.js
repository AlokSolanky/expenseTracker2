const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Sequelize = require(`sequelize`);
const Razorpay = require("razorpay");
const Sib = require("sib-api-v3-sdk");
const path = require("path");
require("dotenv").config();
const bcrypt = require("bcrypt");
const uuid = require("uuid");

const sequelize = require("./utils/database");
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const PasswordRequest = require("./models/forgotPasswordRequests");
const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");
const userAuth = require("./utils/auth");
const premiumroutes = require("./routes/premium");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/api/expense", expenseRoutes);
app.use(premiumroutes);

app.post("/password/forgotpassword", async (req, res) => {
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
});

app.get("/password/resetpassword/:forgotId", async (req, res) => {
  const id = req.params.forgotId;
  PasswordRequest.findOne({ where: { id } })
    .then((forgotpasswordrequest) => {
      if (forgotpasswordrequest.isActive) {
        forgotpasswordrequest.update({ isActive: false });
        res.sendFile(path.join(__dirname, ".", "public", "resetPassword.html"));
      } else {
        res.status(401).json({ success: false, msg: "No reset request found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ err });
    });
});
app.post("/password/forgotpassword/:forgotId", async (req, res) => {
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
});
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(PasswordRequest);
PasswordRequest.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    console.log("Database Connected...");
    app.listen(4000, () => {
      console.log(`Server start on port 4000`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
