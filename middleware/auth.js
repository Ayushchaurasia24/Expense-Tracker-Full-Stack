const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    console.log("TOKEN RECEIVED:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "Token missing" });
    }

    // ✅ HANDLE BOTH CASES
    let token;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    console.log("EXTRACTED TOKEN:", token);

    const decoded = jwt.verify(token, "secretkey123");

    req.userId = decoded.userId;

    next();

  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};