const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

exports.createOrder = async (orderId, amount) => {
  try {
    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: "cust_" + Date.now(),
        customer_email: "test@test.com",
        customer_phone: "9999999999"
      }
    };

    const response = await cashfree.PGCreateOrder(request);
    return response.data;

  } catch (err) {
    console.error("Cashfree error:", err.response?.data || err.message);
    throw err;
  }
};