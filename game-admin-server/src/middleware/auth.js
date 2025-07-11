const { verifyToken } = require('../utils/jwt');
const { Admin } = require('../models');

/**
 * Middleware xác thực người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Không tìm thấy token xác thực' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn' 
      });
    }

    // Tìm admin với ID được mã hóa trong token
    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Không tìm thấy người dùng với token này' 
      });
    }

    // Lưu thông tin người dùng vào request
    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi xác thực token' 
    });
  }
};

/**
 * Middleware kiểm tra quyền admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'admin' && req.admin.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Bạn không có quyền truy cập tính năng này' 
    });
  }
  next();
};

/**
 * Middleware kiểm tra quyền super admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Chỉ Super Admin mới có quyền truy cập tính năng này' 
    });
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin,
  isSuperAdmin
}; 