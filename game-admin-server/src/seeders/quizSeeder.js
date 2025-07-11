/**
 * Quiz Seeder - Tạo dữ liệu mẫu cho câu hỏi trò chơi "Hỏi Ngu"
 */
const fs = require('fs').promises;
const path = require('path');
const { QuizQuestion } = require('../models');

const seedQuizQuestions = async () => {
  try {
    // Kiểm tra số lượng câu hỏi hiện có
    const questionCount = await QuizQuestion.count();
    
    if (questionCount > 0) {
      console.log(`ℹ️ Đã có ${questionCount} câu hỏi Quiz trong hệ thống. Bỏ qua seeding.`);
      return false;
    }
    
    // Dữ liệu mẫu nếu không thể đọc từ file
    const sampleQuestions = [
      {
        question: "Con gì không có cánh mà vẫn bay được?",
        options: ["Con bướm", "Con chim", "Con thoi", "Con ruồi"],
        correct_answer: 2,
        explanation: "Con thoi (máy dệt) bay đi bay lại trong máy dệt"
      },
      {
        question: "Cái gì có đầu có đuôi nhưng không có thân mình?",
        options: ["Con rắn", "Đồng tiền", "Cây kim", "Sợi dây"],
        correct_answer: 1,
        explanation: "Đồng tiền có mặt đầu và mặt đuôi"
      },
      {
        question: "Tại sao gà trống không đẻ trứng?",
        options: ["Vì gà trống ăn ít", "Vì gà trống không có bầu", "Vì gà trống không biết đẻ", "Vì gà trống là con đực"],
        correct_answer: 3,
        explanation: "Gà trống là con đực nên không đẻ trứng"
      },
      {
        question: "Cái gì có 4 chân mà không đi được?",
        options: ["Con mèo bị liệt", "Cái bàn", "Con chó ngủ", "Xe máy"],
        correct_answer: 1,
        explanation: "Cái bàn có 4 chân nhưng không thể đi"
      },
      {
        question: "Làm sao để nhốt 1 con voi vào tủ lạnh?",
        options: [
          "Mở tủ lạnh, nhốt voi vào, đóng tủ lạnh",
          "Cần tủ lạnh to hơn",
          "Không thể làm được",
          "Làm voi nhỏ lại"
        ],
        correct_answer: 0,
        explanation: "Đây là câu hỏi logic đơn giản: mở, nhốt, đóng"
      }
    ];
    
    // Thử đọc dữ liệu từ file
    try {
      const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'quizQuestions.js');
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Trích xuất mảng quizQuestions từ nội dung file
      const questionsMatch = fileContent.match(/export\s+const\s+quizQuestions\s*=\s*(\[[\s\S]*?\]);/);
      
      if (questionsMatch && questionsMatch[1]) {
        // Chuyển đổi string thành mảng object
        const questionsStr = questionsMatch[1].replace(/export\s+const\s+\w+\s*=\s*/, '');
        const questions = eval(questionsStr);
        
        // Chuyển đổi format
        const questionsToCreate = questions.map(q => ({
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || ''
        }));
        
        // Tạo các bản ghi trong database
        await QuizQuestion.bulkCreate(questionsToCreate);
        console.log(`✅ Đã import ${questionsToCreate.length} câu hỏi Quiz từ file gốc`);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Không thể đọc file quizQuestions.js:', error.message);
    }
    
    // Nếu không thể đọc từ file, sử dụng dữ liệu mẫu
    await QuizQuestion.bulkCreate(sampleQuestions);
    console.log(`✅ Đã tạo ${sampleQuestions.length} câu hỏi Quiz mẫu`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu câu hỏi Quiz:', error);
    throw error;
  }
};

module.exports = seedQuizQuestions; 