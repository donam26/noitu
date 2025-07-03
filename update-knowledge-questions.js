const fs = require('fs');
const path = require('path');

/**
 * Script để cập nhật file knowledgeQuestions.js
 * Có thể thêm mới hoặc ghi đè toàn bộ mảng câu hỏi kiến thức
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
      replaceKnowledgeFile(newQuestions);
    } else {
      appendKnowledgeFile(newQuestions);
    }
  } catch (error) {
    console.error('❌ Lỗi parse JSON:', error.message);
    process.exit(1);
  }
});

function replaceKnowledgeFile(allQuestions) {
  const filePath = path.join(__dirname, 'src', 'data', 'knowledgeQuestions.js');
  
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
 * Data câu hỏi cho game "Vua Kiến Thức"
 * Câu hỏi về sự thật thú vị trong khoa học, thiên nhiên và văn hóa
 * Mỗi câu hỏi có cấu trúc:
 * - question: Nội dung câu hỏi
 * - options: Mảng 4 lựa chọn
 * - correctAnswer: Index của đáp án đúng (0-3)
 * - explanation: Giải thích đáp án (optional)
 */

export const knowledgeQuestions = [
${questionsString}
];

/**
 * Lấy câu hỏi ngẫu nhiên từ danh sách
 * @param {Array} usedQuestions - Mảng index các câu đã sử dụng
 * @returns {Object} - Object chứa câu hỏi và index
 */
export const getRandomKnowledgeQuestion = (usedQuestions = []) => {
  const availableQuestions = knowledgeQuestions.filter((_, index) => 
    !usedQuestions.includes(index)
  );
  
  if (availableQuestions.length === 0) {
    return null; // Hết câu hỏi
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  const originalIndex = knowledgeQuestions.indexOf(selectedQuestion);
  
  return {
    question: selectedQuestion,
    index: originalIndex
  };
};

/**
 * Lấy tổng số câu hỏi kiến thức
 * @returns {number} - Số lượng câu hỏi
 */
export const getTotalKnowledgeQuestions = () => knowledgeQuestions.length;`;

    // Ghi file mới
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    console.log(`✅ Đã cập nhật ${allQuestions.length} câu hỏi kiến thức trong ${filePath}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file:', error.message);
    process.exit(1);
  }
}

function appendKnowledgeFile(newQuestions) {
  const filePath = path.join(__dirname, 'src', 'data', 'knowledgeQuestions.js');
  
  try {
    // Đọc file hiện tại
    let existingQuestions = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Parse các câu hỏi hiện có (đơn giản hóa)
      const existingData = require('./src/data/knowledgeQuestions.js');
      existingQuestions = existingData.knowledgeQuestions || [];
    }
    
    // Gộp câu hỏi mới
    const allQuestions = [...existingQuestions, ...newQuestions];
    
    // Ghi đè file với tổng câu hỏi
    replaceKnowledgeFile(allQuestions);
    
  } catch (error) {
    console.error('❌ Lỗi khi thêm câu hỏi:', error.message);
    process.exit(1);
  }
} 