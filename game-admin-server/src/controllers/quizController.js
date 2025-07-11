const { QuizQuestion } = require('../models');
const fs = require('fs').promises;
const path = require('path');
const sequelize = require('sequelize'); // Added for Op.notIn

/**
 * Lấy danh sách câu hỏi quiz
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Tính toán offset
    const offset = (page - 1) * limit;
    
    // Truy vấn database
    const { count, rows: questions } = await QuizQuestion.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách câu hỏi quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Tạo câu hỏi quiz mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!question || !Array.isArray(options) || options.length < 2 || correctAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin câu hỏi, các lựa chọn và đáp án đúng'
      });
    }
    
    // Tạo câu hỏi mới
    const newQuestion = await QuizQuestion.create({
      question,
      options,
      correct_answer: correctAnswer,
      explanation,
      created_by: req.admin.id
    });
    
    // Không cập nhật file JS nữa
    // await updateQuizQuestionsFile();
    
    return res.status(201).json({
      success: true,
      message: 'Tạo câu hỏi thành công',
      data: newQuestion
    });
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Cập nhật câu hỏi quiz
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctAnswer, explanation } = req.body;
    
    // Tìm câu hỏi cần cập nhật
    const quizQuestion = await QuizQuestion.findByPk(id);
    
    if (!quizQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      });
    }
    
    // Cập nhật thông tin
    if (question) quizQuestion.question = question;
    if (options) quizQuestion.options = options;
    if (correctAnswer !== undefined) quizQuestion.correct_answer = correctAnswer;
    if (explanation !== undefined) quizQuestion.explanation = explanation;
    
    await quizQuestion.save();
    
    // Không cập nhật file JS nữa
    // await updateQuizQuestionsFile();
    
    return res.status(200).json({
      success: true,
      message: 'Cập nhật câu hỏi thành công',
      data: quizQuestion
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật câu hỏi quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Xóa câu hỏi quiz
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm câu hỏi cần xóa
    const quizQuestion = await QuizQuestion.findByPk(id);
    
    if (!quizQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      });
    }
    
    // Xóa câu hỏi
    await quizQuestion.destroy();
    
    // Không cập nhật file JS nữa
    // await updateQuizQuestionsFile();
    
    return res.status(200).json({
      success: true,
      message: 'Xóa câu hỏi thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa câu hỏi quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Cập nhật file JavaScript từ database
 */
const updateQuizQuestionsFile = async () => {
  try {
    // Lấy tất cả câu hỏi từ database
    const questions = await QuizQuestion.findAll({
      order: [['id', 'ASC']]
    });
    
    // Chuyển đổi format từ database sang format file JS
    const formattedQuestions = questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation || ''
    }));
    
    // Tạo nội dung file
    const fileContent = `/**
 * Data câu hỏi cho game "Hỏi Ngu"
 * Mỗi câu hỏi có cấu trúc:
 * - question: Nội dung câu hỏi
 * - options: Mảng 4 lựa chọn
 * - correctAnswer: Index của đáp án đúng (0-3)
 * - explanation: Giải thích đáp án (optional)
 */

export const quizQuestions = ${JSON.stringify(formattedQuestions, null, 2)};

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
`;
    
    // Ghi file
    const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'quizQuestions.js');
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    console.log('✅ Đã cập nhật file quizQuestions.js thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file quizQuestions.js:', error);
    throw error;
  }
};

/**
 * Thêm nhiều câu hỏi cùng lúc
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkCreateQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mảng các câu hỏi'
      });
    }
    
    // Thêm created_by vào mỗi câu hỏi
    const questionsWithCreator = questions.map(q => ({
      ...q,
      created_by: req.admin.id
    }));
    
    // Tạo nhiều câu hỏi
    const createdQuestions = await QuizQuestion.bulkCreate(questionsWithCreator);
    
    // Không cập nhật file JS nữa
    // await updateQuizQuestionsFile();
    
    return res.status(201).json({
      success: true,
      message: `Đã thêm thành công ${createdQuestions.length} câu hỏi`,
      data: {
        count: createdQuestions.length
      }
    });
  } catch (error) {
    console.error('Lỗi khi thêm nhiều câu hỏi:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Lấy câu hỏi ngẫu nhiên
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRandomQuestion = async (req, res) => {
  try {
    const { usedQuestions = [] } = req.body;
    
    // Tìm các câu hỏi chưa được sử dụng
    const availableQuestions = await QuizQuestion.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: usedQuestions
        }
      }
    });
    
    // Nếu không còn câu hỏi nào
    if (availableQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Đã hết câu hỏi, vui lòng reset'
      });
    }
    
    // Chọn câu hỏi ngẫu nhiên
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    // Format lại câu hỏi theo cấu trúc frontend cần
    const formattedQuestion = {
      question: selectedQuestion.question,
      options: selectedQuestion.options,
      correctAnswer: selectedQuestion.correct_answer,
      explanation: selectedQuestion.explanation || ''
    };
    
    return res.status(200).json({
      success: true,
      data: {
        question: formattedQuestion,
        index: selectedQuestion.id
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy câu hỏi ngẫu nhiên:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateQuizQuestionsFile,
  bulkCreateQuestions,
  getRandomQuestion
}; 