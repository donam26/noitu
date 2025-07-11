const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authenticate
router.use(authenticate);

// CRUD routes
router.get('/', quizController.getQuestions);
router.post('/', isAdmin, quizController.createQuestion);
router.put('/:id', isAdmin, quizController.updateQuestion);
router.delete('/:id', isAdmin, quizController.deleteQuestion);

// Bulk actions
router.post('/bulk', isAdmin, quizController.bulkCreateQuestions);

// Export để sử dụng trong file index
module.exports = router; 