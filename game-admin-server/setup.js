const { sequelize, syncDatabase } = require('./src/models');
const { seedAll } = require('./src/utils/seedData');
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();

const setupDatabase = async () => {
  console.log('🚀 Bắt đầu thiết lập cơ sở dữ liệu...');
  
  try {
    // Force sync để tạo mới các bảng
    console.log('🔄 Đang tạo cấu trúc bảng...');
    await syncDatabase(true);
    
    // Khởi tạo dữ liệu mẫu
    console.log('📝 Đang tạo dữ liệu mẫu...');
    await seedAll();
    
    console.log('✅ Thiết lập cơ sở dữ liệu thành công!');
    console.log('👉 Bạn có thể đăng nhập vào hệ thống với tài khoản:');
    console.log('   - Username: admin');
    console.log('   - Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi thiết lập cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

setupDatabase(); 