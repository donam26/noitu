import { getRandomKnowledgeQuestion, getTotalKnowledgeQuestions } from '../data/knowledgeQuestions';

/**
 * Kiểm tra đáp án có đúng không
 * @param {number} selectedAnswer - Index đáp án được chọn
 * @param {number} correctAnswer - Index đáp án đúng
 * @returns {boolean} - True nếu đúng
 */
export const checkAnswer = (selectedAnswer, correctAnswer) => {
  return selectedAnswer === correctAnswer;
};

/**
 * Tính điểm dựa trên thời gian trả lời cho Vua Kiến Thức
 * @param {number} timeLeft - Thời gian còn lại (giây)
 * @param {number} maxTime - Thời gian tối đa (giây)
 * @returns {number} - Điểm
 */
export const calculateKnowledgeScore = (timeLeft, maxTime) => {
  const baseScore = 100; // Điểm cơ bản
  const timeBonus = Math.floor((timeLeft / maxTime) * 50); // Bonus tối đa 50 điểm
  return baseScore + timeBonus;
};

/**
 * Lấy câu hỏi mới cho game Vua Kiến Thức
 * @param {Array} usedQuestions - Mảng các câu hỏi đã sử dụng
 * @returns {Object|null} - Câu hỏi mới hoặc null nếu hết câu
 */
export const getNewKnowledgeQuestion = (usedQuestions) => {
  return getRandomKnowledgeQuestion(usedQuestions);
};

/**
 * Kiểm tra game có kết thúc chưa
 * @param {Array} usedQuestions - Mảng các câu hỏi đã sử dụng
 * @param {number} maxQuestions - Số câu hỏi tối đa cho 1 game (mặc định 10)
 * @returns {boolean} - True nếu game kết thúc
 */
export const isKnowledgeGameFinished = (usedQuestions, maxQuestions = 10) => {
  return usedQuestions.length >= maxQuestions || usedQuestions.length >= getTotalKnowledgeQuestions();
};

/**
 * Tính tỷ lệ phần trăm đúng
 * @param {number} correctAnswers - Số câu trả lời đúng
 * @param {number} totalAnswers - Tổng số câu đã trả lời
 * @returns {number} - Tỷ lệ phần trăm (0-100)
 */
export const getAccuracyPercentage = (correctAnswers, totalAnswers) => {
  if (totalAnswers === 0) return 0;
  return Math.round((correctAnswers / totalAnswers) * 100);
};

/**
 * Lấy thông điệp đánh giá dựa trên tỷ lệ đúng cho Vua Kiến Thức
 * @param {number} accuracy - Tỷ lệ đúng (0-100)
 * @returns {string} - Thông điệp đánh giá
 */
export const getKnowledgePerformanceMessage = (accuracy) => {
  if (accuracy >= 90) {
    return "🏆 Xuất sắc! Bạn là nhà khoa học nhí!";
  } else if (accuracy >= 70) {
    return "🎉 Tuyệt vời! Bạn có kiến thức rất rộng!";
  } else if (accuracy >= 50) {
    return "👍 Khá tốt! Tiếp tục khám phá thế giới nhé!";
  } else if (accuracy >= 30) {
    return "😅 Cần đọc sách nhiều hơn nữa!";
  } else {
    return "🤔 Hãy tò mò và khám phá thêm về thế giới!";
  }
};

/**
 * Xáo trộn mảng các lựa chọn (để tránh người chơi nhớ vị trí)
 * @param {Array} options - Mảng các lựa chọn
 * @param {number} correctIndex - Index của đáp án đúng
 * @returns {Object} - Object chứa mảng đã xáo trộn và index đúng mới
 */
export const shuffleOptions = (options, correctIndex) => {
  const shuffled = [...options];
  const correctAnswer = shuffled[correctIndex];
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Tìm vị trí mới của đáp án đúng
  const newCorrectIndex = shuffled.indexOf(correctAnswer);
  
  return {
    shuffledOptions: shuffled,
    newCorrectIndex: newCorrectIndex
  };
}; 