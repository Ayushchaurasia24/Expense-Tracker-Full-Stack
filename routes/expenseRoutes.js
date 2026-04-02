const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");

router.post("/add-expense", expenseController.addExpense);
router.get("/get-expenses", expenseController.getExpenses);
router.delete("/delete-expense/:id", expenseController.deleteExpense);

module.exports = router;