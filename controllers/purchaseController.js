const { v4: uuidv4 } = require("uuid");
const CashfreeService = require("../services/cashfreeService");
const Order = require("../models/order");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// ================= CREATE ORDER =================
exports.createOrder = async (req, res) => {
  try {
    const amount = 500;

    const orderId = "order_" + uuidv4();

    await Order.create({
      orderId,
      status: "PENDING",
      UserId: req.user.id   // ✅ IMPORTANT FIX
    });

    const cashfreeOrder = await CashfreeService.createOrder(orderId, amount);

    res.status(200).json({
      orderId,
      paymentSessionId: cashfreeOrder.payment_session_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// ================= VERIFY PAYMENT =================
exports.verifyPayment = async (req, res) => {
  console.log("🔥 VERIFY API HIT");

  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // update order
    order.status = "SUCCESS";
    await order.save();

    // get user
    const user = await User.findByPk(order.UserId || req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // upgrade user
    user.isPremium = true;
    await user.save();

    // ✅ GENERATE SAME STRUCTURE TOKEN AS LOGIN
    const token = jwt.sign(
      {
        userId: user.id,
        isPremium: user.isPremium
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      success: true,
    });

  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};