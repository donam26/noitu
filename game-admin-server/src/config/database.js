const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load biến môi trường từ .env
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'noitu_game',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+07:00', // Múi giờ Việt Nam
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: true
    },
    // Thêm cấu hình để giải quyết vấn đề quá nhiều khóa
    dialectOptions: {
      connectTimeout: 60000,
      // Giảm số lượng indexes được tạo tự động
      // và cho phép biến đổi cú pháp SQL để tránh lỗi quá nhiều khóa
      supportBigNumbers: true,
      bigNumberStrings: true
    }
  }
);

// Kiểm tra kết nối
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối đến cơ sở dữ liệu thành công.');
  } catch (error) {
    console.error('❌ Không thể kết nối đến cơ sở dữ liệu:', error);
  }
};

// Export các thành phần
module.exports = {
  sequelize,
  testConnection
}; 