/**
 * Data câu hỏi cho game "Hỏi Ngu"
 * Mỗi câu hỏi có cấu trúc:
 * - question: Nội dung câu hỏi
 * - options: Mảng 4 lựa chọn
 * - correctAnswer: Index của đáp án đúng (0-3)
 * - explanation: Giải thích đáp án (optional)
 */

export const quizQuestions = [
  {
    "question": "Tại sao gà trống không đẻ trứng?",
    "options": [
      "Vì gà trống ăn ít",
      "Vì gà trống không có bầu",
      "Vì gà trống không biết đẻ",
      "Vì gà trống là con đực"
    ],
    "correctAnswer": 3,
    "explanation": "Gà trống là con đực nên không đẻ trứng"
  },
  {
    "question": "Cái gì có 4 chân mà không đi được?",
    "options": [
      "Con mèo bị liệt",
      "Cái bàn",
      "Con chó ngủ",
      "Xe máy"
    ],
    "correctAnswer": 1,
    "explanation": "Cái bàn có 4 chân nhưng không thể đi"
  },
  {
    "question": "Tại sao con cá không nói được?",
    "options": [
      "Vì cá không có thanh quản",
      "Vì cá sống dưới nước",
      "Vì cá câm",
      "Vì cá không biết tiếng người"
    ],
    "correctAnswer": 1,
    "explanation": "Cá sống dưới nước nên không thể nói (cũng vì không có thanh quản)"
  },
  {
    "question": "Cái gì đi mà không chân, khóc mà không mắt?",
    "options": [
      "Con ma",
      "Đám mây",
      "Cơn mưa",
      "Làn khói"
    ],
    "correctAnswer": 2,
    "explanation": "Mưa đi (rơi) mà không có chân, khóc (rơi) mà không có mắt"
  },
  {
    "question": "Tại sao người ta không thể chụp ảnh với ánh sáng tím?",
    "options": [
      "Vì ánh sáng tím quá yếu",
      "Vì máy ảnh không thấy màu tím",
      "Vì có thể chụp được bình thường",
      "Vì ánh sáng tím có hại"
    ],
    "correctAnswer": 2,
    "explanation": "Đây là câu hỏi đánh lừa - hoàn toàn có thể chụp ảnh với ánh sáng tím"
  },
  {
    "question": "Con gì vừa đen vừa trắng vừa đỏ?",
    "options": [
      "Con ngựa vằn bị thương",
      "Con chim cánh cụt xấu hổ",
      "Con báo đang ngủ",
      "Con mèo tam thể"
    ],
    "correctAnswer": 1,
    "explanation": "Chim cánh cụt đen trắng, xấu hổ nên đỏ mặt"
  },
  {
    "question": "Cái gì càng rửa càng bẩn?",
    "options": [
      "Chiếc khăn cũ",
      "Nước rửa chén",
      "Nước",
      "Miếng bọt biển"
    ],
    "correctAnswer": 2,
    "explanation": "Nước càng rửa (rửa nhiều thứ) thì càng bẩn"
  },
  {
    "question": "Tại sao đảo Phú Quốc lại có tên là Phú Quốc?",
    "options": [
      "Vì đảo giàu có",
      "Vì tên người phát hiện",
      "Vì có nhiều phú ông",
      "Tôi không biết, bạn tự tra google đi"
    ],
    "correctAnswer": 3,
    "explanation": "Đây là câu hỏi troll - người chơi phải tự tìm hiểu"
  },
  {
    "question": "Cái gì to hơn Chúa, ác hơn ma quỷ, người nghèo có, người giàu cần, ăn vào chết?",
    "options": [
      "Tiền bạc",
      "Tình yêu",
      "Không có gì cả",
      "Sự tham lam"
    ],
    "correctAnswer": 2,
    "explanation": "Không có gì to hơn Chúa, ác hơn ma, người nghèo có không có gì, người giàu cần không có gì, ăn không có gì vào sẽ chết"
  },
  {
    "question": "Tại sao Nokia 1280 không thể chạy được game PUBG?",
    "options": [
      "Vì màn hình quá nhỏ",
      "Vì không có internet",
      "Vì pin yếu",
      "Vì đây là điện thoại đời cũ"
    ],
    "correctAnswer": 3,
    "explanation": "Nokia 1280 là điện thoại cơ bản, không phải smartphone"
  },
  {
    "question": "Làm sao để nhốt 1 con voi vào tủ lạnh?",
    "options": [
      "Mở tủ lạnh, nhốt voi vào, đóng tủ lạnh",
      "Cần tủ lạnh to hơn",
      "Không thể làm được",
      "Làm voi nhỏ lại"
    ],
    "correctAnswer": 0,
    "explanation": "Đây là câu hỏi logic đơn giản: mở, nhốt, đóng"
  },
  {
    "question": "Làm sao để nhốt 1 con hươu cao cổ vào tủ lạnh?",
    "options": [
      "Mở tủ lạnh, nhốt hươu cao cổ vào, đóng tủ lạnh",
      "Làm hươu cao cổ nhỏ lại",
      "Mở tủ lạnh, lôi voi ra, nhốt hươu cao cổ vào, đóng tủ lạnh",
      "Mua tủ lạnh to hơn"
    ],
    "correctAnswer": 2,
    "explanation": "Phải lôi con voi ra trước (từ câu hỏi trước) mới nhốt hươu cao cổ vào"
  },
  {
    "question": "Sư tử triệu tập cuộc họp, tất cả động vật đều đến. Con gì không đến?",
    "options": [
      "Con chuột (sợ sư tử)",
      "Con hươu cao cổ (đang ở trong tủ lạnh)",
      "Con voi (quá to)",
      "Con cá (ở dưới nước)"
    ],
    "correctAnswer": 1,
    "explanation": "Hươu cao cổ đang ở trong tủ lạnh (từ câu hỏi trước) nên không đến được"
  },
  {
    "question": "Bạn cần qua sông, nhưng sông có cá sấu. Làm sao để qua an toàn?",
    "options": [
      "Bơi thật nhanh",
      "Dùng thuyền",
      "Bơi bình thường, vì cá sấu đang đi họp sư tử",
      "Đi vòng"
    ],
    "correctAnswer": 2,
    "explanation": "Tất cả động vật đều đi họp sư tử (từ câu hỏi trước) nên cá sấu không có ở sông"
  },
  {
    "question": "Cái gì có thể đi khắp thế giới mà chỉ đứng ở một góc?",
    "options": [
      "Con tem",
      "Cái la bàn",
      "Viên đá",
      "Tấm bản đồ"
    ],
    "correctAnswer": 0,
    "explanation": "Con tem dán ở góc thư, có thể đi khắp thế giới"
  },
  {
    "question": "Tại sao máy bay lại bay được?",
    "options": [
      "Vì có động cơ mạnh",
      "Vì có cánh",
      "Vì có phi công giỏi",
      "Vì tôi không rảnh giải thích vật lý"
    ],
    "correctAnswer": 3,
    "explanation": "Câu trả lời troll - thực tế do lực nâng từ cánh máy bay"
  },
  {
    "question": "Cái gì có thể bay mà không có cánh, khóc mà không có mắt, đi mà không có chân?",
    "options": [
      "Con ma",
      "Đám mây",
      "Cơn gió",
      "Âm thanh"
    ],
    "correctAnswer": 1,
    "explanation": "Đám mây bay trên trời, khóc (mưa), đi (di chuyển) mà không có chân"
  },
  {
    "question": "Tại sao người ta gọi là 'ngủ như chết' mà không gọi là 'chết như ngủ'?",
    "options": [
      "Vì ngủ thoải mái hơn",
      "Vì chết không thể ngủ",
      "Vì đây là thành ngữ",
      "Vì chết không thể tỉnh dậy"
    ],
    "correctAnswer": 3,
    "explanation": "Chết thì không thể tỉnh dậy như ngủ"
  },
  {
    "question": "Cái gì đen khi mua, đỏ khi dùng, xám khi vứt đi?",
    "options": [
      "Than củi",
      "Giấy than",
      "Bút chì",
      "Tro bụi"
    ],
    "correctAnswer": 0,
    "explanation": "Than củi: đen khi mua, đỏ khi cháy (dùng), xám (tro) khi vứt"
  }
];

/**
 * Lấy câu hỏi ngẫu nhiên từ danh sách
 * @param {Array} usedQuestions - Mảng index các câu đã sử dụng
 * @returns {Object} - Object chứa câu hỏi và index
 */
export const getRandomQuestion = (usedQuestions = []) => {
  const availableQuestions = quizQuestions.filter((_, index) => 
    !usedQuestions.includes(index)
  );
  
  if (availableQuestions.length === 0) {
    return null; // Hết câu hỏi
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  
  // Tìm index thật trong mảng gốc
  const originalIndex = quizQuestions.findIndex(q => 
    q.question === selectedQuestion.question
  );
  
  return {
    question: selectedQuestion,
    index: originalIndex
  };
};

/**
 * Lấy tổng số câu hỏi
 * @returns {Number} - Số lượng câu hỏi
 */
export const getTotalQuestions = () => quizQuestions.length;
