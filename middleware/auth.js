const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "Token missing" });
    }

    let token;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ find user
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ SINGLE SOURCE OF TRUTH
    req.user = {
      id: user.id,
      isPremium: user.isPremium,
      name: user.name,
      email: user.email
    };

    next();

  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};