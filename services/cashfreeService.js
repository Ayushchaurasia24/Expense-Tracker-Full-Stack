const { Cashfree, CFEnvironment } = require("cashfree-pg");

if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error("Cashfree keys missing in .env");
}

const cashfree = new Cashfree({
  env: CFEnvironment.SANDBOX,
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY
});

exports.createOrder = async (orderId, amount, currency, customerId, phone) => {
  try {
    const request = {
      order_amount: amount,
      order_currency: currency,
      order_id: orderId,
      customer_details: {
        customer_id: customerId.toString(),
        customer_phone: phone
      }
    };

    const response = await cashfree.PGCreateOrder("2023-08-01", request);

    return response.data.payment_session_id;

  } catch (err) {
    console.log("CASHFREE ERROR:", err.response?.data || err);
    throw err;
  }
};