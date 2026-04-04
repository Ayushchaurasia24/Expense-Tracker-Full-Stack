const express = require("express");
const router = express.Router();

const controller = require("../controllers/purchaseController");
const auth = require("../middleware/auth");

router.post("/pay", auth.authenticate, controller.pay);
router.get("/payment-status/:orderId", auth.authenticate, controller.getPaymentStatus);

module.exports = router;