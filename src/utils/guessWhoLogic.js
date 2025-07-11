/**
 * Logic cho game "Tôi là ai"
 * Xử lý các thao tác liên quan đến việc đoán đối tượng qua gợi ý
 */

// KHÔNG import từ file data nữa
// import { getRandomQuestion, getAllCategories } from '../data/guessWhoData';

/**
 * Chuẩn hóa chuỗi để so sánh (bỏ dấu, lowercase, trim)
 * @param {string} str - Chuỗi cần chuẩn hóa
 * @returns {string} Chuỗi đã chuẩn hóa
 */
export const normalizeString = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .replace(/[đ]/g, 'd') // Thay đ thành d
    .replace(/[^a-z0-9\s]/g, '') // Chỉ giữ chữ, số và khoảng trắng
    .replace(/\s+/g, ' '); // Normalize khoảng trắng
};

/**
 * Kiểm tra độ tương tự giữa 2 chuỗi
 * @param {string} answer - Đáp án đúng
 * @param {string} guess - Câu trả lời của người chơi
 * @returns {number} Điểm tương tự từ 0-100
 */
export const calculateSimilarity = (answer, guess) => {
  const normalizedAnswer = normalizeString(answer);
  const normalizedGuess = normalizeString(guess);
  
  if (normalizedAnswer === normalizedGuess) return 100;
  
  // Kiểm tra chứa từ khóa chính
  const answerWords = normalizedAnswer.split(' ');
  const guessWords = normalizedGuess.split(' ');
  
  let matchingWords = 0;
  answerWords.forEach(word => {
    if (word.length > 2 && guessWords.some(gw => gw.includes(word) || word.includes(gw))) {
      matchingWords++;
    }
  });
  
  const wordSimilarity = (matchingWords / answerWords.length) * 100;
  
  // Kiểm tra Levenshtein distance cho toàn bộ chuỗi
  const levenshteinSimilarity = 100 - (levenshteinDistance(normalizedAnswer, normalizedGuess) / Math.max(normalizedAnswer.length, normalizedGuess.length)) * 100;
  
  return Math.max(wordSimilarity, levenshteinSimilarity);
};

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi
 * @param {string} str1 - Chuỗi 1
 * @param {string} str2 - Chuỗi 2
 * @returns {number} Khoảng cách Levenshtein
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Kiểm tra câu trả lời và trả về kết quả
 * @param {string} answer - Đáp án đúng
 * @param {string} guess - Câu trả lời của người chơi
 * @param {number} hintCount - Số gợi ý đã sử dụng
 * @returns {Object} Kết quả kiểm tra
 */
export const checkGuess = (answer, guess, hintCount) => {
  if (!guess || guess.trim().length === 0) {
    return {
      isCorrect: false,
      similarity: 0,
      feedback: "Hãy nhập câu trả lời của bạn!"
    };
  }
  
  if (guess.trim().length < 2) {
    return {
      isCorrect: false,
      similarity: 0,
      feedback: "Câu trả lời quá ngắn!"
    };
  }
  
  const similarity = calculateSimilarity(answer, guess);
  
  if (similarity >= 95) {
    return {
      isCorrect: true,
      similarity: 100,
      feedback: "🎉 Chính xác! Bạn đã đoán đúng!",
      score: calculateScore(hintCount, true)
    };
  } else if (similarity >= 70) {
    return {
      isCorrect: false,
      similarity: similarity,
      feedback: "🔥 Rất gần rồi! Thử lại xem!",
      isClose: true
    };
  } else if (similarity >= 40) {
    return {
      isCorrect: false,
      similarity: similarity,
      feedback: "🤔 Gần đúng rồi, nghĩ thêm chút nữa!",
      isWarm: true
    };
  } else {
    return {
      isCorrect: false,
      similarity: similarity,
      feedback: "❌ Chưa đúng, thử lại nhé!",
      isCold: true
    };
  }
};

/**
 * Tính điểm dựa trên số gợi ý đã sử dụng
 * @param {number} hintsUsed - Số gợi ý đã dùng
 * @param {boolean} isCorrect - Có đoán đúng không
 * @returns {number} Điểm số
 */
export const calculateScore = (hintsUsed, isCorrect) => {
  if (!isCorrect) return 0;
  
  const baseScore = 100;
  const hintPenalty = hintsUsed * 15; // Trừ 15 điểm mỗi gợi ý
  
  return Math.max(baseScore - hintPenalty, 10); // Tối thiểu 10 điểm
};

/**
 * Kiểm tra xem game đã kết thúc chưa
 * @param {Array} usedQuestionIds - Mảng ID các câu đã chơi
 * @param {number} maxQuestions - Số câu tối đa
 * @param {number} totalQuestions - Tổng số câu có sẵn
 * @returns {boolean} Game đã kết thúc hay chưa
 */
export const isGameFinished = (usedQuestionIds, maxQuestions, totalQuestions = Infinity) => {
  return usedQuestionIds.length >= maxQuestions || usedQuestionIds.length >= totalQuestions;
};

/**
 * Tính tỷ lệ đúng
 * @param {number} correctAnswers - Số câu đúng
 * @param {number} totalQuestions - Tổng số câu
 * @returns {number} Tỷ lệ phần trăm
 */
export const getAccuracyPercentage = (correctAnswers, totalQuestions) => {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
};

/**
 * Lấy thông điệp kết quả dựa trên hiệu suất
 * @param {number} accuracy - Tỷ lệ đúng (%)
 * @param {number} totalScore - Tổng điểm
 * @returns {string} Thông điệp
 */
