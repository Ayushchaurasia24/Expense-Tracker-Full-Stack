const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");
const auth = require("../middleware/auth");

// CREATE ORDER
router.post("/create-order", auth.authenticate, purchaseController.createOrder);

// VERIFY PAYMENT
router.post("/verify", auth.authenticate, purchaseController.verifyPayment);

module.exports = router;