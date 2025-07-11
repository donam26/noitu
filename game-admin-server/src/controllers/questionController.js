const { Question, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Lấy danh sách câu hỏi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type = null, 
      category = null, 
      difficulty = null 
    } = req.query;
    
    // Tính toán offset dựa trên trang và giới hạn
    const offset = (page - 1) * limit;
    
    // Xây dựng điều kiện truy vấn
    const whereConditions = {};
    
    if (type) {
      whereConditions.type = type;
    }
    
    if (category) {
      whereConditions.category = category;
    }
    
    if (difficulty) {
      whereConditions.difficulty = difficulty;
    }
    
    // Thực hiện truy vấn với phân trang
    const { count, rows } = await Question.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: totalPages
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách câu hỏi:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách câu hỏi'
    });
  }
};

/**
 * Lấy chi tiết một câu hỏi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết câu hỏi:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy chi tiết câu hỏi'
    });
  }
};

/**
 * Tạo câu hỏi mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createQuestion = async (req, res) => {
  try {
    const { 
      question, 
      options, 
      correct_answer, 
      explanation, 
      category, 
      difficulty, 
      type 
    } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ. Câu hỏi và các lựa chọn là bắt buộc.'
      });
    }
    
    if (correct_answer === undefined || correct_answer < 0 || correct_answer >= options.length) {
      return res.status(400).json({
        success: false,
        message: 'Đáp án đúng không hợp lệ'
      });
    }
    
    // Lấy ID của người tạo từ request
    const created_by = req.user ? req.user.id : null;
    
    // Tạo câu hỏi mới
    const newQuestion = await Question.create({
      question,
      options,
      correct_answer,
      explanation,
      category,
      difficulty,
      type,
      created_by
    });
    
    return res.status(201).json({
      success: true,
      message: 'Tạo câu hỏi thành công',
      data: newQuestion
    });
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo câu hỏi'
    });
  }
};

/**
 * Cập nhật câu hỏi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      question, 
      options, 
      correct_answer, 
      explanation, 
      category, 
      difficulty 
    } = req.body;
    
    // Tìm câu hỏi cần cập nhật
    const existingQuestion = await Question.findByPk(id);
    
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      });
    }
    
    // Kiểm tra và cập nhật dữ liệu
    if (options && Array.isArray(options) && options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cần ít nhất 2 lựa chọn'
      });
    }
    
    if (correct_answer !== undefined && options && 
        (correct_answer < 0 || correct_answer >= options.length)) {
      return res.status(400).json({
        success: false,
        message: 'Đáp án đúng không hợp lệ'
      });
    }
    
    // Cập nhật câu hỏi
    await existingQuestion.update({
      question: question || existingQuestion.question,
      options: options || existingQuestion.options,
      correct_answer: correct_answer !== undefined ? correct_answer : existingQuestion.correct_answer,
      explanation: explanation !== undefined ? explanation : existingQuestion.explanation,
      category: category !== undefined ? category : existingQuestion.category,
      difficulty: difficulty || existingQuestion.difficulty
    });
    
    return res.status(200).json({
      success: true,
      message: 'Cập nhật câu hỏi thành công',
      data: existingQuestion
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật câu hỏi:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật câu hỏi'
    });
  }
};

/**
 * Xóa câu hỏi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm câu hỏi cần xóa
    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi'
      });
    }
    
    // Xóa câu hỏi
    await question.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Xóa câu hỏi thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa câu hỏi:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa câu hỏi'
    });
  }
};

/**
 * Lấy câu hỏi ngẫu nhiên theo loại
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRandomQuestion = async (req, res) => {
  try {
    const { type, exclude = '', category = null, difficulty = null } = req.query;
    
    // Xây dựng điều kiện truy vấn
    const whereConditions = {};
    
    if (type) {
      whereConditions.type = type;
    }
    
    if (category) {
      whereConditions.category = category;
    }
    
    if (difficulty) {
      whereConditions.difficulty = difficulty;
    }
    
    // Loại trừ câu hỏi đã sử dụng
    if (exclude) {
      const excludeIds = exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (excludeIds.length > 0) {
        whereConditions.id = {
          [Op.notIn]: excludeIds
        };
      }
    }
    
    // Lấy câu hỏi ngẫu nhiên
    const randomQuestion = await Question.findOne({
      where: whereConditions,
      order: sequelize.random()
    });
    
    if (!randomQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi phù hợp'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: randomQuestion
    });
  } catch (error) {
    console.error('Lỗi khi lấy câu hỏi ngẫu nhiên:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy câu hỏi ngẫu nhiên'
    });
  }
}; 