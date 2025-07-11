/**
 * Behavior Quiz Seeder - Tạo dữ liệu mẫu cho câu hỏi trò chơi "Vua Ứng Xử"
 */
const fs = require('fs').promises;
const path = require('path');
const { BehaviorQuestion } = require('../models');

const seedBehaviorQuestions = async () => {
  try {
    // Kiểm tra số lượng câu hỏi hiện có
    const questionCount = await BehaviorQuestion.count();
    
    if (questionCount > 0) {
      console.log(`ℹ️ Đã có ${questionCount} câu hỏi Behavior trong hệ thống. Bỏ qua seeding.`);
      return false;
    }
    
    // Dữ liệu mẫu nếu không thể đọc từ file
    const sampleQuestions = [
      {
        question: "Bạn đang đi trên đường thì thấy một người lớn tuổi bị ngã. Bạn sẽ làm gì?",
        options: [
          "Đi qua như không thấy gì",
          "Dừng lại và giúp đỡ họ",
          "Chụp ảnh đăng lên mạng xã hội",
          "Gọi người khác đến giúp"
        ],
        correct_answer: 1,
        explanation: "Hành động đúng đắn là dừng lại và giúp đỡ người lớn tuổi"
      },
      {
        question: "Khi bạn vô tình làm đổ đồ uống của người khác, bạn nên làm gì?",
        options: [
          "Bỏ đi nhanh chóng",
          "Đổ lỗi cho người khác",
          "Xin lỗi và đề nghị mua đồ uống mới",
          "Cười và cho rằng đó chỉ là tai nạn nhỏ"
        ],
        correct_answer: 2,
        explanation: "Cách ứng xử đúng là thừa nhận lỗi, xin lỗi và khắc phục hậu quả"
      },
      {
        question: "Khi bạn đang tham gia một cuộc họp quan trọng và điện thoại đổ chuông, bạn nên làm gì?",
        options: [
          "Trả lời điện thoại ngay lập tức",
          "Để điện thoại tiếp tục đổ chuông",
          "Tắt chuông và tiếp tục cuộc họp",
          "Ra ngoài để trả lời điện thoại"
        ],
        correct_answer: 2,
        explanation: "Trong cuộc họp quan trọng, nên tắt chuông điện thoại để không làm phiền người khác"
      },
      {
        question: "Khi bạn không đồng ý với ý kiến của đồng nghiệp, cách phản hồi phù hợp là gì?",
        options: [
          "Công khai chỉ trích ý kiến đó trước mọi người",
          "Lờ đi và không nói gì",
          "Trình bày quan điểm khác một cách tôn trọng",
          "Nói với người khác về ý kiến sai lầm của đồng nghiệp"
        ],
        correct_answer: 2,
        explanation: "Khi không đồng ý, nên bày tỏ ý kiến một cách tôn trọng và xây dựng"
      },
      {
        question: "Khi bạn được mời đến nhà bạn bè ăn tối, bạn nên làm gì?",
        options: [
          "Đến muộn để thể hiện sự thoải mái",
          "Mang theo một món quà nhỏ",
          "Tự nhiên lấy đồ ăn trong tủ lạnh",
          "Phàn nàn nếu món ăn không hợp khẩu vị"
        ],
        correct_answer: 1,
        explanation: "Mang theo món quà nhỏ là cách thể hiện sự biết ơn và tôn trọng"
      }
    ];
    
    // Thử đọc dữ liệu từ file
    try {
      const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'behaviorQuestions.js');
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Trích xuất mảng behaviorQuestions từ nội dung file
      const questionsMatch = fileContent.match(/export\s+const\s+behaviorQuestions\s*=\s*(\[[\s\S]*?\]);/);
      
      if (questionsMatch && questionsMatch[1]) {
        // Chuyển đổi string thành mảng object
        const questionsStr = questionsMatch[1].replace(/export\s+const\s+\w+\s*=\s*/, '');
        const questions = eval(questionsStr);
        
        // Chuyển đổi format
        const questionsToCreate = questions.map(q => ({
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || ''
        }));
        
        // Tạo các bản ghi trong database
        await BehaviorQuestion.bulkCreate(questionsToCreate);
        console.log(`✅ Đã import ${questionsToCreate.length} câu hỏi Behavior từ file gốc`);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Không thể đọc file behaviorQuestions.js:', error.message);
    }
    
    // Nếu không thể đọc từ file, sử dụng dữ liệu mẫu
    await BehaviorQuestion.bulkCreate(sampleQuestions);
    console.log(`✅ Đã tạo ${sampleQuestions.length} câu hỏi Behavior mẫu`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu câu hỏi Behavior:', error);
    throw error;
  }
};

module.exports = seedBehaviorQuestions; 