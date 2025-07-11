/**
 * Data câu hỏi cho game "Vua Ứng Xử"
 * Mỗi câu hỏi có cấu trúc:
 * - question: Nội dung câu hỏi
 * - options: Mảng các lựa chọn
 * - correctAnswer: Index của đáp án đúng (0-3)
 * - explanation: Giải thích đáp án (optional)
 * - category: Danh mục câu hỏi (optional)
 * - difficulty: Độ khó: easy, medium, hard (optional)
 */

export const behaviorQuestions = [
  {
    "question": "Khi thấy người già cần giúp đỡ, em nên:",
    "options": [
      "Làm ngơ và đi qua",
      "Chủ động giúp đỡ trong khả năng của mình",
      "Chỉ giúp nếu có người nhờ",
      "Chờ người khác giúp trước"
    ],
    "correctAnswer": 1,
    "explanation": "Việc giúp đỡ người già thể hiện lòng nhân ái và truyền thống tôn kính của người Việt Nam",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi sử dụng mạng xã hội, em KHÔNG nên:",
    "options": [
      "Chia sẻ thông tin cá nhân với người lạ",
      "Đăng những bài viết tích cực",
      "Tôn trọng quyền riêng tư của người khác",
      "Báo cáo nội dung không phù hợp"
    ],
    "correctAnswer": 0,
    "explanation": "Không bao giờ chia sẻ thông tin cá nhân với người lạ trên mạng để bảo vệ an toàn bản thân",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Ở trường, khi thấy bạn bị bắt nạt, em nên:",
    "options": [
      "Không can thiệp vì sợ bị liên lụy",
      "Báo cáo ngay cho giáo viên",
      "Cười theo những kẻ bắt nạt",
      "Quay video đăng lên mạng"
    ],
    "correctAnswer": 1,
    "explanation": "Bắt nạt học đường là hành vi sai trái, cần báo cáo cho người lớn để được xử lý kịp thời",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi đi xe buýt, em nên:",
    "options": [
      "Chen lấn để lên xe trước",
      "Nhường ghế cho người già, bà bầu",
      "Nói chuyện to, làm ồn",
      "Không trả tiền vé"
    ],
    "correctAnswer": 1,
    "explanation": "Nhường ghế cho người có hoàn cảnh khó khăn thể hiện tính văn minh và lịch sự",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi làm sai, em nên:",
    "options": [
      "Đổ lỗi cho người khác",
      "Thừa nhận sai lầm và xin lỗi",
      "Giấu giếm không cho ai biết",
      "Cãi lại cho có lý"
    ],
    "correctAnswer": 1,
    "explanation": "Dũng cảm nhận lỗi và xin lỗi là phẩm chất tốt giúp em trưởng thành",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi thấy rác trên đường, em nên:",
    "options": [
      "Làm ngơ vì không phải rác của mình",
      "Nhặt rác bỏ vào thùng rác",
      "Đạp rác sang một bên",
      "Vứt thêm rác của mình"
    ],
    "correctAnswer": 1,
    "explanation": "Bảo vệ môi trường là trách nhiệm của mọi công dân, dù nhỏ tuổi",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Trong gia đình, khi bố mẹ nói chuyện, em nên:",
    "options": [
      "Nghe ngóng chuyện của người lớn",
      "Tôn trọng và không chen vào",
      "Làm ồn để thu hút sự chú ý",
      "Đòi hỏi bố mẹ nghe mình nói"
    ],
    "correctAnswer": 1,
    "explanation": "Tôn trọng và biết điều là phẩm chất cần có trong gia đình",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi mượn đồ của bạn, em nên:",
    "options": [
      "Mượn rồi quên trả",
      "Giữ gìn cẩn thận và trả đúng hẹn",
      "Mượn mà không cần hỏi",
      "Trả khi nào nhớ thì trả"
    ],
    "correctAnswer": 1,
    "explanation": "Giữ lời hứa và trân trọng đồ của người khác thể hiện sự tôn trọng",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi tham gia giao thông, em KHÔNG được:",
    "options": [
      "Đội mũ bảo hiểm khi đi xe máy",
      "Đi xe đạp trên vỉa hè có người đi bộ",
      "Tuân thủ đèn tín hiệu giao thông",
      "Đi đúng làn đường quy định"
    ],
    "correctAnswer": 1,
    "explanation": "Vỉa hè dành cho người đi bộ, xe đạp phải đi trên đường hoặc làn xe đạp",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Để thể hiện tình yêu quê hương, em nên:",
    "options": [
      "Chỉ quan tâm đến bản thân",
      "Học tập chăm chỉ và làm việc có ích",
      "Chê bai quê hương mình",
      "Không quan tâm đến cộng đồng"
    ],
    "correctAnswer": 1,
    "explanation": "Học tập tốt và đóng góp cho xã hội là cách thể hiện tình yêu quê hương",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi thấy bạn học kém, em nên:",
    "options": [
      "Chế giễu và xa lánh bạn ấy",
      "Giúp đỡ bạn trong khả năng của mình",
      "Làm ngơ không quan tâm",
      "Khoe khoang mình giỏi hơn"
    ],
    "correctAnswer": 1,
    "explanation": "Tinh thần tương trợ giúp đỡ nhau trong học tập là đạo đức tốt",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi sử dụng Internet, em NEN tránh:",
    "options": [
      "Tìm kiếm thông tin học tập",
      "Truy cập các trang web không phù hợp với tuổi",
      "Liên lạc với gia đình",
      "Xem video giáo dục"
    ],
    "correctAnswer": 1,
    "explanation": "Cần tránh các nội dung không phù hợp độ tuổi để bảo vệ sự phát triển lành mạnh",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Trong lớp học, khi giáo viên giảng bài, em nên:",
    "options": [
      "Nói chuyện riêng với bạn",
      "Chăm chú lắng nghe và ghi chép",
      "Ngủ gật vì buồn ngủ",
      "Chơi game trên điện thoại"
    ],
    "correctAnswer": 1,
    "explanation": "Tập trung học tập thể hiện sự tôn trọng thầy cô và tiếp thu kiến thức hiệu quả",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi được mời ăn, em nên:",
    "options": [
      "Ăn hết tất cả món ngon",
      "Ăn một cách lịch sự và biết điều",
      "Chê món ăn không ngon",
      "Yêu cầu nấu lại theo ý mình"
    ],
    "correctAnswer": 1,
    "explanation": "Ăn uống lịch sự và biết điều thể hiện sự tôn trọng chủ nhà",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi đi tham quan bảo tàng, em KHÔNG nên:",
    "options": [
      "Lắng nghe hướng dẫn viên giải thích",
      "Chạm vào các hiện vật",
      "Quan sát kỹ các tác phẩm",
      "Hỏi những điều thắc mắc"
    ],
    "correctAnswer": 1,
    "explanation": "Không được chạm vào hiện vật để bảo vệ tài sản văn hóa",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Để bảo vệ quyền trẻ em, mỗi em cần:",
    "options": [
      "Chỉ quan tâm đến quyền của mình",
      "Biết về quyền và nghĩa vụ của mình",
      "Không cần biết gì về pháp luật",
      "Chỉ nghe theo người lớn"
    ],
    "correctAnswer": 1,
    "explanation": "Hiểu biết về quyền và nghĩa vụ giúp trẻ em bảo vệ bản thân và tôn trọng người khác",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi chứng kiến tai nạn giao thông, em nên:",
    "options": [
      "Đứng xem cho vui",
      "Gọi cấp cứu và báo người lớn",
      "Chạy về nhà ngay",
      "Chụp ảnh đăng mạng xã hội"
    ],
    "correctAnswer": 1,
    "explanation": "Gọi cấp cứu kịp thời có thể cứu sống người bị nạn",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Khi tham gia hoạt động nhóm, em nên:",
    "options": [
      "Chỉ làm theo ý mình",
      "Hợp tác và lắng nghe ý kiến của mọi người",
      "Không tham gia ý kiến",
      "Bỏ về nếu không được như ý"
    ],
    "correctAnswer": 1,
    "explanation": "Tinh thần hợp tác và dân chủ giúp nhóm hoạt động hiệu quả",
    "category": "",
    "difficulty": "medium"
  },
  {
    "question": "Đối với người khuyết tật, em nên:",
    "options": [
      "Tránh xa vì sợ lây bệnh",
      "Tôn trọng và giúp đỡ khi cần thiết",
      "Chỉ trỏ và bàn tán",
      "Cười nhạo và chế giễu"
    ],
    "correctAnswer": 1,
    "explanation": "Mọi người đều có quyền được tôn trọng và bình đẳng trong xã hội",
    "category": "",
    "difficulty": "medium"
  }
];

/**
 * Lấy câu hỏi ứng xử ngẫu nhiên từ danh sách
 * @param {Array} usedQuestions - Mảng index các câu đã sử dụng
 * @param {String} category - Danh mục câu hỏi (optional)
 * @returns {Object} - Object chứa câu hỏi và index
 */
export const getRandomBehaviorQuestion = (usedQuestions = [], category = null) => {
  // Lọc theo danh mục nếu có
  let filteredQuestions = category 
    ? behaviorQuestions.filter(q => q.category === category)
    : behaviorQuestions;
  
  // Lọc bỏ các câu đã sử dụng
  const availableQuestions = filteredQuestions.filter((_, index) => 
    !usedQuestions.includes(index)
  );
  
  if (availableQuestions.length === 0) {
    return null; // Hết câu hỏi
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  
  // Tìm index thật trong mảng gốc
  const originalIndex = behaviorQuestions.findIndex(q => 
    q.question === selectedQuestion.question
  );
  
  return {
    question: selectedQuestion,
    index: originalIndex
  };
};

/**
 * Lấy tổng số câu hỏi ứng xử
 * @returns {Number} - Số lượng câu hỏi
 */
export const getTotalBehaviorQuestions = () => behaviorQuestions.length;
