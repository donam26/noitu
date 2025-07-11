/**
 * Knowledge Quiz Seeder - Tạo dữ liệu mẫu cho câu hỏi trò chơi "Vua Kiến Thức"
 */
const fs = require('fs').promises;
const path = require('path');
const { KnowledgeQuestion } = require('../models');

const seedKnowledgeQuestions = async () => {
  try {
    // Kiểm tra số lượng câu hỏi hiện có
    const questionCount = await KnowledgeQuestion.count();
    
    if (questionCount > 0) {
      console.log(`ℹ️ Đã có ${questionCount} câu hỏi Knowledge trong hệ thống. Bỏ qua seeding.`);
      return false;
    }
    
    // Dữ liệu mẫu nếu không thể đọc từ file
    const sampleQuestions = [
      {
        question: "Thủ đô của Việt Nam là gì?",
        options: ["Hồ Chí Minh", "Đà Nẵng", "Hà Nội", "Huế"],
        correct_answer: 2,
        explanation: "Hà Nội là thủ đô của Việt Nam",
        category: "Địa lý",
        difficulty: "easy"
      },
      {
        question: "Ai là tác giả của bài thơ 'Tràng Giang'?",
        options: ["Xuân Diệu", "Huy Cận", "Nguyễn Du", "Hàn Mặc Tử"],
        correct_answer: 1,
        explanation: "Huy Cận là tác giả của bài thơ 'Tràng Giang'",
        category: "Văn học",
        difficulty: "medium"
      },
      {
        question: "Nguyên tố hóa học nào có ký hiệu là 'O'?",
        options: ["Oxy", "Sắt", "Vàng", "Bạc"],
        correct_answer: 0,
        explanation: "Oxy có ký hiệu hóa học là 'O'",
        category: "Hóa học",
        difficulty: "easy"
      },
      {
        question: "Cuộc Cách mạng Tháng Tám diễn ra vào năm nào?",
        options: ["1930", "1945", "1954", "1975"],
        correct_answer: 1,
        explanation: "Cách mạng Tháng Tám diễn ra vào năm 1945",
        category: "Lịch sử",
        difficulty: "medium"
      },
      {
        question: "Thủ đô của Nhật Bản là gì?",
        options: ["Kyoto", "Osaka", "Tokyo", "Sapporo"],
        correct_answer: 2,
        explanation: "Tokyo là thủ đô của Nhật Bản",
        category: "Địa lý",
        difficulty: "easy"
      },
      {
        question: "Hiệp định Paris được ký vào năm nào?",
        options: ["1945", "1954", "1973", "1975"],
        correct_answer: 2,
        explanation: "Hiệp định Paris được ký kết vào năm 1973",
        category: "Lịch sử",
        difficulty: "medium"
      },
      {
        question: "Công thức hóa học của nước là gì?",
        options: ["CO2", "O2", "H2O", "NaCl"],
        correct_answer: 2,
        explanation: "Công thức hóa học của nước là H2O",
        category: "Hóa học",
        difficulty: "easy"
      }
    ];
    
    // Thử đọc dữ liệu từ file
    try {
      const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'knowledgeQuestions.js');
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Trích xuất mảng knowledgeQuestions từ nội dung file
      const questionsMatch = fileContent.match(/export\s+const\s+knowledgeQuestions\s*=\s*(\[[\s\S]*?\]);/);
      
      if (questionsMatch && questionsMatch[1]) {
        // Chuyển đổi string thành mảng object
        const questionsStr = questionsMatch[1].replace(/export\s+const\s+\w+\s*=\s*/, '');
        const questions = eval(questionsStr);
        
        // Chuyển đổi format
        const questionsToCreate = questions.map(q => ({
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || '',
          category: q.category || 'Chung',
          difficulty: q.difficulty || 'medium'
        }));
        
        // Tạo các bản ghi trong database
        await KnowledgeQuestion.bulkCreate(questionsToCreate);
        console.log(`✅ Đã import ${questionsToCreate.length} câu hỏi Knowledge từ file gốc`);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Không thể đọc file knowledgeQuestions.js:', error.message);
    }
    
    // Nếu không thể đọc từ file, sử dụng dữ liệu mẫu
    await KnowledgeQuestion.bulkCreate(sampleQuestions);
    console.log(`✅ Đã tạo ${sampleQuestions.length} câu hỏi Knowledge mẫu`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu câu hỏi Knowledge:', error);
    throw error;
  }
};

module.exports = seedKnowledgeQuestions; 