const { BehaviorQuestion, sequelize } = require('../models');
const fs = require('fs').promises;
const path = require('path');

/**
 * Lấy câu hỏi ngẫu nhiên
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRandomQuestion = async (req, res) => {
  try {
    const { usedQuestions = [], category = null } = req.body;
    
    // Xây dựng điều kiện truy vấn
    const whereCondition = {
      id: {
        [sequelize.Op.notIn]: usedQuestions
      }
    };
    
    // Thêm điều kiện category nếu có
    if (category) {
      whereCondition.category = category;
    }
    
    // Tìm các câu hỏi chưa được sử dụng
    const availableQuestions = await BehaviorQuestion.findAll({
      where: whereCondition
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
      explanation: selectedQuestion.explanation || '',
      category: selectedQuestion.category || '',
      difficulty: selectedQuestion.difficulty || 'medium'
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

/**
 * Lấy danh sách tất cả câu hỏi hành vi
 */
const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    // Tính toán offset
    const offset = (page - 1) * limit;
    
    // Xây dựng điều kiện truy vấn
    const whereCondition = {};
    
    // Thêm điều kiện category nếu có
    if (category) {
      whereCondition.category = category;
    }
    
    // Truy vấn database
    const { count, rows: questions } = await BehaviorQuestion.findAndCountAll({
      where: whereCondition,
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
    console.error('Lỗi khi lấy danh sách câu hỏi hành vi:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Tạo câu hỏi ứng xử mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, category, difficulty } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!question || !Array.isArray(options) || options.length < 2 || correctAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin câu hỏi, các lựa chọn và đáp án đúng'
      });
    }
    
    // Tạo câu hỏi mới
    const newQuestion = await BehaviorQuestion.create({
      question,
      options,
      correct_answer: correctAnswer,
      explanation,
      category,
      difficulty,
      created_by: req.admin?.id
    });
    
    // Cập nhật file JavaScript
    await updateBehaviorQuestionsFile();
    
    return res.status(201).json({
      success: true,
      message: 'Tạo câu hỏi ứng xử thành công',
      data: newQuestion
    });
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi ứng xử:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Cập nhật câu hỏi ứng xử
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctAnswer, explanation, category, difficulty } = req.body;
    
    // Tìm câu hỏi cần cập nhật
    const behaviorQuestion = await BehaviorQuestion.findByPk(id);
    
    if (!behaviorQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi ứng xử'
      });
    }
    
    // Cập nhật thông tin
    if (question) behaviorQuestion.question = question;
    if (options) behaviorQuestion.options = options;
    if (correctAnswer !== undefined) behaviorQuestion.correct_answer = correctAnswer;
    if (explanation !== undefined) behaviorQuestion.explanation = explanation;
    if (category) behaviorQuestion.category = category;
    if (difficulty) behaviorQuestion.difficulty = difficulty;
    
    await behaviorQuestion.save();
    
    // Cập nhật file JavaScript
    await updateBehaviorQuestionsFile();
    
    return res.status(200).json({
      success: true,
      message: 'Cập nhật câu hỏi ứng xử thành công',
      data: behaviorQuestion
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật câu hỏi ứng xử:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Xóa câu hỏi ứng xử
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm câu hỏi cần xóa
    const behaviorQuestion = await BehaviorQuestion.findByPk(id);
    
    if (!behaviorQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi ứng xử'
      });
    }
    
    // Xóa câu hỏi
    await behaviorQuestion.destroy();
    
    // Cập nhật file JavaScript
    await updateBehaviorQuestionsFile();
    
    return res.status(200).json({
      success: true,
      message: 'Xóa câu hỏi ứng xử thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa câu hỏi ứng xử:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Cập nhật file JavaScript từ database
 */
const updateBehaviorQuestionsFile = async () => {
  try {
    // Lấy tất cả câu hỏi từ database
    const questions = await BehaviorQuestion.findAll({
      order: [['id', 'ASC']]
    });
    
    // Chuyển đổi format từ database sang format file JS
    const formattedQuestions = questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation || '',
      category: q.category || '',
      difficulty: q.difficulty || 'medium'
    }));
    
    // Tạo nội dung file
    const fileContent = `/**
 * Data câu hỏi cho game "Vua Ứng Xử"
 * Mỗi câu hỏi có cấu trúc:
 * - question: Nội dung câu hỏi
 * - options: Mảng các lựa chọn
 * - correctAnswer: Index của đáp án đúng (0-3)
 * - explanation: Giải thích đáp án (optional)
 * - category: Danh mục câu hỏi (optional)
 * - difficulty: Độ khó: easy, medium, hard (optional)
 */

export const behaviorQuestions = ${JSON.stringify(formattedQuestions, null, 2)};

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
`;
    
    // Ghi file
    const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'behaviorQuestions.js');
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    console.log('✅ Đã cập nhật file behaviorQuestions.js thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file behaviorQuestions.js:', error);
    throw error;
  }
};

/**
 * Thêm nhiều câu hỏi ứng xử cùng lúc
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkCreateQuestions = async (req, res) => {
  try {
    const questions = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mảng các câu hỏi ứng xử'
      });
    }
    
    // Thêm created_by vào mỗi câu hỏi
    const questionsWithCreator = questions.map(q => ({
      ...q,
      created_by: req.admin?.id
    }));
    
    // Tạo nhiều câu hỏi
    const createdQuestions = await BehaviorQuestion.bulkCreate(questionsWithCreator);
    
    // Cập nhật file JavaScript
    await updateBehaviorQuestionsFile();
    
    return res.status(201).json({
      success: true,
      message: `Đã thêm thành công ${createdQuestions.length} câu hỏi ứng xử`,
      data: {
        count: createdQuestions.length
      }
    });
  } catch (error) {
    console.error('Lỗi khi thêm nhiều câu hỏi ứng xử:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  getRandomQuestion,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  updateBehaviorQuestionsFile
}; 