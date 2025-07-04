const fs = require('fs');
const path = require('path');

/**
 * Script để thêm câu hỏi mới vào file quizQuestions.js
 * Không ghi đè, chỉ append thêm câu hỏi mới
 */

// Đọc dữ liệu từ stdin
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const newQuestions = JSON.parse(inputData);
    appendQuizFile(newQuestions);
  } catch (error) {
    console.error('❌ Lỗi parse JSON:', error.message);
    process.exit(1);
  }
});

function appendQuizFile(newQuestions) {
  const filePath = path.join(__dirname, 'src', 'data', 'quizQuestions.js');
  
  try {
    // Đọc file hiện tại
    let existingQuestions = [];
    if (fs.existsSync(filePath)) {
      // Import module để lấy dữ liệu hiện có
      delete require.cache[require.resolve('./src/data/quizQuestions.js')];
      const existingData = require('./src/data/quizQuestions.js');
      existingQuestions = existingData.quizQuestions || [];
    }
    
    // Gộp câu hỏi mới
    const allQuestions = [...existingQuestions, ...newQuestions];
    
    // Tạo nội dung file mới
    const questionsString = allQuestions.map(q => `  {
    question: "${q.question.replace(/"/g, '\\"')}",
    options: [
      "${q.options[0].replace(/"/g, '\\"')}",
      "${q.options[1].replace(/"/g, '\\"')}",
      "${q.options[2].replace(/"/g, '\\"')}",
      "${q.options[3].replace(/"/g, '\\"')}"
    ],
    correctAnswer: ${q.correctAnswer},
    explanation: "${q.explanation?.replace(/"/g, '\\"') || ''}"
  }`).join(',\n');

    const fileContent = `/**
 * Data câu hỏi cho game "Hỏi Ngu"
 * Mỗi câu hỏi có cấu trúc:
 * - question: Nội dung câu hỏi
 * - options: Mảng 4 lựa chọn
 * - correctAnswer: Index của đáp án đúng (0-3)
 * - explanation: Giải thích đáp án (optional)
 */

export const quizQuestions = [
${questionsString}
];

/**
 * Lấy câu hỏi ngẫu nhiên từ danh sách
 * @param {Array} usedQuestions - Mảng index các câu đã sử dụng
 * @returns {Object} - Object chứa câu hỏi và index
 */
export const getRandomQuestion = (usedQuestions = []) => {
  const availableQuestions = quizQuestions.filter((_, index) => 
    !usedQuestions.includes(index)
  );
  
  if (availableQuestions.length === 0) {
    return null; // Hết câu hỏi
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  const originalIndex = quizQuestions.indexOf(selectedQuestion);
  
  return {
    question: selectedQuestion,
    index: originalIndex
  };
};

/**
 * Lấy tổng số câu hỏi
 * @returns {number} - Số lượng câu hỏi
 */
export const getTotalQuestions = () => quizQuestions.length;`;

    // Ghi file mới
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    console.log(`✅ Đã thêm ${newQuestions.length} câu hỏi mới, tổng cộng ${allQuestions.length} câu hỏi`);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file:', error.message);
    process.exit(1);
  }
} 