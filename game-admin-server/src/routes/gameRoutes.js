const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Public routes
router.get('/guess-who', gameController.getGuessWhoData);
router.get('/universe-answer', gameController.getUniverseAnswerData);
router.get('/wordle', gameController.getWordleData);

module.exports = router; 