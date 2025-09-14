// API Base URL
export const API_BASE_URL ='https://backend.winhouse.id.vn/api';

// Các hằng số cho các game
export const GAME_CONFIG = {
  TIME_LIMIT: 30, // 30 giây cho mỗi lượt
  GAME_STATES: {
    HOME: 'HOME',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER'
  },
  DEFAULT: {
    MAX_QUESTIONS: 10,
    TIME_PER_QUESTION: 15,
    POINTS_BASE: 100,
    POINTS_TIME_BONUS: 50
  },
  QUIZ: {
    MAX_QUESTIONS: 10,
    TIME_PER_QUESTION: 15,
    POINTS_BASE: 100,
    POINTS_TIME_BONUS: 50
  },
  BEHAVIOR: {
    MAX_QUESTIONS: 10,
    TIME_PER_QUESTION: 15,
    POINTS_BASE: 100,
    POINTS_TIME_BONUS: 50
  },
  KNOWLEDGE: {
    MAX_QUESTIONS: 10,
    TIME_PER_QUESTION: 15,
    POINTS_BASE: 100,
    POINTS_TIME_BONUS: 50
  },
  GUESSWHO: {
    MAX_QUESTIONS: 10,
    TIME_PER_QUESTION: 15,
    MAX_HINTS: 3,
    SCORE_PER_QUESTION: 100,
    HINT_PENALTY: 0
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