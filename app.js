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

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/api/expense", expenseRoutes);
app.get("/member/premium", userAuth.Authenticate, async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: "rzp_test_XKWVeRA5M9QnkT",
      key_secret: "AoAWvXFbrXGB5Gvp3n12WAFY",
    });
    const amount = 100;
    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      req.user
        .createOrder({ orderId: order.id, status: "PENDING" })
        .then(() => {
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
});

app.post("/member/updateStatus", userAuth.Authenticate, async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;
    Order.findOne({ where: { orderId: order_id } })
      .then((order) => {
        order
          .update({ paymentId: payment_id, status: "SUCCESSFUL" })
          .then(() => {
            req.user
              .update({ isPremium: true })
              .then(() => {
                return res
                  .status(202)
                  .json({ success: true, message: "Transaction Successful" });
              })
              .catch((err) => {
                throw new Error(err);
              });
          })
          .catch((err) => {
            throw new Error(err);
          });
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    throw new Error(err);
  }
});

app.get("/premium/leaderBoard", async (req, res) => {
  try {
    const result = await User.findAll({
      attributes: [
        "name",
        "email",
        [
          sequelize.fn("SUM", sequelize.col("expenses.amount")),
          "total_expense_amount",
        ],
      ],
      include: [
        {
          model: Expense,
          attributes: [],
        },
      ],
      group: ["users.id"],
      order: [[sequelize.literal("total_expense_amount"), "DESC"]],
    });

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
  }
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
