const Sequelize = require("sequelize");
const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../config/database");
const fs = require("fs");
const DownloadedFile = require("../models/downloadedFile");

// ✅ SERVICES
const S3service = require("../services/S3service");
const { getCategoryFromAI } = require("../services/aiService");


// ================== LEADERBOARD ==================
exports.getLeaderboard = async (req, res) => {
  try {
    console.log("👉 Leaderboard API called");

    const leaderboard = await User.findAll({
      attributes: [
        "id",
        "name",
        [
          Sequelize.fn("SUM", Sequelize.col("expenses.amount")),
          "totalExpense"
        ]
      ],
      include: [{
        model: Expense,
        as: "expenses",
        attributes: []
      }],
      group: ["User.id", "User.name"],
      order: [[Sequelize.literal("totalExpense"), "DESC"]],
      raw: true
    });

    console.log("📊 Leaderboard:", leaderboard);

    res.json(leaderboard);

  } catch (err) {
    console.log("❌ LEADERBOARD ERROR:", err);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};


// ================== ADD EXPENSE ==================
exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { amount, description, note } = req.body;

    // 🔥 AI RESULT (OBJECT)
    const aiResult = await getCategoryFromAI(description);

    console.log("🤖 AI RESULT:", aiResult);

    const expense = await Expense.create({
      amount,
      description,
      note,
      category: aiResult.category,          // ✅ FIXED
      aiConfidence: aiResult.confidence,    // ✅ OPTIONAL (add column if needed)
      UserId: req.user.id
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      expense,
      ai: aiResult // optional (useful for frontend/debug)
    });

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
    if (!req.user.isPremium) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const expenses = await Expense.findAll({
      where: { UserId: req.user.id }
    });

    const stringifiedExpenses = JSON.stringify(expenses);

    const filename = `Expenses_${req.user.id}_${new Date().toISOString()}.txt`;

    const fileURL = await S3service.uploadToS3(
      stringifiedExpenses,
      filename
    );

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