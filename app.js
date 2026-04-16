require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const fs = require("fs");

// ================= APP =================
const app = express();

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
const DownloadedFile = require("./models/downloadedFile");

// ================= ROUTES =================
const purchaseRoutes = require("./routes/purchaseRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

// ================= ASSOCIATIONS =================
User.hasMany(Expense, { as: "expenses" });
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(DownloadedFile);
DownloadedFile.belongsTo(User);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC =================
app.use(express.static(path.join(__dirname, "public")));

// ================= ROOT =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
// ================= ROUTES =================
app.use("/api/purchase", purchaseRoutes);
app.use("/api", userRoutes);
app.use("/api", expenseRoutes);
app.use("/api", passwordRoutes);

// ================= ROOT TEST =================
app.get("/", (req, res) => {
  res.send("Expense Tracker Backend Running 🚀");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

console.log("DB config:", process.env.DB_NAME);

sequelize.sync()
  .then(() => {
    console.log("🟢 DB Connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 Server running on port " + PORT);
    });
  })
  .catch(err => {
    console.error("🔴 DB ERROR:", err);
  });
