/**
 * Script di chuyển dữ liệu từ các bảng câu hỏi cũ sang bảng Question mới
 */
const { sequelize } = require('./config/database');
const { syncDatabase } = require('./models');
const { migrateAllQuestions } = require('./utils/migrationHelper');

const runMigration = async () => {
  try {
    console.log('🔄 Kiểm tra kết nối database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công.');
    
    // Đồng bộ hóa mô hình với database (không xóa dữ liệu)
    console.log('🔄 Đồng bộ hóa mô hình với database...');
    await syncDatabase(false);
    
    // Thực hiện di chuyển dữ liệu
    console.log('🔄 Bắt đầu quá trình di chuyển dữ liệu...');
    await migrateAllQuestions();
    
    console.log('✅ Quá trình di chuyển dữ liệu hoàn tất.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình di chuyển dữ liệu:', error);
    process.exit(1);
  }
};

// Thực thi script
runMigration(); 