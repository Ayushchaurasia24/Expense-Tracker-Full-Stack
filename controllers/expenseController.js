const Sequelize = require("sequelize");
const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../config/database");
const fs = require("fs");
const DownloadedFile = require("../models/downloadedFile");

// ✅ S3 SERVICE
const S3service = require("../services/S3service");

// ✅ AI SERVICE
const { getCategoryFromAI } = require("../services/aiService");


// ================== LEADERBOARD ==================
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
      include: [{ model: Expense, attributes: [] }],
      group: ["User.id"],
      order: [[Sequelize.literal("totalExpense"), "DESC"]]
    });

    res.json(leaderboard);

  } catch (err) {
    console.log("LEADERBOARD ERROR:", err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};


// ================== ADD EXPENSE ==================
exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { amount, description, note } = req.body;

    const aiCategory = await getCategoryFromAI(description);

    const expense = await Expense.create({
      amount,
      description,
      note,
      category: aiCategory,
      UserId: req.user.id
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const { count, rows } = await Expense.findAndCountAll({
      where: { UserId: req.user.id },
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    res.json({
      expenses: rows,
      currentPage: page,
      hasNextPage: page * limit < count,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(count / limit)
    });

  } catch (err) {
    fs.appendFileSync("error.log", `${new Date()} - ${err.message}\n`);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};


// ================== DELETE EXPENSE ==================
exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const id = req.params.id;

    const expense = await Expense.findOne({
      where: { id, UserId: req.user.id },
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


// ================== DOWNLOAD EXPENSES ==================
exports.downloadExpenses = async (req, res) => {
  try {
    // 🔒 Premium check
    if (!req.user.isPremium) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 📦 Fetch expenses
    const expenses = await Expense.findAll({
      where: { UserId: req.user.id }
    });

    const stringifiedExpenses = JSON.stringify(expenses);

    const filename = `Expenses_${req.user.id}_${new Date().toISOString()}.txt`;

    // ☁️ Upload to S3
    const fileURL = await S3service.uploadToS3(
      stringifiedExpenses,
      filename
    );

    // ✅ SAVE FILE HISTORY (BONUS)
    await DownloadedFile.create({
      fileUrl: fileURL,
      UserId: req.user.id
    });

    res.status(200).json({ fileURL, success: true });

  } catch (err) {
    console.log("DOWNLOAD ERROR:", err);
    res.status(500).json({ message: "Failed to download" });
  }
};


// ================== GET DOWNLOAD HISTORY ==================
exports.getDownloadHistory = async (req, res) => {
  try {
    const files = await DownloadedFile.findAll({
      where: { UserId: req.user.id },
      order: [["createdAt", "DESC"]]
    });

    res.json(files);

  } catch (err) {
    console.log("HISTORY ERROR:", err);
    res.status(500).json({ message: "Error fetching history" });
  }
};