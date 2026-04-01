const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const sequelize = require("./config/database");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// frontend
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use(userRoutes);

// DB sync
sequelize.sync()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server running");
    });
  })
  .catch(err => console.log(err));