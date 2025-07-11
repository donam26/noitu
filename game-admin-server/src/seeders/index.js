/**
 * Seeders Index - Tập hợp tất cả các seeder
 */
const seedAdmins = require('./adminSeeder');
const seedQuizQuestions = require('./quizSeeder');
const seedBehaviorQuestions = require('./behaviorSeeder');
const seedKnowledgeQuestions = require('./knowledgeSeeder');
const seedWordleWords = require('./wordleSeeder');

/**
 * Chạy tất cả các seeders theo thứ tự
 */
const runSeeders = async () => {
  console.log('🌱 Bắt đầu seeding dữ liệu mẫu...\n');
  
  try {
    // Seeding admin accounts
    console.log('👤 Seeding tài khoản admin...');
    await seedAdmins();
    
    // Seeding quiz questions
    console.log('\n📝 Seeding câu hỏi Quiz...');
    await seedQuizQuestions();
    
    // Seeding behavior questions
    console.log('\n🤝 Seeding câu hỏi Behavior (Ứng xử)...');
    await seedBehaviorQuestions();
    
    // Seeding knowledge questions
    console.log('\n🧠 Seeding câu hỏi Knowledge (Kiến thức)...');
    await seedKnowledgeQuestions();
    
    // Seeding wordle words
    console.log('\n🔤 Seeding từ vựng Wordle...');
    await seedWordleWords();
    
    console.log('\n✅ Seeding hoàn tất! Dữ liệu mẫu đã được tạo thành công.');
    return true;
  } catch (error) {
    console.error('\n❌ Lỗi trong quá trình seeding:', error);
    return false;
  }
};

/**
 * Export cho sử dụng trong CLI hoặc gọi trực tiếp
 */
module.exports = {
  seedAdmins,
  seedQuizQuestions,
  seedBehaviorQuestions,
  seedKnowledgeQuestions,
  seedWordleWords,
  runSeeders
};

// Chạy trực tiếp nếu file được gọi từ dòng lệnh
if (require.main === module) {
  runSeeders()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Lỗi không mong muốn:', error);
      process.exit(1);
    });
} 