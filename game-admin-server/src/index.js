require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const { runSeeders } = require('./seeders');
const uploadDir = path.join(__dirname, '../public/uploads/images');
const fs = require('fs');

// Tạo thư mục uploads nếu không tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Đã tạo thư mục uploads tại ${uploadDir}`);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Kiểm tra kết nối database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối cơ sở dữ liệu thành công.');
    return true;
  } catch (error) {
    console.error('❌ Không thể kết nối đến cơ sở dữ liệu:', error);
    return false;
  }
};

// Khởi động server
const startServer = async () => {
  try {
    // Kiểm tra kết nối database
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Không thể khởi động server do lỗi kết nối database');
      process.exit(1);
    }

    // Đồng bộ hóa models với database - tắt chế độ tự động thay đổi bảng
    // Thay đổi từ { alter: true } thành { alter: false }
    await sequelize.sync({ alter: false });
    console.log('✅ Models đã được đồng bộ với database');

    // Chạy seeder nếu được yêu cầu
    if (process.env.RUN_SEEDERS === 'true') {
      console.log('🌱 Bắt đầu chạy seeders theo yêu cầu...');
      await runSeeders();
      console.log('✅ Hoàn tất chạy seeders');
    }

    // Khởi động server
    app.listen(PORT, () => {
      console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Lỗi khi khởi động server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 