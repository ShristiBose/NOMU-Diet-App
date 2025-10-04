// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info from payload
    req.user = decoded.user; // <-- now req.user.id will exist

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
