const jwt = require("jsonwebtoken");
const User = require("../models/user"); // ✅ ADD THIS

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    console.log("TOKEN RECEIVED:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "Token missing" });
    }

    let token;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    console.log("EXTRACTED TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FETCH USER FROM DB
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ ATTACH FULL USER OBJECT
    req.user = user;

    next();

  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};