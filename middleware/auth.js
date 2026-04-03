const jwt = require("jsonwebtoken");
exports.authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    console.log("TOKEN RECEIVED:", token); // 🔥 ADD

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, "secretkey123");

    console.log("DECODED:", decoded); // 🔥 ADD

    req.userId = decoded.userId;

    next();

  } catch (err) {
    console.log("AUTH ERROR:", err.message); // 🔥 ADD
    res.status(401).json({ message: "Unauthorized" });
  }
};