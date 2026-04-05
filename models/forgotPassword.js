const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const ForgotPassword = sequelize.define("forgotPassword", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
});

module.exports = ForgotPassword;