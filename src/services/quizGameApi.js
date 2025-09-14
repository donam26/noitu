import api from './api'; // Assuming the base api instance is exported from api.js

const handleError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    return {
      success: false,
      message: error.response.data.message || 'Lỗi từ server',
      status: error.response.status,
      error: error.response.data
    };
  } else if (error.request) {
    return {
      success: false,
      message: 'Không thể kết nối đến server',
      status: 0
    };
  } else {
    return {
      success: false,
      message: error.message || 'Có lỗi xảy ra',
      status: 0
    };
  }
};

export const quizGameAPI = {
  getQuestions: async (quizType, page = 1, limit = 20, options = {}) => {
    try {
      const params = { page, limit, ...options };
      const response = await api.get(`/quiz-game/${quizType}`, { params });
      return { success: response.data.success, data: response.data.data, message: response.data.message };
    } catch (error) {
      return handleError(error);
    }
  },

  getRandomQuestion: async (quizType, exclude = []) => {
    try {
      const response = await api.post(`/quiz-game/${quizType}/random`, { exclude });
      const { success, data, message } = response.data;
      return { success, data, message };
    } catch (error) {
      return handleError(error);
    }
  },

  addQuestion: async (quizType, questionData) => {
    try {
      const response = await api.post(`/quiz-game/${quizType}`, questionData);
      return { success: response.data.success, data: response.data.data, message: response.data.message };
    } catch (error) {
      return handleError(error);
    }
  },

  updateQuestion: async (quizType, id, questionData) => {
    try {
      const response = await api.put(`/quiz-game/${quizType}/${id}`, questionData);
      return { success: response.data.success, data: response.data.data, message: response.data.message };
    } catch (error) {
      return handleError(error);
    }
  },

  deleteQuestion: async (quizType, id) => {
    try {
      const response = await api.delete(`/quiz-game/${quizType}/${id}`);
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return handleError(error);
    }
  },

  bulkAddQuestions: async (quizType, questionsData) => {
    try {
      const response = await api.post(`/quiz-game/${quizType}/bulk`, { questions: questionsData });
      return { success: response.data.success, data: response.data.data, message: response.data.message };
    } catch (error) {
      return handleError(error);
    }
  },

  generateQuestions: async (quizType, topic, difficulty = 'medium', count = 1) => {
    try {
      const response = await api.post(`/quiz-game/${quizType}/generate`, { topic, difficulty, count });
      return { success: response.data.success, data: response.data.data, message: response.data.message, errors: response.data.errors };
    } catch (error) {
      return handleError(error);
    }
  },

  shuffleOptions: async (quizType, question) => {
    try {
      const response = await api.post(`/quiz-game/${quizType}/shuffle-options`, { question });
      return { success: response.data.success, data: response.data.data, message: response.data.message };
    } catch (error) {
      return handleError(error);
    }
  },

  checkAnswer: async (quizType, answerData) => {
    try {
      const response = await api.post(`/quiz-game/${quizType}/check-answer`, answerData);
      return { success: response.data.success, data: response.data.data, message: response.data.message };
    } catch (error) {
      return handleError(error);
    }
  },

  submitResult: async (quizType, gameStats) => {
    try {
      const response = await api.post(`/quiz-game/${quizType}/submit-result`, gameStats);
      return { success: response.data.success, data: response.data.data, message: response.data.message };
    } catch (error) {
      return handleError(error);
    }
  },
};
