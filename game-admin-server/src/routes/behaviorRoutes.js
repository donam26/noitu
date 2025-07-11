const express = require('express');
const router = express.Router();
const behaviorQuizController = require('../controllers/behaviorQuizController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authenticate
router.use(authenticate);

// CRUD routes
router.get('/', behaviorQuizController.getQuestions);
router.post('/', isAdmin, behaviorQuizController.createQuestion);
router.put('/:id', isAdmin, behaviorQuizController.updateQuestion);
router.delete('/:id', isAdmin, behaviorQuizController.deleteQuestion);

// Bulk actions
router.post('/bulk', isAdmin, behaviorQuizController.bulkCreateQuestions);

// Export để sử dụng trong file index
module.exports = router; 