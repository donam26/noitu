import axios from 'axios';

// Cấu hình Axios với URL cơ sở
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Tạo instance Axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động đính kèm token xác thực
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý lỗi chung
const handleError = (error) => {
  if (error.response) {
    // Lỗi server trả về
    return {
      success: false,
      message: error.response.data.message || 'Lỗi từ server',
      status: error.response.status
    };
  } else if (error.request) {
    // Không nhận được phản hồi từ server
    return {
      success: false,
      message: 'Không thể kết nối đến server',
      status: 0
    };
  } else {
    // Lỗi khi thiết lập request
    return {
      success: false,
      message: error.message || 'Có lỗi xảy ra',
      status: 0
    };
  }
};

// Service cho authentication
export const authAPI = {
  // Đăng nhập admin
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Lưu token khi đăng nhập thành công
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  // Kiểm tra trạng thái đăng nhập
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('adminToken');
    return { success: true };
  }
};

// Service cho Quiz
export const quizAPI = {
  // Lấy danh sách câu hỏi
  getQuestions: async (page = 1, limit = 20, options = {}) => {
    try {
      const params = { page, limit, ...options };
      const response = await api.get('/quiz', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy câu hỏi ngẫu nhiên
  getRandomQuestion: async (params = {}) => {
    try {
      const response = await api.post('/quiz/random', params);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Thêm câu hỏi mới
  addQuestion: async (questionData) => {
    try {
      const response = await api.post('/quiz', questionData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Thêm nhiều câu hỏi cùng lúc
  bulkAddQuestions: async (questionsData) => {
    try {
      const response = await api.post('/quiz/bulk', { questions: questionsData });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Cập nhật câu hỏi
  updateQuestion: async (id, questionData) => {
    try {
      const response = await api.put(`/quiz/${id}`, questionData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Xóa câu hỏi
  deleteQuestion: async (id) => {
    try {
      const response = await api.delete(`/quiz/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

// Service cho Knowledge Quiz
export const knowledgeAPI = {
  // Lấy danh sách câu hỏi kiến thức
  getQuestions: async (page = 1, limit = 20, options = {}) => {
    try {
      const params = { page, limit, ...options };
      const response = await api.get('/knowledge', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy câu hỏi kiến thức ngẫu nhiên
  getRandomQuestion: async (exclude = []) => {
    try {
      const data = { exclude: Array.isArray(exclude) ? exclude : [exclude] };
      const response = await api.post('/knowledge/random', data);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Thêm câu hỏi kiến thức mới
  addQuestion: async (questionData) => {
    try {
      const response = await api.post('/knowledge', questionData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Thêm nhiều câu hỏi kiến thức cùng lúc
  bulkAddQuestions: async (questionsData) => {
    try {
      const response = await api.post('/knowledge/bulk', { questions: questionsData });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Cập nhật câu hỏi kiến thức
  updateQuestion: async (id, questionData) => {
    try {
      const response = await api.put(`/knowledge/${id}`, questionData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Xóa câu hỏi kiến thức
  deleteQuestion: async (id) => {
    try {
      const response = await api.delete(`/knowledge/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

// Service cho Behavior Quiz
export const behaviorAPI = {
  // Lấy danh sách câu hỏi hành vi
  getQuestions: async (page = 1, limit = 20, options = {}) => {
    try {
      const params = { page, limit, ...options };
      const response = await api.get('/behavior', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy câu hỏi hành vi ngẫu nhiên
  getRandomQuestion: async (exclude = []) => {
    try {
      const data = { exclude: Array.isArray(exclude) ? exclude : [exclude] };
      const response = await api.post('/behavior/random', data);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Thêm câu hỏi hành vi mới
  addQuestion: async (questionData) => {
    try {
      const response = await api.post('/behavior', questionData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Thêm nhiều câu hỏi hành vi cùng lúc
  bulkAddQuestions: async (questionsData) => {
    try {
      const response = await api.post('/behavior/bulk', { questions: questionsData });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Cập nhật câu hỏi hành vi
  updateQuestion: async (id, questionData) => {
    try {
      const response = await api.put(`/behavior/${id}`, questionData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Xóa câu hỏi hành vi
  deleteQuestion: async (id) => {
    try {
      const response = await api.delete(`/behavior/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

// Service cho Question (API hợp nhất)
export const questionAPI = {
  // Lấy danh sách câu hỏi theo loại
  getQuestions: async (type = null, page = 1, limit = 20, options = {}) => {
    try {
      const params = { page, limit, ...options };
      if (type) params.type = type;
      
      const response = await api.get('/questions/questions', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy câu hỏi theo ID
  getQuestionById: async (id) => {
    try {
      const response = await api.get(`/questions/questions/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy câu hỏi ngẫu nhiên
  getRandomQuestion: async (type = null, exclude = [], options = {}) => {
    try {
      const params = { ...options };
      if (type) params.type = type;
      if (exclude && exclude.length > 0) {
        params.exclude = Array.isArray(exclude) ? exclude : [exclude];
      }
      
      const response = await api.get('/questions/random', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Thêm câu hỏi mới
  addQuestion: async (questionData) => {
    try {
      const response = await api.post('/questions/questions', questionData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Cập nhật câu hỏi
  updateQuestion: async (id, questionData) => {
    try {
      const response = await api.put(`/questions/questions/${id}`, questionData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Xóa câu hỏi
  deleteQuestion: async (id) => {
    try {
      const response = await api.delete(`/questions/questions/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

// Service cho Game Data
export const gameDataAPI = {
  // Lấy dữ liệu cho Guess Who
  getGuessWhoData: async () => {
    try {
      const response = await api.get('/games/guess-who');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy dữ liệu cho Universe Answer
  getUniverseAnswerData: async () => {
    try {
      const response = await api.get('/games/universe-answer');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy dữ liệu cho Wordle
  getWordleData: async () => {
    try {
      const response = await api.get('/games/wordle');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Thêm từ mới cho Wordle
  addWordleWord: async (wordData) => {
    try {
      const response = await api.post('/games/wordle/words', wordData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

export default api; 