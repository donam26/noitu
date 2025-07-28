// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://103.216.117.180:3001/api';

// Các hằng số cho các game
export const GAME_CONFIG = {
  TIME_LIMIT: 30, // 30 giây cho mỗi lượt
  GAME_STATES: {
    HOME: 'HOME',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER'
  },
  QUIZ: {
    MAX_QUESTIONS: 10,
    TIME_PER_QUESTION: 30
  },
  BEHAVIOR_QUIZ: {
    MAX_QUESTIONS: 10,
    TIME_PER_QUESTION: 30,
    POINTS_BASE: 100,
    POINTS_TIME_BONUS: 50 // Điểm thưởng tối đa cho thời gian
  },
  KNOWLEDGE_QUIZ: {
    MAX_QUESTIONS: 10,
    TIME_PER_QUESTION: 30,
    POINTS_BASE: 100,
    POINTS_TIME_BONUS: 50 // Điểm thưởng tối đa cho thời gian
  },
  GUESS_WHO: {
    MAX_QUESTIONS: 10,
    MAX_HINTS: 3, // Số gợi ý tối đa cho mỗi câu hỏi
    SCORE_PER_QUESTION: 100, // Điểm cơ bản cho mỗi câu đúng
    HINT_PENALTY: 0 // Không trừ điểm khi sử dụng gợi ý
  }
};

export const MESSAGES = {
  TIME_UP: 'Hết giờ! Từ đúng là:',
  CORRECT: 'Chính xác!',
  WRONG: 'Sai rồi! Từ đúng là:',
  GAME_TITLE: 'Game Nối Chữ',
  START_GAME: 'Bắt đầu',
  INPUT_PLACEHOLDER: 'Nhập từ nối tiếp...',
  TRY_AGAIN: 'Chơi lại',
  BACK_HOME: 'Về trang chủ'
}; 