const jwt = require("jsonwebtoken");
const { MONGO_DB_CONFIG } = require("./app.config");

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, MONGO_DB_CONFIG.JWT_SECRET, { expiresIn: "3d" });
};

module.exports = { generateRefreshToken };