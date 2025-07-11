/**
 * Logic cho game "Câu trả lời từ vũ trụ"
 * Sử dụng AI để trả lời thông minh thay vì data tĩnh
 */

// KHÔNG import từ file data nữa
// import { 
//   UNIVERSE_SYSTEM_PROMPT, 
//   getSuggestedQuestion,
//   getFallbackAnswer,
//   detectAnswerType,
//   ANSWER_TYPES
// } from '../data/universeAnswerData';

// Định nghĩa các constants cần thiết thay vì import
const UNIVERSE_SYSTEM_PROMPT = `Bạn là "Vũ trụ vạn năng", một trò chơi dự đoán tương lai đơn giản cho trẻ em. 
Khi người chơi đặt câu hỏi, bạn luôn trả lời ngắn gọn với 1-3 câu, theo một trong ba kiểu:
1. Khẳng định rõ ràng - trả lời có/đúng vậy/chắc chắn... (khi bạn nghĩ câu trả lời là khẳng định)
2. Phủ định rõ ràng - trả lời không/không đâu/sai rồi... (khi bạn nghĩ câu trả lời là phủ định)
3. Mơ hồ/không chắc chắn - trả lời có thể/không chắc/tùy... (khi bạn không chắc chắn)

QUAN TRỌNG: Luôn trả lời dưới 30 từ, giọng điệu vui vẻ, thân thiện và thần bí. Đây là trò chơi cho trẻ em nên đảm bảo nội dung phù hợp. Trả lời bằng tiếng Việt.`;

// Định nghĩa các loại câu trả lời
const ANSWER_TYPES = {
  yes: {
    emoji: '✅',
    color: '#28a745',
    keywords: ['có', 'đúng', 'chắc chắn', 'sẽ', 'nên', 'tốt', 'ok', 'được']
  },
  no: {
    emoji: '❌',
    color: '#dc3545',
    keywords: ['không', 'chưa', 'đừng', 'sai', 'không nên', 'chẳng', 'sẽ không']
  },
  maybe: {
    emoji: '❓',
    color: '#ffc107',
    keywords: ['có thể', 'không chắc', 'tùy', 'còn tùy', 'phụ thuộc', 'khó', 'tham khảo']
  }
};

/**
 * Phát hiện loại câu trả lời
 * @param {string} answer - Câu trả lời cần phân loại
 * @returns {string} Loại câu trả lời: yes/no/maybe
 */
const detectAnswerType = (answer) => {
  const text = answer.toLowerCase();
  
  // Kiểm tra từ khóa yes
  if (ANSWER_TYPES.yes.keywords.some(keyword => text.includes(keyword))) {
    return 'yes';
  }
  
  // Kiểm tra từ khóa no
  if (ANSWER_TYPES.no.keywords.some(keyword => text.includes(keyword))) {
    return 'no';
  }
  
  // Mặc định là maybe
  return 'maybe';
};

/**
 * Lấy câu trả lời mặc định khi không có API
 * @returns {Object} Câu trả lời mặc định
 */
const getFallbackAnswer = () => {
  const answers = [
    {
      text: "Có thể lắm! Nhưng tương lai luôn thay đổi.",
      type: "maybe"
    },
    {
      text: "Vũ trụ nói: Có! Điều đó sẽ xảy ra.",
      type: "yes"
    },
    {
      text: "Không đâu, hãy thử một hướng khác.",
      type: "no"
    },
    {
      text: "Vũ trụ đang mơ hồ về điều này...",
      type: "maybe"
    }
  ];
  
  const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
  return {
    text: randomAnswer.text,
    type: randomAnswer.type,
    emoji: ANSWER_TYPES[randomAnswer.type].emoji,
    color: ANSWER_TYPES[randomAnswer.type].color,
    timestamp: Date.now(),
    source: 'fallback'
  };
};

/**
 * Gợi ý câu hỏi ngẫu nhiên
 * @returns {string} Câu hỏi gợi ý
 */
const getSuggestedQuestion = () => {
  const questions = [
    "Tôi có nên học thêm môn thể thao mới không?",
    "Ngày mai trời có nắng đẹp không?",
    "Tôi có nên nói với bạn về ý tưởng của mình?",
    "Tôi có thể trở thành phi hành gia trong tương lai?",
    "Có nên ăn kem vào buổi tối nay?",
    "Tôi có thể học giỏi hơn trong kỳ học tới?",
    "Bạn thân của tôi có đang nghĩ về tôi không?",
    "Tôi sẽ đi du lịch nước ngoài năm nay chứ?",
    "Tôi có thể gặp được thần tượng của mình không?",
    "Sẽ có điều kỳ diệu xảy ra với tôi trong tuần này?"
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
};

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
 * Format thời gian người dùng dễ đọc
 * @param {number} timestamp - Timestamp
 * @returns {string} Thời gian đã format
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  
  if (diffMin < 1) {
    return "Vừa xong";
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffMin < 1440) {
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours} giờ trước`;
  } else {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('vi-VN', options);
  }
};

/**
 * Kiểm tra xem có API key không
 * @returns {boolean} Có hay không
 */
export const hasAPIKey = () => {
  return !!API_KEY;
}; 