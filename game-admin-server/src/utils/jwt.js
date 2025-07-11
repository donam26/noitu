const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'noitu_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Tạo JWT token
 * @param {Object} payload - Dữ liệu cần mã hóa trong token
 * @returns {String} Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Xác thực và giải mã token
 * @param {String} token - JWT token cần xác thực
 * @returns {Object|null} - Dữ liệu đã giải mã hoặc null nếu token không hợp lệ
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 