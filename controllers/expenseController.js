const Expense = require("../models/expense");

exports.addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    const expense = await Expense.create({
      amount,
      description,
      category,
      UserId: req.userId
    });

    res.status(201).json(expense);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding expense" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    console.log("USER ID:", req.userId); // ✅ ONLY HERE

    const expenses = await Expense.findAll({
      where: { UserId: req.userId }
    });

    res.json(expenses);

  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;

    const expense = await Expense.findOne({
      where: { id, UserId: req.userId }
    });

    if (!expense) {
      return res.status(404).json({ message: "Not allowed" });
    }

    await expense.destroy();

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting expense" });
  }
};