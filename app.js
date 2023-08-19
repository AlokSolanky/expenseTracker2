const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Sequelize = require(`sequelize`);
const Razorpay = require("razorpay");

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
