const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', quizController.getQuestions);
router.post('/random', quizController.getRandomQuestion);

// Protected routes
router.post('/', authenticate, quizController.createQuestion);
router.put('/:id', authenticate, quizController.updateQuestion);
router.delete('/:id', authenticate, quizController.deleteQuestion);
router.post('/bulk', authenticate, quizController.bulkCreateQuestions);

module.exports = router; 