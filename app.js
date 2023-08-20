const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Sequelize = require(`sequelize`);
const Razorpay = require("razorpay");
const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const sequelize = require("./utils/database");
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
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
  let mail = req.body.email;
  let code = Math.ceil(Math.random() * 1000000);
  const client = Sib.ApiClient.instance;
  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.API_KEY;

  const tranEmailApi = new Sib.TransactionalEmailsApi();
  const sender = {
    email: "pbadgly@gmail.com",
  };
  const recievers = [
    {
      email: mail,
    },
  ];
  tranEmailApi
    .sendTransacEmail({
      sender,
      to: recievers,
      subject: "Verification Code",
      textContent: `This is 6 digit otp for password reset : ${code}`,
    })
    .then(() => {
      console.log("succeed");
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      res.status(500).json({ success: false });
    });
});

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

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
