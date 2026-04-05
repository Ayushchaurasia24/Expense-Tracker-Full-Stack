const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();


const sequelize = require("./config/database");
const ForgotPassword = require("./models/forgotPassword");

//Import models
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const passwordRoutes = require("./routes/passwordRoutes");


//DEFINE ASSOCIATIONS HERE
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

const purchaseRoutes = require("./routes/purchaseRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// frontend
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use(purchaseRoutes);
app.use(userRoutes);
app.use(expenseRoutes);
app.use(passwordRoutes);

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