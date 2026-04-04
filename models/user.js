const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: Sequelize.STRING,
  
  isPremium: {
  type: Sequelize.BOOLEAN,
  defaultValue: false
  },
  totalExpense: {
  type: Sequelize.INTEGER,
  defaultValue: 0
  }
});

module.exports = User;