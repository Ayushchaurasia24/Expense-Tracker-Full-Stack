const { v4: uuidv4 } = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");

const ForgotPassword = require("../models/forgotPassword");
const User = require("../models/user");
const sequelize = require("../config/database");


// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email }, transaction: t });

    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const id = uuidv4();

    await user.createForgotPassword({
      id,
      isActive: true
    }, { transaction: t });

    // Email setup
    const client = Sib.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    const tranEmailApi = new Sib.TransactionalEmailsApi();

    await tranEmailApi.sendTransacEmail({
      sender: { email: "chaurasiakd9425@gmail.com" },
      to: [{ email: email }],
      subject: "Reset Password",
      htmlContent: `
        <h2>Expense Tracker</h2>
        <p>You requested a password reset.</p>
        <p>Click below:</p>
        <a href="http://localhost:3000/password/resetpassword/${id}" 
            style="padding:10px 20px;background:#007bff;color:white;text-decoration:none;">
            Reset Password
        </a>
        <p>If you did not request this, you can ignore this email.</p>
        `
    });
    console.log("✅ EMAIL SENT SUCCESSFULLY");

    await t.commit();

    res.status(200).json({ message: "Reset link sent" });

  } catch (err) {
    await t.rollback();
    console.log("FORGOT ERROR:", err);
    res.status(500).json({ message: "Error" });
  }
};



// ================= RESET PASSWORD PAGE =================
exports.resetPassword = async (req, res) => {
  try {
    const id = req.params.id;

    const request = await ForgotPassword.findOne({ where: { id } });

    if (!request || !request.isActive) {
      return res.send("Link expired");
    }

    res.send(`
      <form action="/password/updatepassword/${id}" method="POST">
        <input type="password" name="newPassword" placeholder="Enter new password" required />
        <button type="submit">Reset Password</button>
      </form>
    `);

  } catch (err) {
    fs.appendFileSync("error.log", `${new Date()} - ${err.message}\n`);
    res.status(500).send("Error loading page");
  }
};



// ================= UPDATE PASSWORD =================
exports.updatePassword = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const id = req.params.id;
    const { newPassword } = req.body;

    const request = await ForgotPassword.findOne({ where: { id }, transaction: t });

    if (!request || !request.isActive) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid link" });
    }

    const user = await User.findByPk(request.UserId, { transaction: t });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedPassword }, { transaction: t });

    request.isActive = false;
    await request.save({ transaction: t });

    await t.commit();

    res.send("Password updated successfully");

  } catch (err) {
    await t.rollback();
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Error updating password" });
  }
};