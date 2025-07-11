const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const quizRoutes = require('./quizRoutes');
const knowledgeRoutes = require('./knowledgeRoutes');
const behaviorRoutes = require('./behaviorRoutes');

// Routes chính
router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/behavior', behaviorRoutes);

// Route kiểm tra trạng thái API
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API đang hoạt động',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handler cho route không tồn tại
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại'
  });
});

module.exports = router; 