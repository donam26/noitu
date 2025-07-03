/**
 * Configuration cho game "Câu trả lời từ vũ trụ"
 * Sử dụng AI để trả lời thay vì data tĩnh
 */

// System prompt cho AI
export const UNIVERSE_SYSTEM_PROMPT = `Bạn là "Tiên tri vũ trụ" - một AI thông thái và hài hước, chuyên trả lời câu hỏi theo phong cách Magic 8-Ball nhưng sáng tạo hơn.

NHIỆM VỤ:
- Trả lời câu hỏi của người dùng theo 3 hướng: YES (tích cực), NO (tiêu cực), hoặc MAYBE (trung tính)
- Câu trả lời phải hài hước, sáng tạo, có liên quan đến vũ trụ, không gian, thiên văn học
- Độ dài: 1-2 câu, tối đa 150 ký tự
- Luôn bắt đầu bằng emoji phù hợp
- Phong cách: Vui nhộn, không quá nghiêm túc, có chút thần bí

CẤU TRÚC TRẢ LỜI:
- [Emoji] [Câu trả lời chính] [Lý do vũ trụ/hài hước]

VÍ DỤ:
- "🌟 Chắc chắn rồi! Các vì sao đã xếp hàng để nói YES!"
- "❌ Không! Lỗ đen vừa nuốt chửng ý tưởng này!"
- "🤔 Có thể... Vũ trụ đang tung xúc xắc quantum!"

LƯU Ý:
- Không đưa ra lời khuyên y tế, tài chính nghiêm túc
- Giữ tính giải trí, tránh nội dung tiêu cực thật sự
- Có thể tham khảo: thiên hà, sao, hành tinh, UFO, astronaut, black hole, etc.
- Luôn trả lời bằng tiếng Việt
- Chỉ trả lời câu trả lời, không giải thích thêm`;

/**
 * Mapping loại câu trả lời với metadata
 */
export const ANSWER_TYPES = {
  yes: {
    emoji: '✅',
    color: '#28a745',
    label: 'Tích cực'
  },
  no: {
    emoji: '❌', 
    color: '#dc3545',
    label: 'Tiêu cực'
  },
  maybe: {
    emoji: '🤔',
    color: '#ffc107', 
    label: 'Trung tính'
  }
};

/**
 * Lấy gợi ý câu hỏi mẫu
 * @returns {string} Câu hỏi gợi ý
 */
export const getSuggestedQuestion = () => {
  const suggestions = [
    "Tôi có nên thay đổi công việc không?",
    "Hôm nay có phải là ngày may mắn của tôi?",
    "Liệu tôi có tìm được tình yêu đích thực?",
    "Tôi có nên đầu tư vào crypto không?",
    "Liệu món phở hôm nay có ngon?",
    "Tôi có nên xem phim này không?",
    "Liệu trời mai có mưa?",
    "Tôi có nên mua chiếc điện thoại mới?",
    "Liệu tôi có đậu kỳ thi sắp tới?",
    "Đội bóng yêu thích có thắng không?",
    "Tôi có nên đi du lịch vào cuối tuần?",
    "Liệu crush có thích tôi không?",
    "Tôi có nên học thêm kỹ năng mới?",
    "Liệu hôm nay có ai nhớ sinh nhật tôi?",
    "Tôi có nên thay đổi kiểu tóc không?",
    "Liệu tôi có gặp người đặc biệt hôm nay?",
    "Tôi có nên ăn pizza hay salad?",
    "Liệu game mới có hay không?",
    "Tôi có nên ngủ sớm hôm nay?",
    "Liệu tuần sau có nhiều việc không?",
    "Tôi có nên confess với crush không?",
    "Liệu việc học AI có tương lai?",
    "Tôi có nên mở startup không?",
    "Liệu hôm nay có tin vui?",
    "Tôi có nên chơi game thêm 1 tiếng?"
  ];
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};

/**
 * Fallback answers khi AI không khả dụng
 */
export const FALLBACK_ANSWERS = {
  yes: [
    "🌟 Chắc chắn rồi! Vũ trụ đang gật đầu mạnh!",
    "✨ Hoàn toàn đúng! Các vì sao đã xếp hàng để nói YES!",
    "🚀 Tất nhiên! Ngay cả người ngoài hành tinh cũng đồng ý!",
    "🌈 Có! Và cầu vồng cũng xuất hiện để chứng minh!",
    "⭐ Đương nhiên! Vũ trụ vừa tạo ra một ngôi sao mới để ăn mừng!"
  ],
  no: [
    "🌑 Không! Vũ trụ đang lắc đầu mạnh!",
    "❌ Các vì sao đã bật đèn đỏ!",
    "🚫 Người ngoài hành tinh đang nói NO!",
    "🌪️ Bão vũ trụ đang cuốn phăng ý tưởng này!",
    "⚡ Sét đánh! Đây là một NO sấm sét!"
  ],
  maybe: [
    "🤔 Có thể... Vũ trụ đang suy nghĩ!",
    "🌓 Maybe! Mặt trăng đang do dự!",
    "🎭 Plot twist đang được viết...",
    "🌊 Sóng probability đang dao động!",
    "🎲 Vũ trụ đang tung xúc xắc quantum!"
  ]
};

/**
 * Lấy fallback answer khi AI fail
 * @returns {Object} Câu trả lời fallback
 */
export const getFallbackAnswer = () => {
  const types = ['yes', 'no', 'maybe'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const answers = FALLBACK_ANSWERS[randomType];
  const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
  
  return {
    text: randomAnswer,
    type: randomType,
    emoji: ANSWER_TYPES[randomType].emoji,
    color: ANSWER_TYPES[randomType].color,
    timestamp: Date.now(),
    source: 'fallback'
  };
};

/**
 * Phân tích loại câu trả lời từ AI response
 * @param {string} aiResponse - Câu trả lời từ AI
 * @returns {string} Loại: 'yes', 'no', hoặc 'maybe'
 */
export const detectAnswerType = (aiResponse) => {
  const response = aiResponse.toLowerCase();
  
  // Keywords cho YES
  const yesKeywords = ['có', 'chắc chắn', 'tất nhiên', 'hoàn toàn', 'đúng', 'yes', 'được', 'rồi', 'ừm', 'có thể có'];
  
  // Keywords cho NO  
  const noKeywords = ['không', 'chưa', 'thôi', 'nope', 'chết', 'miss', 'cấm', 'từ chối', 'no', 'sai'];
  
  // Keywords cho MAYBE
  const maybeKeywords = ['có thể', 'maybe', 'hmm', 'chưa chắc', 'tùy', 'không biết', 'suy nghĩ'];
  
  // Check MAYBE trước (vì có thể chứa "có thể")
  if (maybeKeywords.some(keyword => response.includes(keyword))) {
    return 'maybe';
  }
  
  // Check YES
  if (yesKeywords.some(keyword => response.includes(keyword))) {
    return 'yes';
  }
  
  // Check NO
  if (noKeywords.some(keyword => response.includes(keyword))) {
    return 'no';
  }
  
  // Default fallback - random
  const types = ['yes', 'no', 'maybe'];
  return types[Math.floor(Math.random() * types.length)];
};

/**
 * Backward compatibility - giữ các functions cũ
 */
export const getAnswerEmoji = (type) => {
  return ANSWER_TYPES[type]?.emoji || '🤔';
};

export const getAnswerColor = (type) => {
  return ANSWER_TYPES[type]?.color || '#6c757d';
}; 