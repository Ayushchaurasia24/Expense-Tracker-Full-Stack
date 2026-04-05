require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const fs = require("fs");

const app = express(); // ✅ MUST COME BEFORE app.use()

// ================= LOGGING =================
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

// ================= DATABASE =================
const sequelize = require("./config/database");

// ================= MODELS =================
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const ForgotPassword = require("./models/forgotPassword");

// ================= ROUTES =================
const purchaseRoutes = require("./routes/purchaseRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

// ================= ASSOCIATIONS =================
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC =================
app.use(express.static(path.join(__dirname, "public")));

// ================= ROUTES =================
app.use(purchaseRoutes);
app.use(userRoutes);
app.use(expenseRoutes);
app.use(passwordRoutes);


// ================= START SERVER =================
sequelize.sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    fs.appendFileSync("error.log", `${new Date()} - ${err.message}\n`);
  });