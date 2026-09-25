const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (user) => {
  const userId = user.id || user._id;
  return jwt.sign(
    { email: user.email, id: userId, role: user.role || "CUSTOMER" },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = generateToken;
