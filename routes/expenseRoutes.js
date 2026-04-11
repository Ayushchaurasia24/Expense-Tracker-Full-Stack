const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");
const auth = require("../middleware/auth");

router.post("/add-expense", auth.authenticate, expenseController.addExpense);
router.get("/get-expenses", auth.authenticate, expenseController.getExpenses);
router.delete("/delete-expense/:id", auth.authenticate, expenseController.deleteExpense);
router.get("/leaderboard", auth.authenticate, expenseController.getLeaderboard);
router.get("/total-expense", auth.authenticate, expenseController.getTotalExpense);

// DOWNLOAD FILE (S3)
router.get("/download", auth.authenticate, expenseController.downloadExpenses);

// DOWNLOAD HISTORY
router.get("/download-history", auth.authenticate, expenseController.getDownloadHistory);

module.exports = router;