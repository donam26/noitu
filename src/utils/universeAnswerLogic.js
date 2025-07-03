/**
 * Logic cho game "Câu trả lời từ vũ trụ"
 * Sử dụng AI để trả lời thông minh thay vì data tĩnh
 */

import { 
  UNIVERSE_SYSTEM_PROMPT, 
  getSuggestedQuestion,
  getFallbackAnswer,
  detectAnswerType,
  ANSWER_TYPES
} from '../data/universeAnswerData';

// API key từ environment (giống admin)
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

/**
 * Validate câu hỏi của người dùng
 * @param {string} question - Câu hỏi người dùng nhập
 * @returns {Object} Kết quả validation
 */
export const validateQuestion = (question) => {
  if (!question || question.trim().length === 0) {
    return {
      isValid: false,
      error: "Hãy nhập câu hỏi của bạn!"
    };
  }

  if (question.trim().length < 3) {
    return {
      isValid: false,
      error: "Câu hỏi quá ngắn! Tối thiểu 3 ký tự."
    };
  }

  if (question.trim().length > 200) {
    return {
      isValid: false,
      error: "Câu hỏi quá dài! Tối đa 200 ký tự."
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Gọi OpenAI API để trả lời câu hỏi (giống như admin)
 * @param {string} question - Câu hỏi từ người dùng
 * @returns {Promise<Object>} Promise chứa câu trả lời từ AI
 */
export const getAIUniverseAnswer = async (question) => {
  try {
    if (!API_KEY) {
      console.warn('OpenAI API key not configured, using fallback');
      return getFallbackAnswer();
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: UNIVERSE_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 150,
        temperature: 0.9
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    const answerType = detectAnswerType(aiResponse);
    
    return {
      text: aiResponse,
      type: answerType,
      emoji: ANSWER_TYPES[answerType].emoji,
      color: ANSWER_TYPES[answerType].color,
      timestamp: Date.now(),
      source: 'ai'
    };

  } catch (error) {
    console.warn('AI call failed, using fallback:', error);
    return getFallbackAnswer();
  }
};

/**
 * Xử lý câu hỏi và trả về kết quả
 * @param {string} question - Câu hỏi từ người dùng
 * @returns {Promise<Object>} Promise chứa kết quả xử lý
 */
export const processQuestion = async (question) => {
  // Validate input
  const validation = validateQuestion(question);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    // Get AI answer
    const answer = await getAIUniverseAnswer(question);
    
    return {
      success: true,
      answer: answer,
      question: question.trim()
    };
    
  } catch (error) {
    console.error('Error processing question:', error);
    
    return {
      success: false,
      error: "Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại!"
    };
  }
};

/**
 * Hiệu ứng đánh máy typewriter
 * @param {string} text - Text cần hiển thị
 * @param {Function} callback - Callback để cập nhật text hiển thị
 * @param {number} speed - Tốc độ đánh máy (ms)
 * @returns {Function} Function để cancel typewriter
 */
export const typeMessage = (text, callback, speed = 50) => {
  let i = 0;
  let isCancelled = false;
  
  const typeWriter = () => {
    if (isCancelled || i >= text.length) {
      return;
    }
    
    callback(text.substring(0, i + 1));
    i++;
    setTimeout(typeWriter, speed);
  };
  
  typeWriter();
  
  // Return cancel function
  return () => {
    isCancelled = true;
  };
};

/**
 * Lưu lịch sử câu hỏi vào localStorage
 * @param {Object} questionData - Dữ liệu câu hỏi và trả lời
 */
export const saveQuestionHistory = (questionData) => {
  try {
    const history = getQuestionHistory();
    const newEntry = {
      id: Date.now(),
      question: questionData.question,
      answer: questionData.answer,
      timestamp: Date.now()
    };
    
    // Giữ tối đa 50 câu hỏi gần nhất
    const updatedHistory = [newEntry, ...history].slice(0, 50);
    
    localStorage.setItem('universeQuestionHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    console.warn('Không thể lưu lịch sử câu hỏi:', error);
  }
};

/**
 * Lấy lịch sử câu hỏi từ localStorage
 * @returns {Array} Mảng lịch sử câu hỏi
 */
export const getQuestionHistory = () => {
  try {
    const history = localStorage.getItem('universeQuestionHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.warn('Không thể đọc lịch sử câu hỏi:', error);
    return [];
  }
};

/**
 * Xóa lịch sử câu hỏi
 */
export const clearQuestionHistory = () => {
  try {
    localStorage.removeItem('universeQuestionHistory');
  } catch (error) {
    console.warn('Không thể xóa lịch sử câu hỏi:', error);
  }
};

/**
 * Lấy thống kê câu trả lời
 * @returns {Object} Thống kê
 */
export const getAnswerStatistics = () => {
  const history = getQuestionHistory();
  
  if (history.length === 0) {
    return {
      total: 0,
      yes: 0,
      no: 0,
      maybe: 0
    };
  }
  
  const stats = history.reduce((acc, entry) => {
    if (entry.answer && entry.answer.type) {
      acc[entry.answer.type] = (acc[entry.answer.type] || 0) + 1;
    }
    return acc;
  }, { yes: 0, no: 0, maybe: 0 });
  
  return {
    total: history.length,
    ...stats
  };
};

/**
 * Lấy câu hỏi gợi ý ngẫu nhiên
 * @returns {string} Câu hỏi gợi ý
 */
export const getRandomSuggestedQuestion = () => {
  return getSuggestedQuestion();
};

/**
 * Format thời gian hiển thị
 * @param {number} timestamp - Timestamp
 * @returns {string} Thời gian đã format
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return "Vừa xong";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInMinutes < 1440) {
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} giờ trước`;
  } else {
    return date.toLocaleDateString('vi-VN');
  }
};

/**
 * Kiểm tra xem có API key được cấu hình không
 * @returns {boolean} True nếu có API key
 */
export const hasAPIKey = () => {
  return !!API_KEY;
}; 