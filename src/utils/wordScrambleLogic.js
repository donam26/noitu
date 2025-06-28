import { words } from '../words_perfect_2_syllables';

/**
 * Lấy từ ngẫu nhiên phù hợp cho game sắp xếp (từ đơn, không có khoảng trắng)
 * @returns {string} - Từ ngẫu nhiên
 */
export const getRandomWordForScramble = () => {
  // Lọc ra những từ không có khoảng trắng và có độ dài từ 4-8 ký tự
  const suitableWords = words.filter(word => 
    !word.includes(' ') && 
    !word.includes('-') && 
    word.length >= 4 && 
    word.length <= 8 &&
    /^[a-zA-ZÀ-ỹ]+$/.test(word) // Chỉ chứa chữ cái
  );
  
  const randomIndex = Math.floor(Math.random() * suitableWords.length);
  return suitableWords[randomIndex];
};

/**
 * Đảo lộn các ký tự trong từ
 * @param {string} word - Từ gốc
 * @returns {string} - Từ đã đảo lộn
 */
export const scrambleWord = (word) => {
  if (!word) return '';
  
  const letters = word.toLowerCase().split('');
  
  // Thuật toán Fisher-Yates để đảo lộn mảng
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  
  // Đảm bảo từ đảo lộn khác từ gốc
  const scrambled = letters.join('');
  if (scrambled === word.toLowerCase()) {
    // Nếu trùng, đổi chỗ 2 ký tự đầu
    if (letters.length >= 2) {
      [letters[0], letters[1]] = [letters[1], letters[0]];
    }
  }
  
  return letters.join('');
};

/**
 * Định dạng từ đảo lộn thành chuỗi hiển thị (c/r/ú/u/t)
 * @param {string} scrambledWord - Từ đã đảo lộn
 * @returns {string} - Chuỗi hiển thị với dấu "/"
 */
export const formatScrambledDisplay = (scrambledWord) => {
  if (!scrambledWord) return '';
  return scrambledWord.split('').join('/');
};

/**
 * Kiểm tra câu trả lời có đúng không
 * @param {string} originalWord - Từ gốc
 * @param {string} userAnswer - Câu trả lời của người dùng
 * @returns {boolean} - True nếu đúng
 */
export const checkAnswer = (originalWord, userAnswer) => {
  if (!originalWord || !userAnswer) return false;
  return originalWord.toLowerCase().trim() === userAnswer.toLowerCase().trim();
};

/**
 * Tạo gợi ý cho người chơi (hiển thị ký tự đầu và cuối)
 * @param {string} word - Từ gốc
 * @returns {string} - Gợi ý
 */
export const getHint = (word) => {
  if (!word || word.length < 2) return '';
  
  const firstChar = word.charAt(0);
  const lastChar = word.charAt(word.length - 1);
  const middleLength = word.length - 2;
  
  if (middleLength <= 0) {
    return `${firstChar}${lastChar}`;
  }
  
  const underscores = '_'.repeat(middleLength);
  return `${firstChar}${underscores}${lastChar}`;
};

/**
 * Tính điểm dựa trên độ dài từ và thời gian còn lại
 * @param {string} word - Từ gốc
 * @param {number} timeLeft - Thời gian còn lại (giây)
 * @param {number} maxTime - Thời gian tối đa (giây)
 * @returns {number} - Điểm
 */
export const calculateScore = (word, timeLeft, maxTime) => {
  if (!word) return 0;
  
  const baseScore = word.length * 10; // 10 điểm cho mỗi ký tự
  const timeBonus = Math.floor((timeLeft / maxTime) * 50); // Bonus tối đa 50 điểm
  
  return baseScore + timeBonus;
}; 