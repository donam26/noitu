const fs = require('fs');
const path = require('path');

/**
 * Script để cập nhật file behaviorQuestions.js
 * Có thể thêm mới hoặc ghi đè toàn bộ mảng câu hỏi ứng xử
 */

const args = process.argv.slice(2);
const operation = args[0]; // 'append' hoặc 'replace'

// Đọc dữ liệu từ stdin
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const newQuestions = JSON.parse(inputData);
    
    if (operation === 'replace') {
      replaceBehaviorFile(newQuestions);
    } else {
      appendBehaviorFile(newQuestions);
    }
  } catch (error) {
    console.error('❌ Lỗi parse JSON:', error.message);
    process.exit(1);
  }
});

function replaceBehaviorFile(allQuestions) {
  const filePath = path.join(__dirname, 'src', 'data', 'behaviorQuestions.js');
  
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
 * Data câu hỏi cho game "Vua Ứng Xử"
 * Câu hỏi về đạo đức, ứng xử và giáo dục công dân cho trẻ em
 * Mỗi câu hỏi có cấu trúc:
 * - question: Nội dung câu hỏi
 * - options: Mảng 4 lựa chọn
 * - correctAnswer: Index của đáp án đúng (0-3)
 * - explanation: Giải thích đáp án (optional)
 */

export const behaviorQuestions = [
${questionsString}
];

/**
 * Lấy câu hỏi ngẫu nhiên từ danh sách
 * @param {Array} usedQuestions - Mảng index các câu đã sử dụng
 * @returns {Object} - Object chứa câu hỏi và index
 */
export const getRandomBehaviorQuestion = (usedQuestions = []) => {
  const availableQuestions = behaviorQuestions.filter((_, index) => 
    !usedQuestions.includes(index)
  );
  
  if (availableQuestions.length === 0) {
    return null; // Hết câu hỏi
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  const originalIndex = behaviorQuestions.indexOf(selectedQuestion);
  
  return {
    question: selectedQuestion,
    index: originalIndex
  };
};

/**
 * Lấy tổng số câu hỏi ứng xử
 * @returns {number} - Số lượng câu hỏi
 */
export const getTotalBehaviorQuestions = () => behaviorQuestions.length;`;

    // Ghi file mới
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    console.log(`✅ Đã cập nhật ${allQuestions.length} câu hỏi ứng xử trong ${filePath}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file:', error.message);
    process.exit(1);
  }
}

function appendBehaviorFile(newQuestions) {
  const filePath = path.join(__dirname, 'src', 'data', 'behaviorQuestions.js');
  
  try {
    // Đọc file hiện tại
    let existingQuestions = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Parse các câu hỏi hiện có (đơn giản hóa)
      const existingData = require('./src/data/behaviorQuestions.js');
      existingQuestions = existingData.behaviorQuestions || [];
    }
    
    // Gộp câu hỏi mới
    const allQuestions = [...existingQuestions, ...newQuestions];
    
    // Ghi đè file với tổng câu hỏi
    replaceBehaviorFile(allQuestions);
    
  } catch (error) {
    console.error('❌ Lỗi khi thêm câu hỏi:', error.message);
    process.exit(1);
  }
} 