const fs = require('fs');
const path = require('path');

/**
 * Script để cập nhật file quizQuestions.js
 * Nhận dữ liệu từ stdin và ghi vào file
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
    updateQuizFile(newQuestions);
  } catch (error) {
    console.error('❌ Lỗi parse JSON:', error.message);
    process.exit(1);
  }
});

function updateQuizFile(newQuestions) {
  const filePath = path.join(__dirname, 'src', 'data', 'quizQuestions.js');
  
  try {
    // Đọc file hiện tại
    const currentContent = fs.readFileSync(filePath, 'utf8');
    
    // Tìm vị trí kết thúc của mảng quizQuestions
    const arrayEndPattern = /\]\s*;\s*\n\s*\/\*\*/;
    const match = currentContent.match(arrayEndPattern);
    
    if (!match) {
      throw new Error('Không tìm thấy điểm kết thúc của mảng quizQuestions');
    }
    
    const insertPosition = match.index; // Vị trí của dấu ]
    
    // Tạo chuỗi cho các câu hỏi mới
    const questionsString = newQuestions.map(q => `  {
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
    
    // Chèn các câu hỏi mới vào trước dấu ]
    const beforeInsert = currentContent.substring(0, insertPosition);
    const afterInsert = currentContent.substring(insertPosition);
    
    const newContent = beforeInsert + ',\n' + questionsString + '\n' + afterInsert;
    
    // Ghi file mới
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ Đã thêm ${newQuestions.length} câu hỏi mới vào ${filePath}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file:', error.message);
    process.exit(1);
  }
} 