#!/usr/bin/env node

/**
 * Script chạy seeder - tạo dữ liệu mẫu cho database
 * 
 * Sử dụng:
 * - node seed.js                 : Chạy tất cả seeders
 * - node seed.js admin           : Chỉ chạy admin seeder
 * - node seed.js quiz            : Chỉ chạy quiz seeder
 * - node seed.js behavior        : Chỉ chạy behavior seeder
 * - node seed.js knowledge       : Chỉ chạy knowledge seeder
 * - node seed.js wordle          : Chỉ chạy wordle seeder
 * - node seed.js --force         : Bắt buộc chạy lại seeder kể cả khi đã có dữ liệu
 */

const { sequelize } = require('./src/models');
const seeders = require('./src/seeders');
const { Admin, QuizQuestion, BehaviorQuestion, KnowledgeQuestion, WordleWord } = require('./src/models');

// Lấy tham số dòng lệnh
const args = process.argv.slice(2);
const seedType = args[0] && !args[0].startsWith('--') ? args[0].toLowerCase() : 'all';
const force = args.includes('--force');

// Hàm thực hiện việc reset một model
const resetModel = async (model, modelName) => {
  if (force) {
    try {
      await model.destroy({ where: {}, truncate: true, cascade: true });
      console.log(`🗑️ Đã xóa dữ liệu ${modelName} cũ`);
    } catch (error) {
      console.error(`❌ Lỗi khi xóa dữ liệu ${modelName}:`, error.message);
    }
  }
};

// Bắt đầu seeding
async function startSeeding() {
  try {
    // Kiểm tra kết nối database
    await sequelize.authenticate();
    console.log('✅ Kết nối đến database thành công.\n');
    
    // Reset models nếu có tham số --force
    if (force) {
      console.log('⚠️ Chế độ FORCE được kích hoạt - sẽ xóa dữ liệu cũ\n');
      
      if (seedType === 'all' || seedType === 'admin') {
        await resetModel(Admin, 'Admin');
      }
      if (seedType === 'all' || seedType === 'quiz') {
        await resetModel(QuizQuestion, 'Quiz');
      }
      if (seedType === 'all' || seedType === 'behavior') {
        await resetModel(BehaviorQuestion, 'Behavior');
      }
      if (seedType === 'all' || seedType === 'knowledge') {
        await resetModel(KnowledgeQuestion, 'Knowledge');
      }
      if (seedType === 'all' || seedType === 'wordle') {
        await resetModel(WordleWord, 'Wordle');
      }
    }
    
    // Chạy seeders theo tham số
    if (seedType === 'all') {
      await seeders.runSeeders();
    } else if (seedType === 'admin') {
      await seeders.seedAdmins();
    } else if (seedType === 'quiz') {
      await seeders.seedQuizQuestions();
    } else if (seedType === 'behavior') {
      await seeders.seedBehaviorQuestions();
    } else if (seedType === 'knowledge') {
      await seeders.seedKnowledgeQuestions();
    } else if (seedType === 'wordle') {
      await seeders.seedWordleWords();
    } else {
      console.error(`❌ Loại seeder không hợp lệ: ${seedType}`);
      console.log('\nCách sử dụng:');
      console.log('- node seed.js                 : Chạy tất cả seeders');
      console.log('- node seed.js admin           : Chỉ chạy admin seeder');
      console.log('- node seed.js quiz            : Chỉ chạy quiz seeder');
      console.log('- node seed.js behavior        : Chỉ chạy behavior seeder');
      console.log('- node seed.js knowledge       : Chỉ chạy knowledge seeder');
      console.log('- node seed.js wordle          : Chỉ chạy wordle seeder');
      console.log('- node seed.js --force         : Bắt buộc chạy lại seeder');
      process.exit(1);
    }
    
    // Đóng kết nối khi hoàn tất
    await sequelize.close();
    console.log('\n👋 Seeding hoàn tất và kết nối database đã đóng.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi trong quá trình seeding:', error);
    process.exit(1);
  }
}

// Bắt đầu quá trình seeding
startSeeding(); 