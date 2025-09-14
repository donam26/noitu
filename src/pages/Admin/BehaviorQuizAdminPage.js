import React from 'react';
import QuizManager from '../../components/Admin/QuizManager';
import './BehaviorQuizAdminPage.css';

const BehaviorQuizAdminPage = () => {
  return (
    <div className="behavior-quiz-admin-page">
      <QuizManager quizType="behavior" title='Quản lý câu hỏi "Vua Ứng Xử"' />
    </div>
  );
};

export default BehaviorQuizAdminPage;