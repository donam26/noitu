const express = require('express');
const router = express.Router();
const knowledgeQuizController = require('../controllers/knowledgeQuizController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authenticate
router.use(authenticate);

// CRUD routes
router.get('/', knowledgeQuizController.getQuestions);
router.post('/', isAdmin, knowledgeQuizController.createQuestion);
router.put('/:id', isAdmin, knowledgeQuizController.updateQuestion);
router.delete('/:id', isAdmin, knowledgeQuizController.deleteQuestion);

// Bulk actions
router.post('/bulk', isAdmin, knowledgeQuizController.bulkCreateQuestions);

// Export để sử dụng trong file index
module.exports = router; 