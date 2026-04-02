const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const Expense = sequelize.define("Expense", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  amount: Sequelize.FLOAT,
  description: Sequelize.STRING,
  category: Sequelize.STRING
});

module.exports = Expense;