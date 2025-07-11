const bcrypt = require('bcryptjs');
const { Admin, QuizQuestion, BehaviorQuestion, KnowledgeQuestion, WordleWord } = require('../models');
const fs = require('fs').promises;
const path = require('path');

/**
 * Khởi tạo tài khoản Admin mặc định
 */
const seedAdmins = async () => {
  try {
    // Kiểm tra nếu đã có admin
    const adminCount = await Admin.count();
    
    if (adminCount === 0) {
      // Tạo tài khoản admin mặc định
      await Admin.create({
        username: 'admin',
        email: 'admin@noitu.com',
        password: 'admin123',  // Sẽ được hash tự động bởi hook
        role: 'super_admin'
      });
      
      console.log('✅ Đã tạo tài khoản admin mặc định: admin/admin123');
    } else {
      console.log('ℹ️ Đã tồn tại tài khoản admin, bỏ qua seed');
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo admin:', error);
    throw error;
  }
};

/**
 * Khởi tạo câu hỏi Quiz từ file JS hiện có
 */
const seedQuizQuestions = async () => {
  try {
    // Kiểm tra nếu đã có câu hỏi
    const questionCount = await QuizQuestion.count();
    
    if (questionCount === 0) {
      // Đọc file quizQuestions.js
      const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'quizQuestions.js');
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Extract mảng quizQuestions từ nội dung file
      const questionsMatch = fileContent.match(/export\s+const\s+quizQuestions\s*=\s*(\[[\s\S]*?\];)/);
      
      if (questionsMatch && questionsMatch[1]) {
        // Convert string to array object
        const questionsStr = questionsMatch[1].replace(/export\s+const\s+\w+\s*=\s*/, '');
        const questions = eval(questionsStr);
        
        // Tạo các bản ghi trong database
        const questionsToCreate = questions.map((q) => ({
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || null
        }));
        
        await QuizQuestion.bulkCreate(questionsToCreate);
        console.log(`✅ Đã import ${questionsToCreate.length} câu hỏi quiz từ file`);
      } else {
        console.warn('⚠️ Không thể parse file quizQuestions.js');
      }
    } else {
      console.log('ℹ️ Đã tồn tại câu hỏi quiz, bỏ qua seed');
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo câu hỏi quiz:', error);
    throw error;
  }
};

/**
 * Khởi tạo từ vựng Wordle từ file JS hiện có
 */
const seedWordleWords = async () => {
  try {
    // Kiểm tra nếu đã có từ
    const wordCount = await WordleWord.count();
    
    if (wordCount === 0) {
      // Đọc file wordleData.js
      const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'wordleData.js');
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Extract mảng targetWords từ nội dung file
      const wordsMatch = fileContent.match(/export\s+const\s+targetWords\s*=\s*(\[[\s\S]*?\];)/);
      
      if (wordsMatch && wordsMatch[1]) {
        // Convert string to array object
        const wordsStr = wordsMatch[1].replace(/export\s+const\s+\w+\s*=\s*/, '');
        const words = eval(wordsStr);
        
        // Normalize function từ file
        const normalize = (str) => {
          return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .replace(/\s+/g, "")
            .toUpperCase();
        };
        
        // Tạo các bản ghi trong database
        const wordsToCreate = words.map((word) => ({
          word,
          normalized: normalize(word),
          is_target: true
        }));
        
        await WordleWord.bulkCreate(wordsToCreate);
        console.log(`✅ Đã import ${wordsToCreate.length} từ Wordle từ file`);
      } else {
        console.warn('⚠️ Không thể parse file wordleData.js');
      }
    } else {
      console.log('ℹ️ Đã tồn tại từ vựng Wordle, bỏ qua seed');
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo từ vựng Wordle:', error);
    throw error;
  }
};

/**
 * Khởi chạy tất cả hàm seed
 */
const seedAll = async () => {
  try {
    await seedAdmins();
    await seedQuizQuestions();
    await seedWordleWords();
    
    console.log('✅ Đã khởi tạo dữ liệu mẫu thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo dữ liệu mẫu:', error);
    return false;
  }
};

module.exports = {
  seedAdmins,
  seedQuizQuestions,
  seedWordleWords,
  seedAll
}; 