const { KnowledgeQuestion } = require('../models');
const fs = require('fs').promises;
const path = require('path');

/**
 * Lấy danh sách câu hỏi kiến thức
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Tính toán offset
    const offset = (page - 1) * limit;
    
    // Truy vấn database
    const { count, rows: questions } = await KnowledgeQuestion.findAndCountAll({
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
    console.error('Lỗi khi lấy danh sách câu hỏi kiến thức:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Tạo câu hỏi kiến thức mới
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
    const newQuestion = await KnowledgeQuestion.create({
      question,
      options,
      correct_answer: correctAnswer,
      explanation,
      category,
      difficulty,
      created_by: req.admin?.id
    });
    
    // Cập nhật file JavaScript
    await updateKnowledgeQuestionsFile();
    
    return res.status(201).json({
      success: true,
      message: 'Tạo câu hỏi kiến thức thành công',
      data: newQuestion
    });
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi kiến thức:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Cập nhật câu hỏi kiến thức
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctAnswer, explanation, category, difficulty } = req.body;
    
    // Tìm câu hỏi cần cập nhật
    const knowledgeQuestion = await KnowledgeQuestion.findByPk(id);
    
    if (!knowledgeQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi kiến thức'
      });
    }
    
    // Cập nhật thông tin
    if (question) knowledgeQuestion.question = question;
    if (options) knowledgeQuestion.options = options;
    if (correctAnswer !== undefined) knowledgeQuestion.correct_answer = correctAnswer;
    if (explanation !== undefined) knowledgeQuestion.explanation = explanation;
    if (category) knowledgeQuestion.category = category;
    if (difficulty) knowledgeQuestion.difficulty = difficulty;
    
    await knowledgeQuestion.save();
    
    // Cập nhật file JavaScript
    await updateKnowledgeQuestionsFile();
    
    return res.status(200).json({
      success: true,
      message: 'Cập nhật câu hỏi kiến thức thành công',
      data: knowledgeQuestion
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật câu hỏi kiến thức:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Xóa câu hỏi kiến thức
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm câu hỏi cần xóa
    const knowledgeQuestion = await KnowledgeQuestion.findByPk(id);
    
    if (!knowledgeQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi kiến thức'
      });
    }
    
    // Xóa câu hỏi
    await knowledgeQuestion.destroy();
    
    // Cập nhật file JavaScript
    await updateKnowledgeQuestionsFile();
    
    return res.status(200).json({
      success: true,
      message: 'Xóa câu hỏi kiến thức thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa câu hỏi kiến thức:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Cập nhật file JavaScript từ database
 */
const updateKnowledgeQuestionsFile = async () => {
  try {
    // Lấy tất cả câu hỏi từ database
    const questions = await KnowledgeQuestion.findAll({
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
 * Data câu hỏi cho game "Vua Kiến Thức"
 * Mỗi câu hỏi có cấu trúc:
 * - question: Nội dung câu hỏi
 * - options: Mảng các lựa chọn
 * - correctAnswer: Index của đáp án đúng (0-3)
 * - explanation: Giải thích đáp án (optional)
 * - category: Danh mục câu hỏi (optional)
 * - difficulty: Độ khó: easy, medium, hard (optional)
 */

export const knowledgeQuestions = ${JSON.stringify(formattedQuestions, null, 2)};

/**
 * Lấy câu hỏi kiến thức ngẫu nhiên từ danh sách
 * @param {Array} usedQuestions - Mảng index các câu đã sử dụng
 * @param {String} category - Danh mục câu hỏi (optional)
 * @returns {Object} - Object chứa câu hỏi và index
 */
export const getRandomKnowledgeQuestion = (usedQuestions = [], category = null) => {
  // Lọc theo danh mục nếu có
  let filteredQuestions = category 
    ? knowledgeQuestions.filter(q => q.category === category)
    : knowledgeQuestions;
  
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
  const originalIndex = knowledgeQuestions.findIndex(q => 
    q.question === selectedQuestion.question
  );
  
  return {
    question: selectedQuestion,
    index: originalIndex
  };
};

/**
 * Lấy tổng số câu hỏi kiến thức
 * @returns {Number} - Số lượng câu hỏi
 */
export const getTotalKnowledgeQuestions = () => knowledgeQuestions.length;
`;
    
    // Ghi file
    const filePath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'knowledgeQuestions.js');
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    console.log('✅ Đã cập nhật file knowledgeQuestions.js thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file knowledgeQuestions.js:', error);
    throw error;
  }
};

/**
 * Thêm nhiều câu hỏi kiến thức cùng lúc
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkCreateQuestions = async (req, res) => {
  try {
    const questions = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mảng các câu hỏi kiến thức'
      });
    }
    
    // Thêm created_by vào mỗi câu hỏi
    const questionsWithCreator = questions.map(q => ({
      ...q,
      created_by: req.admin?.id
    }));
    
    // Tạo nhiều câu hỏi
    const createdQuestions = await KnowledgeQuestion.bulkCreate(questionsWithCreator);
    
    // Cập nhật file JavaScript
    await updateKnowledgeQuestionsFile();
    
    return res.status(201).json({
      success: true,
      message: `Đã thêm thành công ${createdQuestions.length} câu hỏi kiến thức`,
      data: {
        count: createdQuestions.length
      }
    });
  } catch (error) {
    console.error('Lỗi khi thêm nhiều câu hỏi kiến thức:', error);
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
  bulkCreateQuestions,
  updateKnowledgeQuestionsFile
}; 