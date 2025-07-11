const express = require('express');
const router = express.Router();
const behaviorController = require('../controllers/behaviorQuizController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', behaviorController.getQuestions);
router.post('/random', behaviorController.getRandomQuestion);

// Protected routes
router.post('/', authenticate, behaviorController.createQuestion);
router.put('/:id', authenticate, behaviorController.updateQuestion);
router.delete('/:id', authenticate, behaviorController.deleteQuestion);
router.post('/bulk', authenticate, behaviorController.bulkCreateQuestions);

module.exports = router; 