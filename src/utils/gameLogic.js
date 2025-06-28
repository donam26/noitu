import { words } from '../words_perfect_2_syllables';

/**
 * Lấy âm cuối của từ (syllable cuối)
 * @param {string} word - Từ cần lấy âm cuối
 * @returns {string} - Âm cuối đã normalize
 */
export const getLastSyllable = (word) => {
  if (!word) return '';
  
  // Loại bỏ khoảng trắng và chuyển về lowercase
  const cleanWord = word.trim().toLowerCase();
  
  // Tách từ thành các âm tiết (phân tách bằng khoảng trắng)
  const syllables = cleanWord.split(/\s+/);
  
  // Trả về âm tiết cuối
  return syllables[syllables.length - 1];
};

/**
 * Lấy âm đầu của từ (syllable đầu)
 * @param {string} word - Từ cần lấy âm đầu
 * @returns {string} - Âm đầu đã normalize
 */
export const getFirstSyllable = (word) => {
  if (!word) return '';
  
  // Loại bỏ khoảng trắng và chuyển về lowercase
  const cleanWord = word.trim().toLowerCase();
  
  // Tách từ thành các âm tiết (phân tách bằng khoảng trắng)
  const syllables = cleanWord.split(/\s+/);
  
  // Trả về âm tiết đầu
  return syllables[0];
};

/**
 * Lấy ký tự cuối của từ (để tương thích ngược với từ một âm tiết)
 * @param {string} word - Từ cần lấy ký tự cuối
 * @returns {string} - Ký tự cuối đã normalize
 */
export const getLastChar = (word) => {
  if (!word) return '';
  // Loại bỏ khoảng trắng và ký tự đặc biệt ở cuối
  const cleanWord = word.trim().toLowerCase();
  return cleanWord.charAt(cleanWord.length - 1);
};

/**
 * Lấy ký tự đầu của từ (để tương thích ngược với từ một âm tiết)
 * @param {string} word - Từ cần lấy ký tự đầu
 * @returns {string} - Ký tự đầu đã normalize
 */
export const getFirstChar = (word) => {
  if (!word) return '';
  const cleanWord = word.trim().toLowerCase();
  return cleanWord.charAt(0);
};

/**
 * Kiểm tra từ có hợp lệ không (có trong danh sách từ)
 * @param {string} word - Từ cần kiểm tra
 * @returns {boolean} - True nếu từ hợp lệ
 */
export const isValidWord = (word) => {
  if (!word) return false;
  const cleanWord = word.trim();
  return words.some(w => w.toLowerCase() === cleanWord.toLowerCase());
};

/**
 * Kiểm tra từ có nối được với từ trước không
 * Ưu tiên nối theo âm tiết, nếu không có thì nối theo ký tự
 * @param {string} previousWord - Từ trước đó
 * @param {string} currentWord - Từ hiện tại
 * @returns {boolean} - True nếu có thể nối được
 */
export const canConnectWords = (previousWord, currentWord) => {
  if (!previousWord || !currentWord) return false;
  
  const lastSyllable = getLastSyllable(previousWord);
  const firstSyllable = getFirstSyllable(currentWord);
  
  // Kiểm tra nối theo âm tiết trước
  if (lastSyllable === firstSyllable) {
    return true;
  }
  
  // Nếu không nối được theo âm tiết, thử nối theo ký tự (cho từ đơn âm)
  const lastChar = getLastChar(previousWord);
  const firstChar = getFirstChar(currentWord);
  
  return lastChar === firstChar;
};

/**
 * Lấy từ ngẫu nhiên từ danh sách
 * @returns {string} - Từ ngẫu nhiên
 */
export const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

/**
 * Tìm từ gợi ý có thể nối với từ cho trước
 * Ưu tiên tìm theo âm tiết, sau đó mới đến ký tự
 * @param {string} word - Từ cần tìm từ nối tiếp
 * @returns {string} - Từ gợi ý
 */
export const findSuggestedWord = (word) => {
  const lastSyllable = getLastSyllable(word);
  const lastChar = getLastChar(word);
  
  // Tìm từ bắt đầu bằng âm tiết cuối
  const syllableWords = words.filter(w => {
    const firstSyllable = getFirstSyllable(w);
    return firstSyllable === lastSyllable && w.toLowerCase() !== word.toLowerCase();
  });
  
  if (syllableWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * syllableWords.length);
    return syllableWords[randomIndex];
  }
  
  // Nếu không tìm thấy, tìm từ bắt đầu bằng ký tự cuối
  const charWords = words.filter(w => {
    const firstChar = getFirstChar(w);
    return firstChar === lastChar && w.toLowerCase() !== word.toLowerCase();
  });
  
  if (charWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * charWords.length);
    return charWords[randomIndex];
  }
  
  return 'Không tìm thấy từ phù hợp';
};

/**
 * Lấy gợi ý cho người chơi về cách nối từ
 * @param {string} word - Từ hiện tại
 * @returns {string} - Chuỗi gợi ý
 */
export const getConnectionHint = (word) => {
  const lastSyllable = getLastSyllable(word);
  const lastChar = getLastChar(word);
  
  // Nếu từ có nhiều âm tiết, ưu tiên gợi ý theo âm tiết
  if (word.includes(' ') || lastSyllable !== lastChar) {
    return `"${lastSyllable}"`;
  }
  
  // Nếu từ đơn âm, gợi ý theo ký tự
  return `"${lastChar}"`;
}; 