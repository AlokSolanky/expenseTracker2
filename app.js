require("dotenv").config();
const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const Sequelize = require(`sequelize`);
const Razorpay = require("razorpay");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");

const path = require("path");
const bcrypt = require("bcrypt");

const sequelize = require("./utils/database");
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const PasswordRequest = require("./models/forgotPasswordRequests");
const DownloadUrl = require("./models/reportUrl");
const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");
const userAuth = require("./utils/auth");
const premiumroutes = require("./routes/premium");
const passwordRoutes = require("./routes/password");

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", userRoutes);
app.use("/api/expense", expenseRoutes);
app.use(premiumroutes);

app.use("/password", passwordRoutes);
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(PasswordRequest);
PasswordRequest.belongsTo(User);

User.hasMany(DownloadUrl);
DownloadUrl.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    console.log("Database Connected...");
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Server start on port 4000`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
