/**
 * Wordle Seeder - Tạo dữ liệu mẫu cho từ vựng game Wordle
 */
const fs = require('fs').promises;
const path = require('path');
const { WordleWord } = require('../models');

const seedWordleWords = async () => {
  try {
    // Kiểm tra số lượng từ hiện có
    const wordCount = await WordleWord.count();
    
    if (wordCount > 0) {
      console.log(`ℹ️ Đã có ${wordCount} từ Wordle trong hệ thống. Bỏ qua seeding.`);
      return false;
    }
    
    // Dữ liệu mẫu nếu không thể đọc từ file
    const sampleWords = [
      { word: "ánh sáng", normalized: "ANHSANG", is_target: true },
      { word: "bầu trời", normalized: "BAUTROI", is_target: true },
      { word: "cây xanh", normalized: "CAYXANH", is_target: true },
      { word: "học sinh", normalized: "HOCSINH", is_target: true },
      { word: "khó khăn", normalized: "KHOKHAN", is_target: true },
      { word: "làm việc", normalized: "LAMVIEC", is_target: true },
      { word: "ngôi sao", normalized: "NGOISAO", is_target: true },
      { word: "thay đổi", normalized: "THAYDOI", is_target: true },
      { word: "tự nhiên", normalized: "TUNHIEN", is_target: true },
      { word: "yêu thích", normalized: "YEUTHICH", is_target: true }
    ];
    
    // Hàm normalize từ
    const normalize = (str) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/\s+/g, "")
        .toUpperCase();
    };
    
    // Thử đọc dữ liệu từ file
    try {
      const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'wordleData.js');
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Trích xuất mảng targetWords từ nội dung file
      const wordsMatch = fileContent.match(/export\s+const\s+targetWords\s*=\s*(\[[\s\S]*?\]);/);
      
      if (wordsMatch && wordsMatch[1]) {
        // Chuyển đổi string thành mảng object
        const wordsStr = wordsMatch[1].replace(/export\s+const\s+\w+\s*=\s*/, '');
        const words = eval(wordsStr);
        
        // Chuyển đổi format và chỉ lấy 100 từ đầu tiên để tránh quá nhiều dữ liệu
        const limitedWords = words.slice(0, 200);
        const wordsToCreate = limitedWords.map(word => ({
          word,
          normalized: normalize(word),
          is_target: true
        }));
        
        // Tạo các bản ghi trong database
        await WordleWord.bulkCreate(wordsToCreate);
        console.log(`✅ Đã import ${wordsToCreate.length} từ Wordle từ file gốc`);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Không thể đọc file wordleData.js:', error.message);
    }
    
    // Nếu không thể đọc từ file, sử dụng dữ liệu mẫu
    await WordleWord.bulkCreate(sampleWords);
    console.log(`✅ Đã tạo ${sampleWords.length} từ Wordle mẫu`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu từ Wordle:', error);
    throw error;
  }
};

module.exports = seedWordleWords; 