const express = require("express");
const router = express.Router();

const passwordController = require("../controllers/passwordController");

router.post("/password/forgotpassword", passwordController.forgotPassword);
router.get("/password/resetpassword/:id", passwordController.resetPassword);
router.post("/password/updatepassword/:id", passwordController.updatePassword);

module.exports = router;