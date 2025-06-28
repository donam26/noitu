// Script lọc từ cho Wordle Tiếng Việt từ file words_perfect_2_syllables.js
// Phiên bản cải tiến với thuật toán chọn từ phổ biến tốt hơn
import { words } from './src/words_perfect_2_syllables.js';
import fs from 'fs';

// Hàm normalize để chuyển từ có dấu thành không dấu
const normalize = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "")
    .toUpperCase();
};

// Danh sách từ thông dụng (ưu tiên cao)
const commonWords = [
  'học sinh', 'giáo viên', 'bạn bè', 'gia đình', 'cuộc sống', 'thay đổi',
  'yêu thương', 'hạnh phúc', 'buồn bã', 'vui vẻ', 'khó khăn', 'dễ dàng',
  'làm việc', 'học tập', 'chơi game', 'xem phim', 'nghe nhạc', 'đọc sách',
  'ăn cơm', 'uống nước', 'ngủ nghỉ', 'thức dậy', 'ra ngoài', 'về nhà',
  'mặt trời', 'ánh sáng', 'bầu trời', 'ngôi sao', 'mây trắng', 'gió mát',
  'hoa đẹp', 'cây xanh', 'lá vàng', 'quả ngọt', 'nước trong', 'không khí',
  'con người', 'trẻ em', 'người già', 'phụ nữ', 'đàn ông', 'cô gái',
  'chàng trai', 'em bé', 'anh chị', 'bố mẹ', 'ông bà', 'cô chú',
  'màu đỏ', 'màu xanh', 'màu vàng', 'màu trắng', 'màu đen', 'màu hồng',
  'to nhỏ', 'dài ngắn', 'cao thấp', 'nhanh chậm', 'mạnh yếu', 'nóng lạnh'
];

// Từ khoá địa danh cần tránh
const locationKeywords = [
  'Hà Nội', 'Sài Gòn', 'Đà Nẵng', 'Huế', 'Cần Thơ', 'Hải Phòng',
  'quận', 'huyện', 'xã', 'phường', 'thành phố', 'tỉnh',
  'đường', 'phố', 'khu', 'vùng', 'miền', 'vịnh', 'sông', 'núi'
];

// Từ khoá thuật ngữ khoa học/kỹ thuật cần tránh
const technicalKeywords = [
  'bichcôt', 'cactông', 'commăng', 'côngxon', 'đăngten', 'găngxtơ',
  'moocchê', 'rơnghen', 'tuôcbin', 'vettông', 'viôlông', 'xiphông',
  'phốt pho', 'canxi', 'natri', 'kali', 'magie', 'sắt', 'đồng', 'kẽm'
];

// Hàm tính điểm độ phổ biến của từ
const calculatePopularityScore = (word) => {
  let score = 0;
  const lowerWord = word.toLowerCase();
  
  // Điểm cộng cho từ thông dụng
  const isCommon = commonWords.some(common => 
    lowerWord.includes(common.toLowerCase()) || common.toLowerCase().includes(lowerWord)
  );
  if (isCommon) score += 50;
  
  // Điểm trừ cho địa danh
  const isLocation = locationKeywords.some(loc => 
    lowerWord.includes(loc.toLowerCase())
  );
  if (isLocation) score -= 30;
  
  // Điểm trừ cho thuật ngữ kỹ thuật
  const isTechnical = technicalKeywords.some(tech => 
    lowerWord.includes(tech.toLowerCase())
  );
  if (isTechnical) score -= 40;
  
  // Điểm trừ cho tên riêng (bắt đầu bằng chữ hoa)
  if (/^[A-Z]/.test(word) && !['Anh', 'Việt', 'Nam'].some(w => word.includes(w))) {
    score -= 20;
  }
  
  // Điểm cộng cho từ có cấu trúc đơn giản (ít khoảng trắng)
  const spaceCount = (word.match(/\s/g) || []).length;
  if (spaceCount <= 1) score += 10;
  
  // Điểm cộng cho từ ngắn (dễ nhớ)
  if (word.length <= 8) score += 5;
  
  // Điểm trừ cho từ có ký tự đặc biệt
  if (/[0-9\-_]/.test(word)) score -= 25;
  
  return score;
};

// Lọc từ có đúng 7 chữ cái khi normalize
const validWordleWords = [];
const seenNormalized = new Set(); // Tránh trùng lặp

console.log(`Bắt đầu lọc từ ${words.length} từ...`);

