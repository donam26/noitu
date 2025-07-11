const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeQuizController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', knowledgeController.getQuestions);
router.post('/random', knowledgeController.getRandomQuestion);

// Protected routes
router.post('/', authenticate, knowledgeController.createQuestion);
router.put('/:id', authenticate, knowledgeController.updateQuestion);
router.delete('/:id', authenticate, knowledgeController.deleteQuestion);
router.post('/bulk', authenticate, knowledgeController.bulkCreateQuestions);

module.exports = router; 