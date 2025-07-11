const { Admin } = require('../models');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

/**
 * Đăng nhập Admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Kiểm tra thông tin nhập vào
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }
    
    // Tìm admin trong database
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập không tồn tại'
      });
    }
    
    // So sánh mật khẩu
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác'
      });
    }
    
    // Tạo token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role
    });
    
    // Cập nhật last_login
    admin.last_login = new Date();
    await admin.save();
    
    // Trả về thông tin và token
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        token
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Đổi mật khẩu Admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;
    
    // Kiểm tra thông tin đầu vào
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới'
      });
    }
    
    // Xác thực mật khẩu hiện tại
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }
    
    // Cập nhật mật khẩu mới
    admin.password = newPassword;
    await admin.save();
    
    return res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Tạo tài khoản Admin mới (chỉ SuperAdmin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Kiểm tra thông tin đầu vào
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }
    
    // Kiểm tra tài khoản tồn tại
    const existingAdmin = await Admin.findOne({
      where: {
        username
      }
    });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }
    
    // Tạo admin mới
    const newAdmin = await Admin.create({
      username,
      email,
      password,
      role: role || 'admin'
    });
    
    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản admin thành công',
      data: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Lỗi tạo admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Lấy thông tin profile admin hiện tại
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    // Lấy thông tin từ database
    const admin = await Admin.findByPk(adminId, {
      attributes: ['id', 'username', 'email', 'role', 'last_login', 'created_at']
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  login,
  changePassword,
  createAdmin,
  getProfile
}; 