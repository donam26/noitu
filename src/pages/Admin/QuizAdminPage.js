import React from 'react';
import QuizManager from '../../components/Admin/QuizManager';
import './QuizAdminPage.css';

/**
 * QuizAdminPage - Trang quản lý câu hỏi Vua Hỏi Ngu
 */
const QuizAdminPage = () => {
  return (
    <div className="quiz-admin-page">
      <QuizManager />
    </div>
  );
};

export default QuizAdminPage; 