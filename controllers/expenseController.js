const Sequelize = require("sequelize");
const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../config/database");

// ================== LEADERBOARD (OPTIMIZED) ==================
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: [
        "id",
        "name",
        [
          Sequelize.fn("SUM", Sequelize.col("expenses.amount")),
          "totalExpense"
        ]
      ],
      include: [
        {
          model: Expense,
          attributes: []
        }
      ],
      group: ["User.id"],
      order: [[Sequelize.literal("totalExpense"), "DESC"]]
    });

    res.json(leaderboard);

  } catch (err) {
    console.log("LEADERBOARD ERROR:", err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};
const { getCategoryFromAI } = require("../services/aiService");

// ================== ADD EXPENSE ==================
exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { amount, description } = req.body;

    const aiCategory = await getCategoryFromAI(description);

    const expense = await Expense.create({
      amount,
      description,
      category: aiCategory,
      UserId: req.userId
    }, { transaction: t });

    await t.commit();

    res.status(201).json(expense);

  } catch (err) {
    await t.rollback();
    console.log("ADD ERROR:", err);
    res.status(500).json({ message: "Error adding expense" });
  }
};
// ================== GET EXPENSES ==================
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { UserId: req.userId }
    });

    res.json(expenses);

  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

// ================== DELETE EXPENSE ==================
exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const id = req.params.id;

    const expense = await Expense.findOne({
      where: { id, UserId: req.userId },
      transaction: t
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: "Not allowed" });
    }

    await expense.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    await t.rollback();
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: "Error deleting expense" });
  }
};