words.forEach((word, index) => {
  const normalized = normalize(word);
  
  // Kiểm tra điều kiện:
  // 1. Đúng 7 chữ cái khi normalize
  // 2. Chỉ chứa chữ cái A-Z
  // 3. Không trùng lặp với từ đã có
  if (normalized.length === 7 && 
      /^[A-Z]+$/.test(normalized) && 
      !seenNormalized.has(normalized)) {
    
    const popularityScore = calculatePopularityScore(word);
    
    validWordleWords.push({
      original: word,
      normalized: normalized,
      popularity: popularityScore
    });
    seenNormalized.add(normalized);
  }
  
  // Log progress mỗi 5000 từ
  if ((index + 1) % 5000 === 0) {
    console.log(`Đã xử lý ${index + 1}/${words.length} từ... Tìm được ${validWordleWords.length} từ phù hợp.`);
  }
});

console.log(`\nKết quả lọc:`);
console.log(`- Tổng từ đầu vào: ${words.length}`);
console.log(`- Từ phù hợp: ${validWordleWords.length}`);

// Sắp xếp theo điểm độ phổ biến (điểm cao trước)
validWordleWords.sort((a, b) => {
  if (b.popularity !== a.popularity) {
    return b.popularity - a.popularity;
  }
  // Nếu điểm bằng nhau thì sắp xếp theo tên
  return a.original.localeCompare(b.original, 'vi');
});

// Tách ra target words (từ để đoán) và valid words (từ hợp lệ)
const targetWords = [];
const allValidWords = [];

validWordleWords.forEach(({ original, normalized, popularity }) => {
  allValidWords.push(original);
  
  // Chọn target words: chỉ lấy từ có điểm phổ biến >= 0
  if (popularity >= 0 && targetWords.length < 300) {
    targetWords.push(original);
  }
});

console.log(`- Target words (từ để đoán): ${targetWords.length}`);
console.log(`- Valid words (từ hợp lệ): ${allValidWords.length}`);

// Hiển thị top 20 từ phổ biến nhất
console.log('\n🔥 Top 20 từ phổ biến nhất:');
targetWords.slice(0, 20).forEach((word, index) => {
  const wordData = validWordleWords.find(w => w.original === word);
  console.log(`${index + 1}. "${word}" (${wordData.popularity} điểm) → ${normalize(word)}`);
});

// Tạo file dữ liệu mới
const dataContent = `/**
 * Wordle Tiếng Việt - Dữ liệu từ điển
 * Lọc từ file words_perfect_2_syllables.js
 * Chỉ lấy từ có đúng 7 chữ cái khi bỏ dấu
 * Sử dụng thuật toán chọn từ phổ biến cải tiến
 */

// Hàm normalize để chuyển từ có dấu thành không dấu
export const normalize = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\\s+/g, "")
    .toUpperCase();
};

// Danh sách từ để đoán (target words) - ${targetWords.length} từ phổ biến
export const targetWords = [
${targetWords.map(word => `  "${word}"`).join(',\n')}
];

// Danh sách từ hợp lệ để validate - ${Math.min(allValidWords.length, 1500)} từ
export const validWords = [
${allValidWords.slice(0, 1500).map(word => `  "${word}"`).join(',\n')}
];

// Hàm lấy từ ngẫu nhiên để đoán
export const getRandomTargetWord = () => {
  const randomIndex = Math.floor(Math.random() * targetWords.length);
  return targetWords[randomIndex];
};

// Hàm kiểm tra từ có hợp lệ không
export const isValidWord = (word) => {
  const normalizedInput = normalize(word);
  return validWords.some(validWord => normalize(validWord) === normalizedInput);
};

// Hàm phân tích cấu trúc âm tiết
export const analyzeSyllableStructure = (originalWord) => {
  const syllables = originalWord.trim().split(/\\s+/);
  if (syllables.length === 2) {
    const firstLen = syllables[0].length;
    const secondLen = syllables[1].length;
    return \`Từ gồm 2 âm tiết: "\${syllables[0]}" (\${firstLen} chữ) + "\${syllables[1]}" (\${secondLen} chữ)\`;
  } else if (syllables.length === 1) {
    return \`Từ gồm 1 âm tiết: "\${syllables[0]}" (\${syllables[0].length} chữ)\`;
  }
  return \`Từ gồm \${syllables.length} âm tiết: \${syllables.map(s => '"' + s + '"').join(' + ')}\`;
};`;

// Ghi file
fs.writeFileSync('./src/data/wordleData.js', dataContent, 'utf8');

console.log('\n✅ Đã tạo file src/data/wordleData.js');
console.log('\n📋 Một số từ target mẫu:');
console.log(targetWords.slice(0, 30).join(', '));

console.log('\n🎯 Script hoàn thành!'); 