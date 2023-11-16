const jwt = require("jsonwebtoken");
const { MONGO_DB_CONFIG } = require("./app.config");

const generateToken = (id) => {
  return jwt.sign({ id }, MONGO_DB_CONFIG.JWT_SECRET, { expiresIn: "1d" });
};

module.exports = { generateToken };
