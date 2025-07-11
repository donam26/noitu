const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');

// Routes công khai
router.get('/questions', questionController.getQuestions);
router.get('/questions/:id', questionController.getQuestionById);
router.get('/random', questionController.getRandomQuestion);

// Routes yêu cầu xác thực
router.post('/questions', authMiddleware.authenticate, questionController.createQuestion);
router.put('/questions/:id', authMiddleware.authenticate, questionController.updateQuestion);
router.delete('/questions/:id', authMiddleware.authenticate, questionController.deleteQuestion);

module.exports = router; 