/**
 * Admin Seeder - Tạo tài khoản admin mặc định
 */
const bcrypt = require('bcryptjs');
const { Admin } = require('../models');

const seedAdmins = async () => {
  try {
    // Kiểm tra số lượng admin hiện có
    const adminCount = await Admin.count();
    
    if (adminCount === 0) {
      // Tạo một admin mặc định với quyền super_admin
      await Admin.create({
        username: 'admin',
        email: 'admin@noitu.com',
        password: 'admin123',  // Sẽ được hash tự động bởi hook
        role: 'super_admin',
        last_login: null
      });
      
      console.log('✅ Đã tạo tài khoản admin mặc định (admin/admin123)');
      
      // Tạo thêm một admin thường
      await Admin.create({
        username: 'moderator',
        email: 'mod@noitu.com',
        password: 'mod123',  // Sẽ được hash tự động bởi hook
        role: 'admin',
        last_login: null
      });
      
      console.log('✅ Đã tạo tài khoản moderator (moderator/mod123)');
      
      return true;
    } else {
      console.log('ℹ️ Đã có tài khoản admin trong hệ thống. Bỏ qua seeding admin.');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu admin:', error);
    throw error;
  }
};

module.exports = seedAdmins; 