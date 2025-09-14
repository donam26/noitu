import React from 'react';
import QuizManager from '../../components/Admin/QuizManager';
import './KnowledgeQuizAdminPage.css';

const KnowledgeQuizAdminPage = () => {
  return (
    <div className="knowledge-quiz-admin-page">
      <QuizManager quizType="knowledge" title='Quản lý câu hỏi "Vua Kiến Thức"' />
    </div>
  );
};

export default KnowledgeQuizAdminPage;