const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: Sequelize.STRING,
  status: Sequelize.STRING
});

module.exports = Order;