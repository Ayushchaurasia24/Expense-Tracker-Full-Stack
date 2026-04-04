const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const sequelize = require("./config/database");

//Import models
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");

//DEFINE ASSOCIATIONS HERE
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

const purchaseRoutes = require("./routes/purchaseRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// frontend
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use(purchaseRoutes);
app.use(userRoutes);
app.use(expenseRoutes);

console.log("APP_ID:", process.env.CASHFREE_APP_ID);
console.log("SECRET:", process.env.CASHFREE_SECRET_KEY);
// DB sync
sequelize.sync()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server running");
    });
  })
  .catch(err => console.log(err));