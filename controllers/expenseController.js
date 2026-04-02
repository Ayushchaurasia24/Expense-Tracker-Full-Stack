const Expense = require("../models/expense");

exports.addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    const expense = await Expense.create({
      amount,
      description,
      category
    });

    res.status(201).json(expense);

  } catch (err) {
    res.status(500).json({ message: "Error adding expense" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;

    await Expense.destroy({ where: { id } });

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting expense" });
  }
};