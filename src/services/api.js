import axios from 'axios';
import { guessWhoCharacters } from '../seeders/guessWhoCharacters';
import { API_BASE_URL } from '../utils/constants';

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
  console.error('API Error:', error);
  
  if (error.response) {
    // Lỗi server trả về
    console.log('Error response:', error.response.data);
    return {
      success: false,
      message: error.response.data.message || 'Lỗi từ server',
      status: error.response.status,
      error: error.response.data
    };
  } else if (error.request) {
    // Không nhận được phản hồi từ server
    console.log('Error request:', error.request);
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

// Utility cho kiểm tra từ Wordle phía client
const checkWordleGuessClientSide = (guess, targetWord) => {
  if (!guess || !targetWord) return null;
  
  console.log('Client-side check:', { guess, targetWord });
  
  // Chuẩn hóa các từ để so sánh (loại bỏ dấu cách)
  const normalizeWord = (word) => word.toLowerCase().replace(/\s+/g, '');
  
  const cleanGuess = normalizeWord(guess);
  const cleanTarget = normalizeWord(targetWord);
  
  // Kiểm tra nếu đoán đúng hoàn toàn
  const isCorrect = cleanGuess === cleanTarget;
  
  // Tạo mảng kết quả cho từng ký tự
  const result = [];
  const targetCharCount = {};
  const LETTER_STATES = {
    CORRECT: 'correct',
    PRESENT: 'present',
    ABSENT: 'absent'
  };
  
  // Đếm số lượng ký tự trong từ đích
  for (const char of cleanTarget) {
    targetCharCount[char] = (targetCharCount[char] || 0) + 1;
  }
  
  // Tạo một bản sao để theo dõi số ký tự còn lại
  const remainingTargetCount = {...targetCharCount};
  
  // Đầu tiên, xử lý các ký tự đúng vị trí
  for (let i = 0; i < cleanGuess.length; i++) {
    const guessChar = cleanGuess[i];
    
    // Nếu ký tự đúng vị trí
    if (i < cleanTarget.length && guessChar === cleanTarget[i]) {
      result[i] = LETTER_STATES.CORRECT;
      remainingTargetCount[guessChar]--;
    } else {
      // Tạm thời đặt là absent, sẽ kiểm tra lại sau
      result[i] = LETTER_STATES.ABSENT;
    }
  }
  
  // Sau đó, kiểm tra các ký tự đúng nhưng sai vị trí
  for (let i = 0; i < cleanGuess.length; i++) {
    const guessChar = cleanGuess[i];
    
    // Chỉ xử lý các ký tự chưa được đánh dấu CORRECT
    if (result[i] !== LETTER_STATES.CORRECT) {
      // Nếu ký tự có trong từ đích và vẫn còn số lượng
      if (remainingTargetCount[guessChar] > 0) {
        result[i] = LETTER_STATES.PRESENT;
        remainingTargetCount[guessChar]--;
      }
      // Các trường hợp khác giữ nguyên là ABSENT
    }
  }
  
  // Tạo letterStates để cập nhật trạng thái bàn phím
  const letterStates = {};
  for (let i = 0; i < cleanGuess.length; i++) {
    const guessChar = cleanGuess[i];
    
    // Chỉ cập nhật trạng thái nếu trạng thái mới tốt hơn trạng thái cũ
    // Thứ tự ưu tiên: CORRECT > PRESENT > ABSENT
    if (!letterStates[guessChar] || 
        (letterStates[guessChar] === LETTER_STATES.ABSENT && result[i] !== LETTER_STATES.ABSENT) ||
        (letterStates[guessChar] === LETTER_STATES.PRESENT && result[i] === LETTER_STATES.CORRECT)) {
      letterStates[guessChar] = result[i];
    }
  }
  
  return {
    result,
    letterStates,
    isCorrect
  };
};

// Đưa hàm này vào window object để các component khác có thể sử dụng
if (typeof window !== 'undefined') {
  window.checkWordleGuessClientSide = checkWordleGuessClientSide;
}

// Service cho authentication
export const authAPI = {
  // Đăng nhập admin
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log("API login response:", response.data);
      
      // Lưu token khi đăng nhập thành công
      if (response.data && response.data.success) {
        const token = response.data.token || response.data.data?.token;
        if (token) {
          localStorage.setItem('adminToken', token);
        }
      }
      return { 
        success: response.data.success || false, 
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Kiểm tra trạng thái đăng nhập
  checkAuth: async () => {
    try {
      console.log("API: Checking auth with token:", localStorage.getItem('adminToken') ? "Token exists" : "No token");
      const response = await api.get('/auth/me');
      console.log("API: Auth check response:", response.data);
      return { 
        success: response.data.success || true, 
        data: response.data.data || response.data 
      };
    } catch (error) {
      console.error("API: Auth check error:", error);
      if (error.response && error.response.status === 404) {
        console.log("API: 404 error - endpoint not found");
      }
      return handleError(error);
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    return { success: true };
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
  getRandomQuestion: async (type = null, exclude = []) => {
    try {
      // Chuyển đổi mảng exclude thành chuỗi ngăn cách bằng dấu phẩy
      const excludeParam = Array.isArray(exclude) ? exclude.join(',') : exclude;
      
      // Thiết lập các tham số truy vấn
      const params = {};
      if (type) params.type = type;
      if (excludeParam) params.exclude = excludeParam;
      
      // Sửa đổi: gọi API tương thích với backend server
      // Thử lấy từ API quiz
      try {
        console.log("Đang thử lấy từ endpoint /quiz/random");
        const response = await api.post('/quiz/random', { exclude: exclude });
        return {
          success: true,
          data: response.data.data.question,
          message: response.data.message
        };
      } catch (quizError) {
        console.error("Lỗi khi gọi /quiz/random:", quizError);
        
        // Nếu lỗi, thử fallback về endpoint /questions/random
        console.log("Fallback sang endpoint /questions/random");
      const response = await api.get('/questions/random', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
      }
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

// Service cho từ vựng và trò chơi
export const gameDataAPI = {
  // Lấy dữ liệu cho game Guess Who
  getGuessWhoData: async () => {
    try {
      const response = await api.get('/games/guess-who');
      console.log('API getGuessWhoData response:', response.data);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Kiểm tra câu trả lời Guess Who
  checkGuessWhoAnswer: async (answerData) => {
    try {
      const response = await api.post('/games/guess-who/check-answer', answerData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi kiểm tra câu trả lời:', error);
      return handleError(error);
    }
  },
  
  // Lấy gợi ý tiếp theo cho Guess Who
  getNextHint: async (hintData) => {
    try {
      const response = await api.post('/games/guess-who/next-hint', hintData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý tiếp theo:', error);
      return handleError(error);
    }
  },
  
  // Lấy thống kê game Guess Who
  getGuessWhoStats: async () => {
    try {
      const response = await api.get('/games/guess-who/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê game:', error);
      return handleError(error);
    }
  },
  
  // Lưu thống kê game Guess Who
  saveGuessWhoStats: async (gameResult) => {
    try {
      const response = await api.post('/games/guess-who/stats', gameResult);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lưu thống kê game:', error);
      return handleError(error);
    }
  },
  
  // Xóa thống kê game Guess Who
  clearGuessWhoStats: async () => {
    try {
      const response = await api.delete('/games/guess-who/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi xóa thống kê game:', error);
      return handleError(error);
    }
  },
  
  // Lấy dữ liệu cho game Universe Answer
  getUniverseAnswerData: async () => {
    try {
      const response = await api.get('/games/universe-answer');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Lấy dữ liệu cho game Wordle
  getWordleData: async () => {
    try {
      const response = await api.get('/games/wordle');
      return {
        success: response.data.success || true,
        data: response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // API mới - Lấy danh sách từ đã lọc cho game WordScramble và Wordle
  getFilteredWords: async () => {
    try {
      const response = await api.get('/games/filtered-words');
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // API mới - Lấy danh sách từ cho game nối từ
  getAllWords: async () => {
    try {
      const response = await api.get('/games/words');
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // API mới - Lấy dữ liệu cho game sắp xếp từ
  getWordScrambleData: async () => {
    try {
      const response = await api.get('/games/word-scramble');
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Kiểm tra từ có hợp lệ trong tiếng Việt
  validateWord: async (word) => {
    try {
      console.log(`API: Gửi yêu cầu kiểm tra từ "${word}"`);
      const response = await api.post('/games/validate-word', { word });
      console.log('API: Nhận phản hồi kiểm tra từ:', response.data);
      
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('API: Lỗi khi kiểm tra từ:', error);
      if (error.response) {
        console.error('API: Chi tiết lỗi:', error.response.data);
      }
      return handleError(error);
    }
  },
  
  // Lấy từ gợi ý bắt đầu bằng âm tiết/chữ cái
  getSuggestedWord: async (startWith) => {
    try {
      const response = await api.get(`/games/suggest-word?startWith=${startWith}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Lấy nghĩa của từ
  getWordMeaning: async (word) => {
    try {
      const response = await api.get(`/games/word-meaning/${encodeURIComponent(word)}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy nghĩa của từ:', error);
      return handleError(error);
    }
  },
  
  // Thêm các hàm API mới
  getRandomWord: async () => {
    try {
      const response = await api.get('/games/random-word');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('API: Lỗi khi lấy từ ngẫu nhiên:', error);
      return handleError(error);
    }
  },
  
  checkWordConnection: async (previousWord, currentWord) => {
    try {
      const response = await api.post('/games/check-word-connection', {
        previousWord,
        currentWord
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('API: Lỗi khi kiểm tra kết nối từ:', error);
      return handleError(error);
    }
  },
  
  // Tạo từ nối tiếp cho game nối từ
  generateNextWord: async (currentWord) => {
    try {
      const response = await api.post('/games/generate-next-word', { currentWord });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Kiểm tra trạng thái AI
  checkAIStatus: async () => {
    try {
      const response = await api.get('/games/universe-answer/status');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái AI:', error);
      return {
        success: false,
        data: { available: false }
      };
    }
  },
  
  // Xử lý câu hỏi Universe Answer
  processUniverseQuestion: async (question) => {
    try {
      const response = await api.post('/games/universe-answer/process', { question });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi xử lý câu hỏi:', error);
      return handleError(error);
    }
  },
  
  // Lấy câu hỏi gợi ý
  getRandomSuggestedQuestion: async () => {
    try {
      const response = await api.get('/games/universe-answer/suggestion');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy câu hỏi gợi ý:', error);
      return handleError(error);
    }
  },
  
  // Lấy lịch sử câu hỏi
  getUniverseAnswerHistory: async () => {
    try {
      const response = await api.get('/games/universe-answer/history');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử câu hỏi:', error);
      return handleError(error);
    }
  },
  
  // Lấy thống kê Universe Answer
  getUniverseAnswerStats: async () => {
    try {
      const response = await api.get('/games/universe-answer/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê:', error);
      return handleError(error);
    }
  },
  
  // Xóa lịch sử Universe Answer
  clearUniverseAnswerHistory: async () => {
    try {
      const response = await api.delete('/games/universe-answer/history');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi xóa lịch sử:', error);
      return handleError(error);
    }
  },
  
  // Lấy từ ngẫu nhiên cho Wordle
  getRandomWordleWord: async () => {
    try {
      const response = await api.get('/games/wordle/random');
      console.log('API response:', response.data);
      
      // Kiểm tra nếu response.data không chứa thuộc tính data
      // Khi đó response.data chính là dữ liệu ta cần
      if (response.data && !response.data.data && response.data.word) {
        // API trả về trực tiếp { word, hints } thay vì { data: { word, hints } }
        return {
          success: true,
          data: response.data // Để tương thích với frontend
        };
      }
      
      return {
        success: response.data.success !== false,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy từ ngẫu nhiên:', error);
      return handleError(error);
    }
  },
  
  // Kiểm tra từ Wordle có hợp lệ
  validateWordleGuess: async (guess) => {
    try {
      // Kiểm tra client-side trước
      if (!guess || typeof guess !== 'string') {
        console.error('Từ không hợp lệ: rỗng hoặc không phải chuỗi');
        return {
          success: false,
          data: { valid: false, message: 'Từ không hợp lệ' }
        };
      }
      
      const trimmedGuess = guess.trim();
      
      // Kiểm tra độ dài từ
      const wordLength = trimmedGuess.replace(/\s+/g, '').length;
      if (wordLength < 2 || wordLength > 8) {
        console.error(`Độ dài từ không hợp lệ: ${wordLength}`);
        return {
          success: false,
          data: { valid: false, message: `Độ dài từ không hợp lệ (${wordLength} ký tự)` }
        };
      }
      
      // Kiểm tra định dạng từ tiếng Việt
      const vietnameseRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
      if (!vietnameseRegex.test(trimmedGuess)) {
        console.error('Từ không đúng định dạng tiếng Việt');
        return {
          success: false,
          data: { valid: false, message: 'Từ chứa ký tự không hợp lệ' }
        };
      }
      
      try {
        // Gửi request đến API
        const response = await api.post('/games/wordle/validate', { guess: trimmedGuess });
        console.log('validateWordleGuess API response:', response.data);
        
        return {
          success: true,
          data: {
            valid: response.data && response.data.valid !== false,
            message: response.data?.message || 'Từ được chấp nhận'
          }
        };
      } catch (apiError) {
        console.error('API error in validateWordleGuess:', apiError);
        
        // Fallback: cho phép từ hợp lệ nếu API lỗi để người chơi có thể tiếp tục
        return {
          success: true,
          data: { 
            valid: true, 
            message: 'Từ được chấp nhận (server không phản hồi)'
          }
        };
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra từ hợp lệ:', error);
      // Fallback để người chơi có thể tiếp tục
      return {
        success: true, // Vẫn báo success để UI không hiển thị lỗi lớn
        data: { valid: true, message: 'Từ được chấp nhận do lỗi kiểm tra' }
      };
    }
  },
  
  // Kiểm tra đoán Wordle
  checkWordleGuess: async (data) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!data || !data.guess || !data.targetWord) {
        console.error('Thiếu dữ liệu đầu vào cần thiết cho checkWordleGuess');
        return handleError(new Error('Thiếu dữ liệu đầu vào'));
      }
      
      try {
        // Gửi request đến API
        const response = await api.post('/games/wordle/check', data);
        console.log('checkWordleGuess API response:', response);
        
        // Kiểm tra và tiêu chuẩn hóa định dạng dữ liệu phản hồi
        if (response?.data) {
          // Trường hợp 1: API trả về đúng định dạng với success và data
          if (response.data.success && response.data.data) {
            const responseData = response.data.data;

            // Kiểm tra xem có đầy đủ dữ liệu Wordle không
            if (responseData.result &&
                Array.isArray(responseData.result) &&
                responseData.letterStates &&
                typeof responseData.isCorrect === 'boolean') {
              console.log('API trả về đúng định dạng Wordle data');
              return {
                success: true,
                data: responseData
              };
            }
          }

          // Trường hợp 2: API trả về trực tiếp (không có success wrapper)
          if (response.data.result &&
              Array.isArray(response.data.result) &&
              typeof response.data.isCorrect === 'boolean') {
            console.log('API trả về trực tiếp định dạng Wordle');
            return {
              success: true,
              data: response.data
            };
          }

          // Trường hợp 3: API trả về thành công nhưng thiếu dữ liệu result
          if (response.data.success && !response.data.data?.result) {
            console.log('API phản hồi thành công nhưng thiếu dữ liệu result, sử dụng client-side check');
            const clientResult = checkWordleGuessClientSide(data.guess, data.targetWord);
            return {
              success: true,
              data: clientResult
            };
          }
        }
        
        // Nếu không xác định được định dạng phản hồi, dùng client-side check
        console.log('Không xác định được định dạng phản hồi API, sử dụng client-side check');
        const clientResult = checkWordleGuessClientSide(data.guess, data.targetWord);
        return {
          success: true,
          data: clientResult
        };
      } catch (apiError) {
        console.error('API error in checkWordleGuess:', apiError);
        
        // Fallback: kiểm tra từ phía client nếu API lỗi
        console.log('Dùng fallback client-side check');
        const clientResult = checkWordleGuessClientSide(data.guess, data.targetWord);
        
        return {
          success: true,
          data: clientResult
        };
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra đoán:', error);
      return handleError(error);
    }
  },
  
  // Lấy gợi ý cho Wordle
  getWordleHint: async (data) => {
    try {
      const response = await api.post('/games/wordle/hint', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý:', error);
      return handleError(error);
    }
  },

  // === Word Chain Management APIs ===

  // Lấy danh sách từ vựng cho game nối từ
  getWordChainWords: async (page = 1, limit = 20, searchTerm = '') => {
    try {
      const params = { page, limit };
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/games/word-chain/words', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Thêm từ mới cho game nối từ
  addWordChainWord: async (wordData) => {
    try {
      const response = await api.post('/games/word-chain/words', wordData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Cập nhật từ trong game nối từ
  updateWordChainWord: async (id, wordData) => {
    try {
      const response = await api.put(`/games/word-chain/words/${id}`, wordData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Xóa từ trong game nối từ
  deleteWordChainWord: async (id) => {
    try {
      const response = await api.delete(`/games/word-chain/words/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Import nhiều từ cùng lúc cho game nối từ
  bulkImportWordChainWords: async (wordsData) => {
    try {
      const response = await api.post('/games/word-chain/words/bulk-import', { words: wordsData });
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

// Service cho quản lý từ vựng Wordle
export const wordleWordAPI = {
  // Lấy danh sách từ vựng
  getWords: async (page = 1, limit = 20, options = {}) => {
    try {
      const params = { page, limit, ...options };
      const response = await api.get('/wordle-words', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy chi tiết từ vựng
  getWordById: async (id) => {
    try {
      const response = await api.get(`/wordle-words/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Thêm từ vựng mới
  addWord: async (wordData) => {
    try {
      const response = await api.post('/wordle-words', wordData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Cập nhật từ vựng
  updateWord: async (id, wordData) => {
    try {
      const response = await api.put(`/wordle-words/${id}`, wordData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Xóa từ vựng
  deleteWord: async (id) => {
    try {
      const response = await api.delete(`/wordle-words/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Nhập hàng loạt từ vựng
  bulkImportWords: async (wordsData) => {
    try {
      const response = await api.post('/wordle-words/bulk-import', { words: wordsData });
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

// Service for Guess Who Admin
export const guessWhoAPI = {
  // Lấy danh sách nhân vật (admin)
  getCharacters: async (page = 1, limit = 10, search = '') => {
    try {
      const params = { page, limit, search };
      const response = await api.get('/games/guess-who/admin/characters', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Lấy chi tiết một nhân vật (admin)
  getCharacterById: async (id) => {
    try {
      const response = await api.get(`/games/guess-who/admin/characters/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Tạo nhân vật mới (admin)
  createCharacter: async (characterData) => {
    try {
      const response = await api.post('/games/guess-who/admin/characters', characterData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Cập nhật nhân vật (admin)
  updateCharacter: async (id, characterData) => {
    try {
      const response = await api.put(`/games/guess-who/admin/characters/${id}`, characterData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Xóa nhân vật (admin)
  deleteCharacter: async (id) => {
    try {
      const response = await api.delete(`/games/guess-who/admin/characters/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return handleError(error);
    }
  }
};

export default api;