export const getPerformanceMessage = (accuracy, totalScore) => {
  if (accuracy >= 90) {
    return "🏆 Xuất sắc! Bạn là thám tử siêu hạng!";
  } else if (accuracy >= 75) {
    return "🎯 Tuyệt vời! Bạn có tài suy luận!";
  } else if (accuracy >= 60) {
    return "👍 Khá tốt! Bạn đã cố gắng rất nhiều!";
  } else if (accuracy >= 40) {
    return "🤔 Không tệ! Còn cần luyện tập thêm!";
  } else {
    return "😅 Hãy thử lại! Practice makes perfect!";
  }
};

/**
 * Lưu thống kê game vào localStorage
 * @param {Object} gameStats - Thống kê game
 */
export const saveGameStats = (gameStats) => {
  try {
    const existingStats = getGameStats();
    const updatedStats = {
      totalGames: existingStats.totalGames + 1,
      totalQuestions: existingStats.totalQuestions + gameStats.questionsAnswered,
      totalCorrect: existingStats.totalCorrect + gameStats.correctAnswers,
      totalScore: existingStats.totalScore + gameStats.score,
      bestScore: Math.max(existingStats.bestScore, gameStats.score),
      lastPlayed: Date.now(),
      // Stats by category
      categoryStats: updateCategoryStats(existingStats.categoryStats, gameStats.categoryResults)
    };
    
    localStorage.setItem('guessWhoStats', JSON.stringify(updatedStats));
  } catch (error) {
    console.warn('Không thể lưu thống kê:', error);
  }
};

/**
 * Lấy thống kê game từ localStorage
 * @returns {Object} Thống kê game
 */
export const getGameStats = () => {
  try {
    const stats = localStorage.getItem('guessWhoStats');
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (error) {
    console.warn('Không thể đọc thống kê:', error);
  }
  
  // Default stats
  return {
    totalGames: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalScore: 0,
    bestScore: 0,
    lastPlayed: null,
    categoryStats: {}
  };
};

/**
 * Cập nhật thống kê theo danh mục
 * @param {Object} existingCategoryStats - Thống kê danh mục hiện tại
 * @param {Object} newCategoryResults - Kết quả mới theo danh mục
 * @returns {Object} Thống kê danh mục đã cập nhật
 */
const updateCategoryStats = (existingCategoryStats, newCategoryResults) => {
  const updatedStats = { ...existingCategoryStats };
  
  Object.keys(newCategoryResults).forEach(category => {
    const newResult = newCategoryResults[category];
    if (!updatedStats[category]) {
      updatedStats[category] = { correct: 0, total: 0 };
    }
    updatedStats[category].correct += newResult.correct || 0;
    updatedStats[category].total += newResult.total || 0;
  });
  
  return updatedStats;
};

/**
 * Xóa thống kê game
 */
export const clearGameStats = () => {
  try {
    localStorage.removeItem('guessWhoStats');
  } catch (error) {
    console.warn('Không thể xóa thống kê:', error);
  }
};

/**
 * Format thời gian đã chơi lần cuối
 * @param {number} timestamp - Timestamp
 * @returns {string} Thời gian đã format
 */
export const formatLastPlayed = (timestamp) => {
  if (!timestamp) return 'Chưa có dữ liệu';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return `${diffDay} ngày trước`;
  } else if (diffHour > 0) {
    return `${diffHour} giờ trước`;
  } else if (diffMin > 0) {
    return `${diffMin} phút trước`;
  } else {
    return 'Vừa xong';
  }
};

/**
 * Lấy gợi ý tiếp theo
 * @param {Array} hints - Mảng các gợi ý
 * @param {number} currentHintIndex - Index gợi ý hiện tại
 * @returns {Object} Gợi ý tiếp theo và index
 */
export const getNextHint = (hints, currentHintIndex) => {
  if (!hints || hints.length === 0) {
    return { hint: 'Không có gợi ý nào khả dụng', index: -1 };
  }
  
  const nextIndex = currentHintIndex + 1;
  if (nextIndex >= hints.length) {
    return { hint: 'Đã hết gợi ý', index: currentHintIndex };
  }
  
  return {
    hint: hints[nextIndex],
    index: nextIndex
  };
};

/**
 * Tạo gợi ý từ câu trả lời của người chơi
 * @param {string} answer - Đáp án đúng
 * @param {string} guess - Câu trả lời của người chơi
 * @returns {string} Gợi ý được tạo
 */
export const generateHintFromGuess = (answer, guess) => {
  const normalizedAnswer = normalizeString(answer);
  const normalizedGuess = normalizeString(guess);
  
  if (normalizedGuess.length < 3) {
    return "Hãy nhập nhiều hơn để có gợi ý tốt hơn";
  }
  
  const answerWords = normalizedAnswer.split(' ');
  const guessWords = normalizedGuess.split(' ');
  
  // Tìm từ tương đồng
  let matchedWords = [];
  answerWords.forEach(word => {
    if (word.length > 2 && guessWords.some(gw => gw.includes(word) || word.includes(gw))) {
      matchedWords.push(word);
    }
  });
  
  if (matchedWords.length > 0) {
    return `Bạn đã đúng một phần: "${matchedWords.join(', ')}" xuất hiện trong đáp án.`;
  }
  
  // Kiểm tra có từ nào bắt đầu giống nhau không
  const firstAnswerWord = answerWords[0];
  const firstGuessWord = guessWords[0];
  
  if (firstAnswerWord && firstGuessWord && firstAnswerWord.charAt(0) === firstGuessWord.charAt(0)) {
    return `Đáp án bắt đầu bằng chữ cái "${firstAnswerWord.charAt(0).toUpperCase()}"`;
  }
  
  // Gợi ý số từ
  if (Math.abs(answerWords.length - guessWords.length) > 1) {
    return `Đáp án có ${answerWords.length} từ.`;
  }
  
  return "Hãy thử một hướng khác. Đáp án không liên quan đến điều bạn đoán.";
}; 