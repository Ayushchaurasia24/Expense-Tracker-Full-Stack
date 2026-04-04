const Order = require("../models/order");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Create Order
exports.pay = async (req, res) => {
  try {
    const orderId = "ORDER_" + Date.now();

    await Order.create({
      orderId,
      status: "PENDING",
      UserId: req.userId
    });

    res.json({ orderId });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Payment error" });
  }
};

// Check Status
exports.getPaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "SUCCESSFUL";
    await order.save();

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isPremium = true;
    await user.save();

    // 🔥 NEW TOKEN WITH UPDATED PREMIUM STATUS
    const token = jwt.sign(
      { userId: user.id, isPremium: true },
      "secretkey123"
    );

    res.json({ status: "SUCCESSFUL", token });

  } catch (err) {
    console.log("STATUS ERROR:", err);
    res.status(500).json({ message: "Status error" });
  }
};