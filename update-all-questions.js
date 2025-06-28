const fs = require('fs');
const path = require('path');

/**
 * Script để cập nhật toàn bộ file quizQuestions.js
 * Nhận dữ liệu từ stdin và ghi đè toàn bộ mảng câu hỏi
 */

// Đọc dữ liệu từ stdin
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const allQuestions = JSON.parse(inputData);
    updateQuizFile(allQuestions);
  } catch (error) {
    console.error('❌ Lỗi parse JSON:', error.message);
    process.exit(1);
  }
});

function updateQuizFile(allQuestions) {
  const filePath = path.join(__dirname, 'src', 'data', 'quizQuestions.js');
  
  try {
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
    
    console.log(`✅ Đã cập nhật ${allQuestions.length} câu hỏi trong ${filePath}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file:', error.message);
    process.exit(1);
  }
} 