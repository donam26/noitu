/**
 * File hỗ trợ di chuyển dữ liệu từ các bảng câu hỏi cũ sang bảng Question mới
 */
const { 
  QuizQuestion, 
  BehaviorQuestion, 
  KnowledgeQuestion, 
  Question, 
  sequelize 
} = require('../models');

/**
 * Di chuyển dữ liệu từ bảng QuizQuestion sang Question
 */
const migrateQuizQuestions = async () => {
  try {
    console.log('Bắt đầu di chuyển dữ liệu từ QuizQuestion...');
    
    // Lấy tất cả câu hỏi từ bảng cũ
    const quizQuestions = await QuizQuestion.findAll();
    
    if (quizQuestions.length === 0) {
      console.log('Không có dữ liệu trong bảng QuizQuestion.');
      return;
    }
    
    // Chuyển đổi định dạng dữ liệu
    const questionData = quizQuestions.map(quiz => ({
      question: quiz.question,
      options: quiz.options,
      correct_answer: quiz.correct_answer,
      explanation: quiz.explanation,
      created_by: quiz.created_by,
      type: 'quiz',
      created_at: quiz.created_at,
      updated_at: quiz.updated_at
    }));
    
    // Tạo bản ghi mới trong bảng Question
    await Question.bulkCreate(questionData);
    
    console.log(`✅ Đã di chuyển ${questionData.length} câu hỏi từ QuizQuestion sang Question.`);
  } catch (error) {
    console.error('❌ Lỗi khi di chuyển dữ liệu từ QuizQuestion:', error);
  }
};

/**
 * Di chuyển dữ liệu từ bảng BehaviorQuestion sang Question
 */
const migrateBehaviorQuestions = async () => {
  try {
    console.log('Bắt đầu di chuyển dữ liệu từ BehaviorQuestion...');
    
    // Lấy tất cả câu hỏi từ bảng cũ
    const behaviorQuestions = await BehaviorQuestion.findAll();
    
    if (behaviorQuestions.length === 0) {
      console.log('Không có dữ liệu trong bảng BehaviorQuestion.');
      return;
    }
    
    // Chuyển đổi định dạng dữ liệu
    const questionData = behaviorQuestions.map(behavior => ({
      question: behavior.question,
      options: behavior.options,
      correct_answer: behavior.correct_answer,
      explanation: behavior.explanation,
      category: behavior.category,
      difficulty: behavior.difficulty,
      created_by: behavior.created_by,
      type: 'behavior',
      created_at: behavior.created_at,
      updated_at: behavior.updated_at
    }));
    
    // Tạo bản ghi mới trong bảng Question
    await Question.bulkCreate(questionData);
    
    console.log(`✅ Đã di chuyển ${questionData.length} câu hỏi từ BehaviorQuestion sang Question.`);
  } catch (error) {
    console.error('❌ Lỗi khi di chuyển dữ liệu từ BehaviorQuestion:', error);
  }
};

/**
 * Di chuyển dữ liệu từ bảng KnowledgeQuestion sang Question
 */
const migrateKnowledgeQuestions = async () => {
  try {
    console.log('Bắt đầu di chuyển dữ liệu từ KnowledgeQuestion...');
    
    // Lấy tất cả câu hỏi từ bảng cũ
    const knowledgeQuestions = await KnowledgeQuestion.findAll();
    
    if (knowledgeQuestions.length === 0) {
      console.log('Không có dữ liệu trong bảng KnowledgeQuestion.');
      return;
    }
    
    // Chuyển đổi định dạng dữ liệu
    const questionData = knowledgeQuestions.map(knowledge => ({
      question: knowledge.question,
      options: knowledge.options,
      correct_answer: knowledge.correct_answer,
      explanation: knowledge.explanation,
      category: knowledge.category,
      difficulty: knowledge.difficulty,
      created_by: knowledge.created_by,
      type: 'knowledge',
      created_at: knowledge.created_at,
      updated_at: knowledge.updated_at
    }));
    
    // Tạo bản ghi mới trong bảng Question
    await Question.bulkCreate(questionData);
    
    console.log(`✅ Đã di chuyển ${questionData.length} câu hỏi từ KnowledgeQuestion sang Question.`);
  } catch (error) {
    console.error('❌ Lỗi khi di chuyển dữ liệu từ KnowledgeQuestion:', error);
  }
};

/**
 * Thực hiện di chuyển toàn bộ dữ liệu từ các bảng cũ sang bảng mới
 */
const migrateAllQuestions = async () => {
  try {
    console.log('🚀 Bắt đầu quá trình di chuyển dữ liệu...');
    
    // Bắt đầu một transaction để đảm bảo tính nhất quán
    const transaction = await sequelize.transaction();
    
    try {
      await migrateQuizQuestions();
      await migrateBehaviorQuestions();
      await migrateKnowledgeQuestions();
      
      await transaction.commit();
      console.log('✅ Di chuyển dữ liệu hoàn tất.');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('❌ Lỗi trong quá trình di chuyển dữ liệu:', error);
  }
};

// Export các hàm
module.exports = {
  migrateQuizQuestions,
  migrateBehaviorQuestions,
  migrateKnowledgeQuestions,
  migrateAllQuestions
}; 