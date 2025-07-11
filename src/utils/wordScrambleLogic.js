import { words } from '../data/filteredWordsData';

/**
 * Lấy từ ngẫu nhiên phù hợp cho game sắp xếp (từ hai âm tiết tách rời)
 * @returns {string} - Từ ngẫu nhiên
 */
export const getRandomWordForScramble = () => {
  // Lọc ra những từ hai âm tiết tách rời có độ dài phù hợp
  const suitableWords = words.filter(word => 
    word.includes(' ') && // Phải có khoảng trắng (hai âm tiết tách rời)
    word.trim().split(/\s+/).length === 2 && // Đúng hai âm tiết
    word.length >= 5 && // Tổng độ dài (kể cả khoảng trắng) từ 5 ký tự trở lên
    word.length <= 12 && // Không quá dài
    /^[a-zA-ZÀ-ỹ\s]+$/.test(word) // Chỉ chứa chữ cái và khoảng trắng
  );
  
  if (suitableWords.length === 0) {
    // Danh sách từ dự phòng nếu không tìm được từ phù hợp
    const backupWords = [
      "học sinh", "bạn bè", "gia đình", "công việc", "nhà cửa",
      "trường học", "lớp học", "cây cối", "hoa quả", "bánh mì",
      "cơm gạo", "bàn ghế", "máy tính", "điện thoại", "bút chì",
      "sách vở"
    ];
    const randomIndex = Math.floor(Math.random() * backupWords.length);
    return backupWords[randomIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * suitableWords.length);
  return suitableWords[randomIndex];
};

/**
 * Đảo lộn các ký tự trong từ nhưng giữ nguyên cấu trúc âm tiết
 * @param {string} word - Từ gốc
 * @returns {string} - Từ đã đảo lộn
 */
export const scrambleWord = (word) => {
  if (!word) return '';
  
  // Tách từ thành các âm tiết
  const syllables = word.trim().split(/\s+/);
  
  // Đảo lộn từng âm tiết riêng biệt
  const scrambledSyllables = syllables.map(syllable => {
    const letters = syllable.toLowerCase().split('');
    
    // Thuật toán Fisher-Yates để đảo lộn mảng
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    // Đảm bảo âm tiết đảo lộn khác âm tiết gốc
    const scrambled = letters.join('');
    if (scrambled === syllable.toLowerCase() && letters.length >= 2) {
      // Nếu trùng, đổi chỗ 2 ký tự đầu
      [letters[0], letters[1]] = [letters[1], letters[0]];
    }
    
    return letters.join('');
  });
  
  // Nối các âm tiết đã đảo lộn lại với nhau
  return scrambledSyllables.join(' ');
};

/**
 * Định dạng từ đảo lộn thành chuỗi hiển thị
 * @param {string} scrambledWord - Từ đã đảo lộn
 * @returns {string} - Chuỗi hiển thị với dấu "/"
 */
export const formatScrambledDisplay = (scrambledWord) => {
  if (!scrambledWord) return '';
  
  // Tách các âm tiết
  const syllables = scrambledWord.split(' ');
  
  // Định dạng từng âm tiết và nối lại với nhau
  return syllables.map(syllable => 
    syllable.split('').join('/')
  ).join(' — ');  // Sử dụng dấu gạch ngang dài để phân tách âm tiết
};

/**
 * Kiểm tra câu trả lời có đúng không
 * @param {string} originalWord - Từ gốc
 * @param {string} userAnswer - Câu trả lời của người dùng
 * @returns {boolean} - True nếu đúng
 */
export const checkAnswer = (originalWord, userAnswer) => {
  if (!originalWord || !userAnswer) return false;
  
  // Chuẩn hóa cả từ gốc và câu trả lời (loại bỏ khoảng trắng thừa)
  const normalizedOriginal = originalWord.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalizedAnswer = userAnswer.toLowerCase().trim().replace(/\s+/g, ' ');
  
  return normalizedOriginal === normalizedAnswer;
};

/**
 * Tạo gợi ý cho người chơi (hiển thị ký tự đầu của mỗi âm tiết)
 * @param {string} word - Từ gốc
 * @returns {string} - Gợi ý
 */
export const getHint = (word) => {
  if (!word) return '';
  
  // Tách các âm tiết
  const syllables = word.trim().split(/\s+/);
  
  // Tạo gợi ý cho từng âm tiết
  const syllableHints = syllables.map(syllable => {
    if (syllable.length === 0) return '';
    
    const firstChar = syllable.charAt(0);
    const lastChar = syllable.charAt(syllable.length - 1);
    const middleLength = syllable.length - 2;
    
    if (middleLength <= 0) {
      return `${firstChar}${lastChar}`;
    }
    
    const underscores = '_'.repeat(middleLength);
    return `${firstChar}${underscores}${lastChar}`;
  });
  
  // Nối các gợi ý lại với nhau
  return syllableHints.join(' ');
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
  
  // Xóa khoảng trắng để tính độ dài thực của từ
  const actualLength = word.replace(/\s+/g, '').length;
  
  const baseScore = actualLength * 10; // 10 điểm cho mỗi ký tự
  const timeBonus = Math.floor((timeLeft / maxTime) * 50); // Bonus tối đa 50 điểm
  
  return baseScore + timeBonus;
}; 